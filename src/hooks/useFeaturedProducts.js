import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useFeaturedProducts(){
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchProducts(){
            const { data, error } = await supabase
            .from('products')
            .select(`
                id,
                name,
                slug,
                description,
                is_new,
                image_urls,
                product_variants (
                    id,
                    size,
                    price_cents,
                    compare_at_price_cents,
                    stock
                )`
            ).eq('is_active', true).order('created_at', { ascending: false});

            if(error){
                setError(error);
            } else {
                setProducts(data);
            }
            setLoading(false);
        }

        fetchProducts();
    }, []);

    return { products, loading, error };
}