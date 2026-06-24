//Edge Function: calcular-envio

import { calcularPesoKg, cotizarEnvio } from "../_shared/enviosperros.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

Deno.serve(async(req) =>{
  if(req.method === "OPTIONS"){
    return new Response("ok", {headers: corsHeaders});
  }

  try{
    const {destinationZipCode, items} = await req.json();

    if(!destinationZipCode || !/^\d{5}$/.test(destinationZipCode)){
      return new Response(
        JSON.stringify({ error: "El código postal de destino debe tener 5 dígitos."}),
        {status:400, headers:{ ...corsHeaders,"Content-Type": "application/json"}}
      );
    }

    const apikey = Deno.env.get("ENVIOSPERROS_API_KEY");
    if(!apikey){
      return new Response(
        JSON.stringify({ error: "Falta configurar la API key del servicio de envíos."}),
        {status: 500, headers:{...corsHeaders, "Content-Type": "application/json"}}
      );
    }

    const pesoKg = calcularPesoKg(items);
    let opciones;
    
    try{
      opciones = await cotizarEnvio(destinationZipCode, pesoKg, apikey);
    } catch(err){
      console.error("Error de Envíosperros: ", err);
      return new Response(
        JSON.stringify({error: "No se pudieron calcular las opciones de envío."}),
        {status: 502, headers:{...corsHeaders, "Content-Type": "application/json"}}
      );
    }

    return new Response(
      JSON.stringify({opciones}),
      {status:200, headers:{...corsHeaders, "Content-Type": "application/json"}}
    );
  } catch(error){
    console.error("Error inesperado en calcular-envio: ", error);
    return new Response(
      JSON.stringify({error: "Ocurrió un error al calcular el envío."}),
      {status: 500, headers:{...corsHeaders, "Content-Type": "application/json"}}
    );
  }
});