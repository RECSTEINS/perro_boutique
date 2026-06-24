// shared/enviosperros.ts

const CP_ORIGEN = "77539";
const CAJA = { depth: 25, width: 20, height: 8};

export function calcularPesoKg(items: any[]): number{
    let pesoTotalGramos = 0;
    for(const item of items || []){
        const peso = Number(item.weightGrams) || 0;
        const cantidad = Number(item.quantity) || 1;
        pesoTotalGramos += peso * cantidad;
    }
    if(pesoTotalGramos <= 0) pesoTotalGramos = 100;
    let pesoKg = pesoTotalGramos / 1000;
    if(pesoKg < 1) pesoKg = 1;
    return pesoKg;
}

export async function cotizarEnvio(
    destinationZipCode: string,
    pesoKg: number,
    apikey: string
): Promise<Array<{courier: string; serviceType: string; priceCents: number; title: string; deliveryCommitment: string}>>{
    const body = {
        package: {type: "Box", depth: CAJA.depth, width: CAJA.width, height: CAJA.height, weight: pesoKg},
        originZipCode: CP_ORIGEN,
        destinationZipCode,
        holdAtLocation: false
    };

    const respuesta = await fetch("https://app.enviosperros.com/api/v3/rates", {
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
        throw new Error(`Envíosperros respondió ${respuesta.status}: ${detalle}`);
    }

    const opcionesCrudas = await respuesta.json();
    return (opcionesCrudas || [])
        .filter((op:any) => op.available && op.details)
        .map((op: any) => ({
            title: op.summary,
            courier: op.details.courier,
            serviceType: op.details.service,
            deliveryCommitment: op.details.deliveryCommitment,
            priceCents: Math.round(Number(op.details.total) * 100)
        }));
}