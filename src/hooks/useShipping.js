import { useState } from "react";
import { supabase } from "../lib/supabase";

export function useShipping(){
    const [options, setOptions] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [calculated, setCalculated] = useState(false);

    async function calculate(destinationZipCode, items){
        setLoading(true);
        setError(null);
        setSelected(null);
        setOptions([]);

        try{
            const {data, error: fnError} = await supabase.functions.invoke('calcular-envio',{
                body:{
                    destinationZipCode,
                    items: items.map((it) => ({
                        weightGrams: it.weightGrams,
                        quantity: it.quantity
                    }))
                }
            });

            if(fnError){
                setError('No pudimos calcular el envío. Revisa tu código postal e intenta de nuevo.');
                setCalculated(true);
                return;
            }

            if(data?.error){
                setError(data.error);
                setCalculated(true);
                return;
            }

            const opciones = data?.opciones || [];
            setOptions(opciones);

            if(opciones.length === 1){
                setSelected(opciones[0]);
            }

            setCalculated(true);
        } catch(error){
            console.error("Error al calcular envío: ", error);
            setError('Ocurrió un error al calcular el envío. Intenta de nuevo.');
            setCalculated(true);
        } finally{
            setLoading(false);
        }
    }

    function reset(){
        setOptions([]);
        setSelected(null);
        setError(null);
        setCalculated(false);
    }

    return{
        options,
        selected,
        setSelected,
        loading,
        error,
        calculated,
        calculate,
        reset
    };
}