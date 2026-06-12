import { createContext, useContext, useEffect, useState } from "react";
import toast from 'react-hot-toast';
import { Box, Flex, Stack, Image, Text } from "@chakra-ui/react";
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

function AddedToast({product, variant}){
    const image = product.image_urls && product.image_urls.length > 0 ? product.image_urls[0] :  null;

    return (
        <Flex
            align="center"
            gap={3}
            bg="white"
            borderWidth="1px"
            borderColor="brand.purpleLight"
            borderRadius="16px"
            boxShadow="0 8px 24px rgba(107, 46, 171, 0.18)"
            px={3.5}
            py={3}
            maxW="360px"
        >
            <Box
                w="48px"
                h="48px"
                flexShrink={0}
                borderRadius="12px"
                overflow="hidden"
                bg="brand.mintLight"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                {image ? (
                    <Image src={image} alt={product.name} w="full" h="full" objectFit="cover"/>
                ) : (
                    <Text fontSize="22px">🐾</Text>
                )}
            </Box>
            <Stack gap={0.5} minW={0}>
                <Text fontWeight="600" color="brand.purple" fontSize="sm" lineHeight="1.2">
                    {product.name}
                </Text>
                <Text fontSize="xs" color="brand.purpleSoft">
                    1 × {formatPrice(variant.price_cents)} · Talla {variant.size}
                </Text>
                <Text fontSize="13px" fontWeight="700" color="brand.pink">
                    ¡Agregado al carrito!
                </Text>
            </Stack>
        </Flex>
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
        toast.custom(<AddedToast product={product} variant={variant}/>);
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