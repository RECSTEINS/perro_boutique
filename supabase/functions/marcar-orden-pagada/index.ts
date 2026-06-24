//Edge Function: marcar-orden-pagado

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

Deno.serve(async (req) => {
  if(req.method === "OPTIONS"){
    return new Response("ok", {headers: corsHeaders});
  }

  try{
    const {orderId} = await req.json();

    if(!orderId){
      return jsonError("Falta el id del pedido.", 400);
    }

    const authHeader = req.headers.get("Authorization");
    if(!authHeader){
      return jsonError("No autorizado.", 401);
    }

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {global:{headers: {Authorization: authHeader}}}
    );

    const {data:{user}, error: errUser} = await supabaseUser.auth.getUser();

    if(errUser || !user){
      return jsonError("No autorizado.", 401);
    }

    const {data: esStaff, error: errStaff} = await supabaseUser.rpc("is_staff");

    if(errStaff){
      console.error("Error al verificar is_staff: ", errStaff);
      return jsonError("No se pudo verificar tu rol.", 403);
    }

    if(esStaff !== true){
      return jsonError("No tienes permiso para esta acción.", 403);
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const {data: resultado, error: errRpc} = await supabaseAdmin.rpc("marcar_orden_pagada", {p_order_id: orderId});

    if(errRpc){
      console.error("Error al invocar marcar_orden_pagada: ",errRpc);
      return jsonError("No se pudo marcar el pedido como pagado.", 500);
    }

    if(!resultado?.ok){
      return jsonError(
        resultado?.motivo || "La orden no se puede marcar como pagada.", 409
      );
    }

    return new Response(
      JSON.stringify({ok: true, orderId}),
      {status: 200, headers: {...corsHeaders, "Content-Type": "application/json"}}
    );
  } catch(error){
    console.error("Error inesperado en marcar-orden-pagada: ", error);
    return jsonError("Ocurrió un error al marcar el pedido como pagado.", 500);
  }
});

function jsonError(mensaje: string, status: number){
  return new Response(
    JSON.stringify({error: mensaje}),
    {status, headers: {...corsHeaders, "Content-Type": "application/json"}}
  )
}