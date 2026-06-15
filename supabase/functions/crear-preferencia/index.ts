//Edge Function: Crear-preferencia
//Revalida precios y stock desde la BD, crea la orden en estado
//pendiente_pago y pide a Mercado pago una preferencia de pago

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
}

Deno.serve(async(req) => {
  if(req.method === "OPTIONS"){
    return new Response("ok", {headers: corsHeaders});
  }

  try{
    const {items, contacto, direccion, envio} = await req.json();

    if(!items || items.length === 0){
      return jsonError("El carrito está vacío.", 400);
    }
    if(!contacto?.email || !contacto?.phone || !contacto?.fullName){
      return jsonError("Faltan datos de contacto.", 400);
    }

    if(!direccion || !envio){
      return jsonError("Faltan datos de envío.", 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const variantIds = items.map((it: any) => it.variantId);
    const { data: variantesReales, error: errVariantes} = await supabaseAdmin
      .from("product_variants")
      .select("id, size, price_cents, stock, products(name)")
      .in("id", variantIds);

    if(errVariantes || !variantesReales){
      console.error("Error al leer variantes: ", errVariantes);
      return jsonError("No se pudieron verificar los productos.", 500);
    }

    const itemsValidados = [];
    let subtotalCents = 0;

    for(const item of items){
      const variante = variantesReales.find((v: any) => v.id === item.variantId);

      if(!variante){
        return jsonError(`Un producto de tu carrito ya no está disponible.`, 409);
      }
      if(variante.stock < item.quantity){
        return jsonError(
          `No hay suficiente stock de un producto (quedan ${variante.stock}).`, 
          409
        );
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

    const {data: orden, error: errOrden} = await supabaseAdmin.from("orders")
      .insert({
        email: contacto.email,
        phone: contacto.phone,
        status: "pendiente_pago",
        subtotal_cents: subtotalCents,
        shipping_cents: shippingCents,
        total_cents: totalCents,
        shipping_address: {...direccion, fullName: contacto.fullName},
        shipping_carrier: envio.courier || null,
        shipping_service: envio.serviceType || null,
      })
      .select("id")
      .single();

    if(errOrden || !orden){
      console.error("Error al crear la orden: " errOrden);
      return jsonError("No se pudo crear el pedido.", 500);
    }

    const renglones = itemsValidados.map((it) => ({
      order_id: orden_id,
      variant_id: it.variantId,
      product_name: it.productName,
      size: it.size,
      price_cents: it.priceCents,
      quantity: it.quantity
    }));

    const {error: errItems} = await supabaseAdmin.from("order_items").insert(renglones)

    if(errItems){
      console.error("Error al crear renglones: ", errItems);
      return jsonError("No se pudo registrar el detalle del pedido.", 500);
    }

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    if(!accessToken){
      return jsonError("Falta configurar Mercado Pago.", 500);
    }

    const siteUrl = Deno.env.get("SITE_URL"); //actualizar la url para las pruebas

    const mpItems = itemsValidados.map((it) => ({
      title: `${it.productName} (Talla ${it.size})`,
      quantity: it.quantity,
      unit_price: it.priceCents / 100,
      currency_id: "MXN"
    }));
    if(shippingCents > 0){
      mpItems.push({
        title: `Envío (${envio.courier || "paquetería"})`,
        quantity: 1,
        unit_price: shippingCents / 100,
        currency_id: "MXN"
      });
    }

    const preferencia = {
      items: mpItems,
      payer:{
        name: contacto.fullName,
        email: contacto.email
      },
      back_urls:{
        success: `${siteUrl}/pago/resultado`,
        failure: `${siteUrl}/pago/resultado`,
        pending: `${siteUrl}/pago/resultado`
      },
      auto_return: "approved",
      external_reference: orden.id,
      notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/webhook-pago`
    };

    const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences",{
      method: "POST",
      headers:{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preferencia)
    });

    if(!mpRes.ok){
      const detalle = await mpRes.text();
      console.error("Error de Mercado Pago: ", mpRes.status, detalle);
      return jsonError("No se pudo iniciar el pago.", 502);
    }

    const mpData = await mpRes.json();

    await supabaseAdmin.from("orders").update({mp_preference_id: mpData.id}).eq("id", orden.id);

    return new Response(
      JSON.stringify({
        initPoint: mpData.init_point,
        orderId: orden.id,
      }),
      {status: 200, headers: {...corsHeaders, "Content-Type": "application/json"}}
    );
  } catch(err){
    console.error("Error inesperado en crear-preferencia: ", err);
    return jsonError("Ocurrió un error al procesar tu pedido.", 500);
  }
});

function jsonError(mensaje: string, status: number){
  return new Response(
    JSON.stringify({error: mensaje}),
    {status, headers: {...corsHeaders, "Content-Type": "application/json"}}
  );
}