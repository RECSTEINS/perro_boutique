import { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Flex, Stack, HStack, Heading, Text, Image, Button, Circle, IconButton, Link as ChackraLink } from "@chakra-ui/react";
import { FiX, FiShoppingBag, FiMinus, FiPlus } from "react-icons/fi";
import { useCart } from "../lib/CartContext";
import { formatPrice } from '../utils/format'

function CartLine({item}){
    const {updateQuantity, removeItem} = useCart();

    const hasDiscount = item.compareAtPriceCents && item.compareAtPriceCents > item.priceCents;

    const discountPct = hasDiscount ? Math.round((1 - item.priceCents / item.compareAtPriceCents) * 100) : 0;
    const lineTotalCents = item.priceCents * item.quantity;
    const atMaxStock = item.quantity >= item.stock;

    return(
        <Flex gap={3} py={4} borderBottom="1px solid" borderColor="brand.purpleLight">
            <Box
                w="72px"
                h="72px"
                flexShrink={0}
                borderRadius="14px"
                overflow="hidden"
                bg="brand.mintLight"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        w="full"
                        h="full"
                        objectFit="cover"
                    />
                ) : (
                    <Text fontSize="28px">🐾</Text>
                )}
            </Box>

            <Stack gap={1} flex="1" minW={0}>
                <Flex justify="space-between" align="flex-start" gap={2}>
                    <Text
                        fontWeight="600"
                        color="brand.purple"
                        fontSize="sm"
                        lineHeight="1.2"
                    >
                        {item.name}
                    </Text>
                    <Text
                        as="button"
                        fontSize="xs"
                        color="brand.purpleSoft"
                        textDecoration="underline"
                        flexShrink={0}
                        cursor="pointer"
                        _hover={{color: 'brand.pinkDark'}}
                        onClick={() => removeItem(item.variantId)}
                    >
                        Quitar
                    </Text>
                </Flex>

                <Text fontSize="xs" color="brand.purpleSoft">
                    Talla {item.size}
                </Text>
                <Flex justify="space-between" align="center" mt={1}>
                    <HStack
                        gap={0}
                        borderWidth="1px"
                        borderColor="brand.purpleLight"
                        borderRadius="pill"
                        overflow="hidden"
                    >
                        <IconButton
                            aria-label="Quitar uno"
                            size="xs"
                            variant="ghost"
                            color="brand.purple"
                            borderRadius="0"
                            _hover={{bg: 'brand.purpleLight'}}
                            onClick={() => updateQuantity(item.variantId, item.quantity -1)}
                            disabled={item.quantity <= 1}
                        >
                            <Box as={FiMinus} boxSize="12px"/>
                        </IconButton>
                        <Text
                            fontSize="sm"
                            fontWeight="700"
                            color="brand.purple"
                            minW="28px"
                            textAlign="center"
                        >
                            {item.quantity}
                        </Text>
                        <IconButton
                            aria-label="Agregar uno"
                            size="xs"
                            variant="ghost"
                            color="brand.purple"
                            borderRadius="0"
                            _hover={{bg: 'brand.purpleLight'}}
                            onClick={() => updateQuantity(item.variantId, item.quantity +1)}
                            disabled={atMaxStock}
                            title={atMaxStock ? `Solo quedan ${item.stock}` : ''}
                        >
                            <Box as={FiPlus} boxSize="12px"/>
                        </IconButton>
                    </HStack>

                    <Stack gap={0} align="flex-end">
                        {hasDiscount && (
                            <HStack gap={1.5}>
                                <Text fontSize="xs" color="brand.pink" fontWeight="700">
                                    -{discountPct}%
                                </Text>
                                <Text fontSize="xs" color="brand.purpleSoft" textDecoration="line-through">
                                    {formatPrice(item.compareAtPriceCents * item.quantity)}
                                </Text>
                            </HStack>
                        )}
                        <Text fontSize="sm" fontWeight="700" color="brand.purple">
                            {formatPrice(lineTotalCents)}
                        </Text>
                    </Stack>
                </Flex>

                {atMaxStock && (
                    <Text fontSize="10ox" color="brand.pinkDark">
                        Máximo disponible: {item.stock}
                    </Text>
                )}
            </Stack>
        </Flex>
    );
}

function CartDrawer(){
    const {items, itemCount, subtotalCents, isOpen, closeCart} = useCart();
    const navigate = useNavigate();

    if(!isOpen) return null;

    function goToCart(){
        closeCart();
        navigate('/carrito');
    }

    function keepShopping(){
        closeCart();
        navigate('/catalogo');
    }

    return(
        <>
            <Box
                position="fixed"
                inset={0}
                bg="blackAlpha.600"
                zIndex={100}
                onClick={closeCart}
            />

            <Flex
                direction="column"
                position="fixed"
                top={0}
                right={0}
                h="100vh"
                w={{base:'100vw', sm:'420px'}}
                bg="white"
                zIndex={101}
                boxShadow="-8px 0 40px rgba(107, 46, 171, 0.18)"
            >
                <Flex
                    align="center"
                    justify="space-between"
                    px={5}
                    py={4}
                    borderBottom="1px solid"
                    borderColor="brand.purpleLight"
                    flexShrink={0}
                >
                    <Heading
                        fontFamily="heading"
                        fontSize="lg"
                        fontWeight="600"
                        color="brand.purple"
                    >
                        Carrito de compras
                    </Heading>
                    <Circle
                        size="32px"
                        bg="brand.purpleLight"
                        color="brand.purple"
                        cursor="pointer"
                        _hover={{bg:'brand.pinkLight', color:'brand.pinkDark'}}
                        onClick={closeCart}
                    >
                        <Box as={FiX} boxSize="18px"/>
                    </Circle>
                </Flex>

                {items.length === 0 ? (
                    <Stack flex="1" align="center" justify="center" gap={3} px={6}>
                        <Box as={FiShoppingBag} boxSize="48px" color="brand.purpleLight"/>
                        <Text fontSize="sm" color="brand.purpleSoft" textAlign="center">
                            Tu carrito está vacío. ¡Vamos a llenarlo de cosas lindas!
                        </Text>
                        <Button
                            bg="brand.purple"
                            color="white"
                            borderRadius="pill"
                            px={6}
                            fontFamily="heading"
                            fontWeight="600"
                            fontSize="sm"
                            _hover={{bg:'brand.purpleDark'}}
                            onClick={keepShopping}
                        >
                            Ver productos
                        </Button>
                    </Stack>
                ) : (
                    <>
                        <Box flex="1" overflowY="auto" px={5}>
                            {items.map((item) => (
                                <CartLine key={item.variantId} item={item}/>
                            ))}
                        </Box>
                        <Stack
                            gap={4}
                            px={5}
                            py={5}
                            borderTop="1px solid"
                            borderColor="brand.purpleLight"
                            flexShrink={0}
                        >
                            <Flex justify="space-between" align="center">
                                <Text fontSize="md" fontWeight="600" color="brand.purple">
                                    Subtotal (sin envío):
                                </Text>
                                <Text fontSize="lg" fontWeight="700" color="brand.purple">
                                    {formatPrice(subtotalCents)}
                                </Text>
                            </Flex>

                            <Text fontSize="xs" color="brand.purpleSoft" textAlign="center" mt={-2}>
                                🚚 El envío se calcula en el siguiente paso
                            </Text>
                            <ChackraLink as={RouterLink} to="/checkout" _hover={{textDecoration:'none'}} alignContent="center">
                                <Button
                                    bg="brand.purple"
                                    color="white"
                                    borderRadius="pill"
                                    py={6}
                                    fontFamily="heading"
                                    fontWeight="600"
                                    _hover={{bg:'brand.purpleDark'}}
                                    alignContent="center"
                                >
                                    Iniciar compra
                                </Button>
                            </ChackraLink>

                            <Button
                                variant="ghost"
                                color="brand.purpleSoft"
                                fontWeight="600"
                                fontSize="sm"
                                textDecoration="underline"
                                _hover={{bg:'transparent', color:'brand.purple'}}
                                onClick={goToCart}
                            >
                                Ver carrito completo
                            </Button>
                        </Stack>
                    </>
                )}
            </Flex>
        </>
    );
}

export default CartDrawer;