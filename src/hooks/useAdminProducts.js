import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useAdminProducts(){
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async() => {
        setLoading(true);
        setError(null);

        const {data, error} = await supabase.from('products').select(`
            id,
            name,
            slug,
            description,
            is_new,
            is_active,
            image_urls,
            category_id,
            created_at,
            product_variants(
                id,
                size,
                price_cents,
                compare_at_price_cents,
                stock
                )
            `).order('created_at', {ascending: false});

        if(error){
            setError(error);
        }else{
            setProducts(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return {products, loading, error, refetch: fetchProducts};
}