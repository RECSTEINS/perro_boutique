import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const PAGE_SIZE = 12;

const SORT_OPTIONS = {
    recientes: {column:'created_at', ascending: false},
    precio_asc: {column:'min_price_cents', ascending: true},
    precio_desc: {column: 'min_price_cents', ascending: false},
    nombre_az: {column: 'name', ascending: true},
    nombre_za: {column: 'name', ascending: false}
};

export function useCatalog(selectedCategories, sortKey, search){
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    const fetchPage = useCallback(async(pageToLoad, append) =>{
        if(append) setLoadingMore(true);
        else setLoading(true);
        setError(null);

        const sort = SORT_OPTIONS[sortKey] || SORT_OPTIONS.recientes;

        const from = pageToLoad * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        let query = supabase.from('products_catalog').select('*',{count: 'exact'}).eq('is_active', true);

        if(selectedCategories && selectedCategories.length > 0){
            query = query.in('category_id', selectedCategories);
        }

        if(search && search.trim()){
            query = query.ilike('name', `%${search.trim()}%`);
        }

        query = query.order(sort.column, {ascending: sort.ascending}).range(from, to);

        const {data, error, count} = await query;

        if(error){
            setError(error);
            if(append) setLoadingMore(false);
            else setLoading(false);
            return;
        }

        const ids = (data || []).map((p) => p.id);
        let withVariants = data || [];

        if(ids.length > 0){
            const {data: variantsData } = await supabase.from('products')
                .select('id, product_variants (id, size, price_cents, compare_at_price_cents, stock)')
                .in('id', ids);
            
            const variantsById = {};
            (variantsData || []).forEach((row) => {
                variantsById[row.id] = row.product_variants;
            });
            withVariants = (data || []).map((p) => ({
                ...p,
                product_variants: variantsById[p.id] || []
            }));
        }

        setTotal(count ?? 0);
        setProducts((prev) => (append ? [...prev, ...withVariants] : withVariants));

        if(append) setLoadingMore(false);
        else setLoading(false);
    }, [selectedCategories, sortKey, search]);

    useEffect(() => {
        setPage(0);
        fetchPage(0, false);
    }, [fetchPage]);

    function loadMore(){
        const next = page + 1;
        setPage(next);
        fetchPage(next, true);
    }

    const hasMore = products.length < total;

    return { products, total, loading, loadingMore, error, hasMore, loadMore};
}