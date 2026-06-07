import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useCategories(){
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchCategories(){
            const {data, error} = await supabase
                .from('categories')
                .select('id, name, slug').eq('is_active', true)
                .order('name', { ascending: true});

            if(error){
                setError(error);
            }else{
                setCategories(data);
            }
            setLoading(false);
        }

        fetchCategories();
    }, []);

    return { categories, loading, error};
}