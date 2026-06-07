import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useAdminCategories(){
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);

        const {data, error} = await supabase.from('categories')
            .select(`id, name, slug, is_active, created_at, products(count)`)
            .order('name', {ascending: true});
        
        if(error){
            setError(error);
            setLoading(false);
            return;
        }

        const normalized = (data || []).map((cat) => ({
            ...cat,
            productCount: cat.products?.[0]?.count ?? 0
        }));

        setCategories(normalized);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return { categories, loading, error, refetch: fetchCategories};
}