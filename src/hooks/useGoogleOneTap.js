import { useEffect, useRef, useState} from "react";
import { supabase } from "../lib/supabase";

const GIS_SRC = "https://accounts.google.com/gsi/client";
const GIS_SCRIPT_ID = "google-identity-services";

function loadGisScript(){
    return new Promise((resolve, reject) => {
        if(window.google?.accounts?.id){
            resolve();
            return;
        }
        const existing = document.getElementById(GIS_SCRIPT_ID);
        if(existing){
            existing.addEventListener("load", () => resolve());
            existing.addEventListener("error", () =>
                reject(new Error("No se pudo cargar Google Identity Services."))
            );
            return;
        }
        const script = document.createElement("script");
        script.id = GIS_SCRIPT_ID;
        script.src = GIS_SRC;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("No se pudo cargar Google Identity Services"));
        document.body.appendChild(script);
    });
}

async function generateNonce(){
    const random = crypto.getRandomValues(new Uint8Array(32));
    const rawNonce = Array.from(random, (b) =>
        b.toString(16).padStart(2, "0")
    ).join("");

    const encoded = new TextEncoder().encode(rawNonce);
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
    const hashedNonce = Array.from(new Uint8Array(hashBuffer), (b) =>
        b.toString(16).padStart(2, "0")
    ).join("");

    return {rawNonce, hashedNonce};
}

export function useGoogleOneTap({ onSuccess } = {}){
    const [ready, setReady] = useState(false);
    const [error, setError] = useState(null);
    const buttonRef = useRef(null);
    const rawNonceRef = useRef(null);

    useEffect(() => {
        let mounted = true;
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

        if(!clientId){
            setError("Falta la variable REACT_APP_GOOGLE_CLIENTE_ID.");
            return;
        }

        async function handleCredential(response){
            const {error: signInError} = await supabase.auth.signInWithIdToken({
                provider: "google",
                token: response.credential,
                nonce: rawNonceRef.current
            });

            if(signInError){
                console.error("Error al iniciar sesión con Google", signInError);
                if(mounted) setError("No se pudo iniciar sesión con Google.");
                return;
            }

            if(onSuccess) onSuccess();
        }

        async function init(){
            try{
                await loadGisScript();
                if(!mounted) return;

                const {rawNonce, hashedNonce} = await generateNonce();
                rawNonceRef.current = rawNonce;

                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredential,
                    nonce: hashedNonce,
                    use_fedcm_for_prompt: true,
                });

                if(buttonRef.current){
                    window.google.accounts.id.renderButton(buttonRef.current, {
                        type: "standard",
                        theme: "outline",
                        size: "large",
                        text: "continue_with",
                        shape: "pill",
                        logo_alignment: "center",
                        width: 320
                    });
                }
                if(mounted) setReady(true);
            } catch(error){
                console.error("Error al inicializar Google One Tap: ", error);
                if(mounted) setError(error.message || "No se pudo inicializar Google.");
            }
        }

        init();

        return() => {
            mounted = false;
            if(window.google?.accounts?.id){
                window.google.accounts.id.cancel();
            }
        };
    }, [onSuccess]);

    return {buttonRef, ready, error};
}