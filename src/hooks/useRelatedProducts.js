import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const TARGET = 8;

const SELECT = `
    id, name, slug, is_new, image_urls,
    product_variants(id, size, price_cents, compare_at_price_cents, stock)
`

export function useRelatedProducts(currentId, categoryId){
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() =>{
        if(!currentId) return;

        let mounted = true;

        async function fetchRelated(){
            setLoading(true)

            let sameCategory = [];
            if(categoryId){
                const {data, error} = await supabase
                    .from('products').select(SELECT)
                    .eq('is_active', true).eq('category_id', categoryId)
                    .neq('id', currentId).limit(TARGET);

                if(!error && data) sameCategory = data;
            }

            let result = sameCategory;
            if(sameCategory.length < TARGET){
                const excludeIds = [currentId, ...sameCategory.map((p) => p.id)];
                const excludeList = `(${excludeIds.join(',')})`;

                const {data, error} = await supabase
                    .from('products').select(SELECT)
                    .eq('is_active', true).not('id', 'in', excludeList)
                    .limit(TARGET - sameCategory.length);

                if(!error && data){
                    result = [...sameCategory, ...data];
                }
            }

            if(mounted){
                setProducts(result);
                setLoading(false);
            }
        }

        fetchRelated();

        return() => {
            mounted = false;
        };
    },[currentId, categoryId]);

    return {products, loading}
}