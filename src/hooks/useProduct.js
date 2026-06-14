import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useProduct(slug){
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function fetchProduct(){
            setLoading(true);
            setNotFound(false);

            const {data, error} = await supabase.from('products').select(`
                    id, name, slug, description, category_id, image_urls, is_new, is_active,
                    product_variants (id, size, price_cents, compare_at_price_cents, stock, weight_grams, length_cm, width_cm, height_cm)
                `).eq('slug', slug).eq('is_active', true).maybeSingle();
            
            if(!mounted) return;

            if(error){
                console.error('Error al cargar el producto: ', error)
                setNotFound(true);
            } else if(!data){
                setNotFound(true);
            } else{
                setProduct(data)
            }
            setLoading(false);
        }

        if(slug) fetchProduct();

        return() => {
            mounted = false;
        };
    }, [slug]);

    return {product, loading, notFound};
}