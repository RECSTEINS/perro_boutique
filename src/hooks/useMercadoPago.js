import { useEffect, useState } from "react";

const SDK_URL = "https://sdk.mercadopago.com/js/v2";
const SDK_SCRIPT_ID = "mercadopago-sdk-v2";

function loadSdkScript(){
    return new Promise((resolve, reject) => {
        if(window.MercadoPago){
            resolve();
            return;
        }

        const existing = document.getElementById(SDK_SCRIPT_ID);
        if(existing){
            existing.addEventListener("load", () => resolve());
            existing.addEventListener("error", () =>
                reject(new Error("No se pudo cargar el SDK de Mercado Pago.")) 
            );
            return;
        }

        const script = document.createElement("script");
        script.id = SDK_SCRIPT_ID;
        script.src = SDK_URL;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("No se pudo cargar el SDK de Mercado Pago."));
        document.body.appendChild(script);
    });
}

export function useMercadoPago(){
    const [mp, setMp] = useState(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const publicKey = process.env.REACT_APP_MP_PUBLIC_KEY;
        if(!publicKey){
            setError(
                "Falta la variable REACT_APP_MP_PUBLIC_KEY."
            );
            return;
        }

        async function init(){
            try{
                await loadSdkScript();
                if(!mounted) return;

                const instance = new window.MercadoPago(publicKey,{
                    locale: "es-MX",
                });

                if(mounted){
                    setMp(instance);
                    setReady(true);
                }
            } catch(err){
                console.error("Error al inicializar Mercado Pago: ", err);
                if(mounted){
                    setError(err.message || "No se pudo inicializar Mercado Pago.");
                }
            }
        }

        init();

        return () => {
            mounted = false;
        };
    }, []);

    return {mp, ready, error};
}