//Edge Function: webhook-pago

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async(req) => {
  try{
    const url = new URL(req.url);
    let paymentId = url.searchParams.get("data.id") || url.searchParams.get("id");
    let tipo = url.searchParams.get("type") || url.searchParams.get("topic");

    try{
      const body = await req.json();
      if(body?.data?.id) paymentId = body.data.id;
      if(body?.type) tipo = body.type;
    } catch{

    }

    if(tipo && tipo !== "payment"){
      return new Response("ok",{status: 200});
    }

    if(!paymentId){
      return new Response("ok", {status: 200});
    }

    const accessToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`,{
      headers:{"Authorization":`Bearer ${accessToken}`}
    });

    if(!mpRes.ok){
      console.error("No se pudo consultar el pago en MP: ", mpRes.status);
      return new Response("ok", {status: 200});
    }

    const pago = await mpRes.json();
    const estadoPago = pago.status;
    const ordenId = pago.external_reference;

    if(!ordenId){
      console.error("El pago no trae external_reference.");
      return new Response("ok", {status: 200});
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {data: orden, error: errOrden} = await supabaseAdmin.from("orders").select("id, status").eq("id", ordenId).single();

    if(errOrden || !orden){
      console.error("Orden no encontrada: ", ordenId);
      return new Response("ok", {status: 200});
    }

    if(orden.status === "pagado"){
      return new Response("ok", {status: 200});
    }

    if(estadoPago === "approved"){
      await supabaseAdmin.from("orders").update({
        status: "pagado",
        mp_payment_id: String(paymentId),
        updated_at: new Date().toISOString()
      }).eq("id", ordenId);

      const {data: renglones} = await supabaseAdmin.from("order_items")
        .select("variant_id, quantity")
        .eq("order_id", ordenId);

      for(const renglon of renglones || []){
        if(!renglon.variant_id) continue;

        const {data: variante} = await supabaseAdmin.from("product_variants").select("stock").eq("id", renglon.variant_id).single();

        if(variante){
          const nuevoStock = Math.max(0, variante.stock - renglon.quantity);
          await supabaseAdmin.from("product_variants").update({stock: nuevoStock}).eq("id", renglon.variant_id);
        }
      }

      console.log(`Orden ${ordenId} marcada como pagada y stock descontado.`);
    } else if(estadoPago === "rejected" || estadoPago === "cancelled"){
      console.log(`Pago ${paymentId} rechazado para orden ${ordenId}.`);
    }

    return new Response("ok", {status: 200});
  } catch(err){
    console.error("Error en webhook-pagado: ",err);
    return new Response("ok", {status: 200});
  }
});