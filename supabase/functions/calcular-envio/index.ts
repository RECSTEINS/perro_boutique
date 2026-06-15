//Edge Function: calcular-envio

const CP_ORIGEN = "77539";
const CAJA = { depth: 25, width: 20, height: 8}

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

    let pesoTotalGramos = 0;
    for(const item of items || []){
      const peso = Number(item.weightGrams) || 0;
      const cantidad = Number(item.quantity) || 1;
      pesoTotalGramos += peso * cantidad;
    }

    if(pesoTotalGramos <= 0) pesoTotalGramos = 100;
    let pesoKg = pesoTotalGramos / 1000;

    if(pesoKg < 1) pesoKg = 1;

    const apikey = Deno.env.get("ENVIOSPERROS_API_KEY");
    if(!apikey){
      return new Response(
        JSON.stringify({ error: "Falta configurar la API key del servicio de envíos."}),
        {status: 500, headers:{...corsHeaders, "Content-Type": "application/json"}}
      );
    }

    const body = {
      package:{
        type: "Box",
        depth: CAJA.depth,
        width: CAJA.width,
        height: CAJA.height,
        weight: pesoKg
      },
      originZipCode: CP_ORIGEN,
      destinationZipCode: destinationZipCode,
      holdAtLocation: false
    };

    const respuesta = await fetch("https://app.enviosperros.com/api/v3/rates",{
      method: "POST",
      headers:{
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${apikey}`
      },
      body: JSON.stringify(body)
    });

    if(!respuesta.ok){
      const detalle = await respuesta.text();
      console.error("Error de Envíosperros: ", respuesta.status, detalle);
      return new Response(
        JSON.stringify({error: "No se pudieron calcular las opciones de envío."}),
        {status: 502, headers:{...corsHeaders, "Content-Type": "application/json"}}
      );
    }

    const opcionesCrudas = await respuesta.json();
    const opciones = (opcionesCrudas || [])
      .filter((op: any) => op.available && op.details)
      .map((op: any) => ({
        title: op.summary,
        courier: op.details.courier,
        serviceType: op.details.service,
        deliveryCommitment: op.details.deliveryCommitment,
        priceCents: Math.round(Number(op.details.total) * 100)
      }));

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