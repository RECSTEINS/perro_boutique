//Edge function: colsultar-saldo

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

Deno.serve(async(req) => {
  if(req.method === "OPTIONS"){
    return new Response("ok", {headers: corsHeaders});
  }

  try{
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

    //! --Consultar saldo--
    const apikey = Deno.env.get("ENVIOSPERROS_API_KEY");
    if(!apikey){
      return jsonError("Falta configurar la API key del servicio de envíos.", 500)
    }

    const respuesta = await fetch("https://app.enviosperros.com/api/v3/balance", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${apikey}`
      }
    });

    if(!respuesta.ok){
      const detalle = await respuesta.text();
      console.error("Error al consultar saldo en Envíosperros: ", respuesta.status, detalle);
      return jsonError("No se pudo consultar el saldo.", 502);
    }

    const data = await respuesta.json();

    return new Response(
      JSON.stringify({balance: data.balance}),
      {status: 200, headers:{...corsHeaders, "Content-Type": "application/json"}}
    );
  } catch(error){
    console.error("Error inesperado en colsultar-saldo: ", error);
    return jsonError("Ocurrió un error al consultar el saldo.", 500);
  }
});

function jsonError(mensaje: string, status: number){
  return new Response(
    JSON.stringify({error: mensaje}),
    {status, headers:{...corsHeaders, "Content-Type": "application/json"}}
  );
}