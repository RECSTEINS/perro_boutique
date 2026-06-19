//Edge Function: procesar-pago-efectivo
//Proceso por el cual generamos el pago mediante OXXO

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

Deno.serve(async(req) => {
  if(req.method === "OPTIONS"){
    return new Response("ok",{headers: corsHeaders});
  }

  try{
    const { items, contacto, direccion, envio } = await req.json();

    if(!items || items.length === 0){
      return jsonError("El carrito está vacío.", 400);
    }
    if(!contacto?.email || !contacto?.phone || !contacto?.fullName){
      return jsonError("Faltan datos de contacto.", 400);
    }
    if(!direccion || !envio){
      return jsonError("Faltan datos de envío.", 400)
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const variantIds = items.map((it: any) => it.variantId);
    const {data: variantesReales, error: errVariantes} = await supabaseAdmin.from("product_variants")
      .select("id, size, price_cents, stock, products(name)").in("id", variantIds);

    if(errVariantes || !variantesReales){
      console.error("Error al leer variantes: ", errVariantes);
      return jsonError("No se pudieron verificar los productos.", 500);
    }

    const itemsValidados = [];
    let subtotalCents = 0;

    for (const item of items){
      const variante = variantesReales.find((v: any) => v.id === item.variantId);

      if(!variante){
        return jsonError(`Un producto de tu carrito ya no está disponible.`, 409);
      }
      if(variante.stock < item.quantity){
        return jsonError(`No hay suficiente stock de un producto (quedan ${variante.stock})`, 409);
      }

      const precioReal = variante.price_cents;
      subtotalCents += precioReal * item.quantity;

      itemsValidados.push({
        variantId: variante.id,
        productName: variante.products?.name || "Producto",
        size: variante.size,
        priceCents: precioReal,
        quantity: item.quantity
      });
    }

    const shippingCents = Number(envio.priceCents) || 0;
    const totalCents = subtotalCents + shippingCents;
    const totalPesos = totalCents / 100;

    if(totalPesos > 10000){
      return jsonError(
        "El pago en OXXO solo permite montos de hasta $10,000. Elige otro método de pago.",400
      );
    }

    const {data: orden, error: errOrden} = await supabaseAdmin.from("orders")
      .insert({
        email: contacto.email,
        phone: contacto.phone,
        status: "pendiente_pago",
        payment_method: "oxxo",
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        total_cents: totalCents,
        shipping_address: {...direccion, fullName: contacto.fullName},
        shipping_carrier: envio.courier || null,
        shipping_service: envio.serviceType || null
      }).select("id").single();

    if(errOrden || !orden){
      console.error("Error al crear la orden: ", errOrden);
      return jsonError("No se pudo crear el pedido.", 500);
    }

    const renglones = itemsValidados.map((it) => ({
      order_id: orden.id,
      variant_id: it.variantId,
      product_name: it.productName,
      size: it.size,
      price_cents: it.priceCents,
      quantity: it.quantity
    }));

    const { error: errItems } = await supabaseAdmin.from("order_items").insert(renglones);

    if(errItems){
      console.error("Error al crear renglones: ", errItems);
      return jsonError("No se pudo registrar el detalle del pedido.", 500);
    }

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if(!accessToken){
      return jsonError("Falta configurar Mercado Pago.", 500);
    }

    const partesNombre = contacto.fullName.trim().split(" ");
    const firstName = partesNombre[0] || "Cliente";
    const lastName = partesNombre.slice(1).join(" ") || "PerroBoutique";

    const paymentBody = {
      transaction_amount: totalPesos,
      description: `Pedido La PerroBoutique #${String(orden.id).slice(0, 8)}`,
      payment_method_id: "oxxo",
      external_reference: orden.id,
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/webhook-pago`,
      payer:{
        email: contacto.email,
        first_name: firstName,
        last_name: lastName
      }
    };

    const idempotencyKey = `order-oxxo-${orden.id}`;

    const mpRes = await fetch("https://api.mercadopago.com/v1/payments",{
      method: "POST",
      headers:{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "X-Idempotency-Key": idempotencyKey
      },
      body: JSON.stringify(paymentBody)
    });

    const pagoData = await mpRes.json();

    if(!mpRes.ok){
      console.error("Error de Mercado Pago (OXXO): ", mpRes.status, pagoData);
      await supabaseAdmin.from("orders").update({ status: "pago_fallido"}).eq("id", orden.id);
      return jsonError(
        pagoData?.message || "No se pudo generar la ficha de OXXO. Intenta de nuevo.", 502
      );
    }

    await supabaseAdmin.from("orders").update({mp_payment_id: String(pagoData.id)}).eq("id", orden.id);

    const voucherUrl = pagoData?.transaction_details?.external_resource_url || null;

    return new Response(
      JSON.stringify({
        status: pagoData.status,
        statusDetail: pagoData.status_detail,
        orderId: orden.id,
        paymentId: pagoData.id,
        voucherUrl
      }),
      {status: 200, headers:{ ...corsHeaders, "Content-Type": "application/json"}}
    );
  } catch(error){
    console.error("Error inesperdo en procesar-pago-efectivo: ", err);
    return jsonError("Ocurrió un error al generar tu ficha de pago.", 500);
  }
});

function jsonError(mensaje: string, status: number){
  return new Response(
    JSON.stringify({ error: mensaje}),
    {status, headers: {...corsHeaders, "Content-Type": "application/json"}}
  );
}