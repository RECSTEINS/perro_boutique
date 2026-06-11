import { createContext, useContext, useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { formatPrice } from "../utils/format";

const CartContext = createContext(null);

const STORAGE_KEY = 'perroboutique_cart_v1';

function readStoredCart(){
    try{
        const raw = localStorage.getItem(STORAGE_KEY);
        if(!raw) return[];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch(error){
        console.error('No se pudo leer el carrito guardado: ', error);
        return [];
    }
}

function buildAddedToastContent(product, variant){
    const image = product.image && product.image_urls > 0 ? product.image_urls[0] : null;

    return (
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <div
                style={{
                    width:'48px',
                    height:'48px',
                    borderRadius:'12px',
                    overflow:'hidden',
                    flexShrink: 0,
                    background:'#D6F5EC',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center'
                }}
            >
                {image ? (
                    <img
                        src={image}
                        alt={product.name}
                        style={{width:'100%', height:'100%', objectFit:'cover'}}
                    />
                ): (
                    <span style={{fontSize: '22px'}}>🐾</span>
                )}
            </div>
            <div style={{minWidth: 0}}>
                <div style={{
                    fontWeight:600,
                    color:'#6B2EAB',
                    fontSize:'14px',
                    lineHeight:1.2
                }}>
                    {product.name}
                </div>
                <div style={{fontSize:'12px', color: '#7B5BA8', marginTop:'2px'}}>
                    1 × {formatPrice(variant.price_cents)} · Talla {variant.size}
                </div>
                <div
                    style={{
                        fontSize:'13px',
                        fontWeight: 700,
                        color: '#EC4899',
                        marginTop:'2px'
                    }}
                >
                    ¡Agregado al carrito!
                </div>
            </div>
        </div>
    );
}

export function CartProvider({children}){
    const [items, setItems] = useState(readStoredCart);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        try{
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }  catch(error){
            console.error('No se pudo guardar el carrito: ', error);
        }
    }, [items]);

    useEffect(() => {
        try{
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        }catch(error){
            console.error('No se pudo guardar el carrito: ', error)
        }
    }, [items]);

    function addItem(product, variant, quantity = 1){
        if(!product || !variant) return;

        const stock = variant.stock ?? 0;
        if(stock <= 0){
            toast.error('Esta talla está agotada');
            return;
        }

        setItems((prev) => {
            const existing = prev.find((it) => it.variantId === variant.id);

            if(existing){
                const nextQty = Math.min(existing.quantity + quantity, stock);
                return prev.map((it =>
                    it.variantId === variant.id ? {...it, quantity: nextQty, stock} : it)
                );
            }

            const image = product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] : null;

            const newItem = {
                variantId: variant.id,
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image,
                size: variant.size,
                priceCents: variant.price_cents,
                compareAtPriceCents: variant.compare_at_price_cents ?? null,
                stock,
                quantity: Math.min(quantity, stock),
            };

            return [...prev, newItem];
        });
        toast.custom(buildAddedToastContent(product, variant));
    }

    function removeItem(variantId){
        setItems((prev) => prev.filter((it) => it.variantId !== variantId));
    }

    function updateQuantity(variantId, quantity){
        setItems((prev) => prev.map((it) => {
            if(it.variantId !== variantId) return it;
            const clamped = Math.max(1, Math.min(quantity, it.stock));
            return {...it, quantity: clamped}
        }));
    }

    function clear(){
        setItems([]);
    }

    function openCart(){
        setIsOpen(true);
    }

    function closeCart(){
        setIsOpen(false);
    }

    const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);
    const subtotalCents = items.reduce((sum, it) => sum + it.priceCents * it.quantity, 0);

    const value = {
        items,
        itemCount,
        subtotalCents,
        addItem,
        removeItem,
        updateQuantity,
        clear,
        isOpen,
        openCart,
        closeCart,
        toast
    };
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(){
    const context = useContext(CartContext);
    if(context === null){
        throw new Error('useCart debe usarse dentro de <CartProvider>');
    }
    return context;
}