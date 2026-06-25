//Edge function: crear-guia-envio

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { calcularPesoKg } from "../_shared/enviosperros.ts";
import { ORIGEN_TIENDA } from "../_shared/tienda";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const CAJA = { depth: 25, width: 20, height: 8};

Deno.serve(async (req) => {
  if(req.method === "OPTIONS"){
    return new Response("ok", {headers: corsHeaders});
  }

  try{
    const {orderId} = await req.json();

    if(!orderId){
      return jsonError("Falta el identificador del pedido.", 400);
    }

    const authHeader = req.headers.get("Authorization");
    if(!authHeader){
      return jsonError("No autorizado.", 401);
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {global: {headers:{Authorization: authHeader}}}
    );

    const {data:{user}, error: errUser} = await supabaseUser.auth.getUser();
    if(errUser || !user){
      return jsonError("No autorizado.", 401);
    }

    const {data: esStaff, error: errStaff} = await supabaseUser.rpc("is_staff");
    if(errStaff || !esStaff){
      return jsonError("No tienes permisos para esta acción.", 403);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {data: orden, error: errOrden} = await supabaseAdmin.from("orders")
      .select("id, status, payment_method, subtotal_cents, shipping_carrier, shipping_service, shipping_address, phone, email, tracking_number")
      .eq("id", orderId)
      .single();

    if(errOrden || !orden){
      return jsonError("Pedido no encontrado.", 404);
    }

    if(orden.status !== "pagado"){
      return jsonError("Solo se puede generar guía de pedidos pagados.", 409);
    }
    if(orden.payment_method === "contra_entrega"){
      return jsonError("Los pedidos de contra entrega no llevan guía (entrega personal).", 409);
    }
    if(orden.tracking_number){
      return jsonError("Este pedido ya tiene una guía generada.", 409);
    }

    const {data: items, error: errItems} = await supabaseAdmin.from("order_items")
      .select("quantity, product_variants:variant_id (weight_grams)")
      .eq("order_id", orderId);
    
    if(errItems || !items || items.length === 0){
      return jsonError("No se pudieron leer los productos del pedido.", 500);
    }

    const itemsParaPeso = items.map((it: any) => ({
      weightGrams: it.product_variants?.weight_grams,
      quantity: it.quantity
    }));
    const pesoKg = calcularPesoKg(itemsParaPeso);

    //! --Armar el destino desde la dirección de la orden--
    const addr = orden.shipping_address;
    if(!addr || !addr.postal_code){
      return jsonError("El pedido no tiene una dirección de envío válida.", 422);
    }

    const apikey = Deno.env.get("ENVIOSPERROS_API_KEY");
    if(!apikey){
      return jsonError("Falta configurar la API key del servicio de envíos.", 500);
    }

    //! --Payload para /labels --
    const body = {
      courier: orden.shipping_carrier,
      service: orden.shipping_service,
      origin: ORIGEN_TIENDA,
      destination:{
        name: addr.fullName,
        phone: orden.phone,
        email: orden.email,
        street: addr.street,
        exteriorNumber: addr.number,
        neighborhood: addr.neighborhood,
        zipCode: addr.postal_code,
        references: addr.references || ""
      },
      package:{
        type: "Box",
        description: "Ropa y accesorios para mascota",
        contentValue: orden.subtotal_cents / 100,
        depth: CAJA.depth,
        width: CAJA.width,
        height: CAJA.height,
        weight: pesoKg
      },
      holdAtLocation: false
    };

    //! --Llamar a enviosperros (se gasta el saldo)
    const respuesta = await fetch("https://app.enviosperros.com/api/v3/labels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${apikey}`
      },
      body: JSON.stringify(body)
    });

    const guiaData = await respuesta.json();

    if(!respuesta.ok){
      console.error("Error de Envíosperros al crear guía: ", respuesta.status, guiaData);
      const mensaje = guiaData?.message || "No se pudo generar la guía. Revisa el saldo de Envíosperros.";
      return jsonError(mensaje, 502);
    }

    const trackingNumber = guiaData.trackingNumber;
    if(!trackingNumber){
      console.error("Envíosperros no devolvió trackingNumber: ", guiaData);
      return jsonError("La guía se generó pero no se recibío el número de rastreo.", 502);
    }

    // --Guardar el tracking y cambiar estado a enviado --
    const {error: errUpdate} = await supabaseAdmin.from("orders")
      .update({
        tracking_number: trackingNumber,
        label_total_cents: labelTotalCents,
        status: "enviado",
        updated_at: new Date().toISOString()
      }).eq("id", orderId);

    if(errUpdate){
      console.error("CRÍTICO: guía generada pero no se guardó en la orden: ", orderId, trackingNumber, errUpdate);
      return jsonError("La guía se generó pero hubo un problema al guardarla. Anota el rastreo: " + trackingNumber, 500);
    }

    return new Response(
      JSON.stringify({ok: true, trackingNumber, total: guiaData.total}),
      {status: 200, headers:{...corsHeaders, "Content-Type": "application/json"}}
    );
  } catch(error){
    console.error("Error inesperado en crear-guia-envio: ", error);
    return jsonError("Ocurrió un error al generar la guía.", 500);
  }
});

function jsonError(mensaje: string, status: number){
  return new Response(
    JSON.stringify({error: mensaje}),
    {status, headers: {...corsHeaders, "Content-Type": "application/json"}}
  );
}