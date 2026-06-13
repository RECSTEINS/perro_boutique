import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Flex, Grid, Stack, HStack, Heading, Text, Image, Button, IconButton, Link as ChakraLink } from '@chakra-ui/react';
import { FiMinus, FiPlus, FiShoppingBag, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../lib/CartContext';
import { formatPrice } from '../utils/format';

function CartRow({item}){
    const {updateQuantity, removeItem} = useCart();

    const hasDiscount = item.compareAtPriceCents && item.compareAtPriceCents > item.priceCents;
    const discountPct = hasDiscount ? Math.round((1 - item.priceCents / item.compareAtPriceCents) * 100) : 0;
    const lineTotalCents = item.priceCents * item.quantity;
    const atMaxStock = item.quantity >= item.stock;

    return(
        <Flex
            gap={4}
            py={5}
            borderBottom="1px solid"
            borderColor="brand.purpleLight"
            align="center"
        >
            <ChakraLink
                as={RouterLink}
                to={`/producto/${item.slug}`}
                flexShrink={0}
                _hover={{opacity:0.9}}
            >
                <Box
                    w={{base:'80px', md:'96px'}}
                    h={{base:'80px', md:'96px'}}
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
                        <Text fontSize="32px">🐾</Text>
                    )}
                </Box>
            </ChakraLink>

            <Stack gap={1} flex="1" minW={0}>
                <ChakraLink
                    as={RouterLink}
                    to={`/producto/${item.slug}`}
                    _hover={{textDecoration:'none'}}
                >
                    <Text fontWeight="600" color="brand.purple" fontSize="md">
                        {item.name}
                    </Text>
                </ChakraLink>
                <Text fontSize="sm" color="brand.purpleSoft">
                    Talla {item.size}
                </Text>
                <Text
                    as="button"
                    fontSize="xs"
                    color="brand.purpleSoft"
                    textDecoration="underline"
                    alignSelf="flex-start"
                    cursor="pointer"
                    _hover={{color:'brand.pinkDark'}}
                    onClick={() => removeItem(item.variantId)}
                >
                    Quitar
                </Text>
            </Stack>

            <Stack gap={1} align="center">
                <HStack
                    gap={0}
                    borderWidth="1px"
                    borderColor="brand.purpleLight"
                    borderRadius="pill"
                    overflow="hidden"
                >
                    <IconButton
                        aria-label='Quitar uno'
                        size="sm"
                        variant="ghost"
                        color="brand.purple"
                        borderRadius="0"
                        _hover={{bg:'brand.purpleLight'}}
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                    >
                        <Box as={FiMinus} boxSize="14px"/>
                    </IconButton>
                    <Text
                        fontSize="sm"
                        fontWeight="700"
                        color="brand.purple"
                        minW="36px"
                        textAlign="center"
                    >
                        {item.quantity}
                    </Text>
                    <IconButton
                        aria-label='Agregar uno'
                        size="sm"
                        variant="ghost"
                        color="brand.purple"
                        borderRadius="0"
                        _hover={{bg:'brand.purpleLight'}}
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    >
                        <Box as={FiPlus} boxSize="14px"/>
                    </IconButton>
                </HStack>
                {atMaxStock && (
                    <Text fontSize="10px" color="brand.pinkDark">
                        Max: {item.stock}
                    </Text>
                )}
            </Stack>
            <Stack gap={0} align="flex-end" minW={{base: '80px', md: '110px'}}>
                {hasDiscount && (
                    <>
                        <Text fontSize="xs" color="brand.pink" fontWeight="700">
                            -{discountPct}%
                        </Text>
                        <Text fontSize="xs" color="brand.purpleSoft" textDecoration="line-through">
                            {formatPrice(item.compareAtPriceCents * item.quantity)}
                        </Text>
                    </>
                )}
                <Text fontSize="md" fontWeight="700" color="brand.purple">
                    {formatPrice(lineTotalCents)}
                </Text>
            </Stack>
        </Flex>
    );
}

function CartPage(){
    const {items, itemCount, subtotalCents, clear} = useCart();
    const navigate = useNavigate();

    if(items.length === 0){
        return(
            <Stack align="center" justify="center" minH="60vh" gap={4} px={5}>
                <Box as={FiShoppingBag} boxSize="60px" color="brand.purpleLight"/>
                <Heading
                    fontFamily="heading"
                    fontSize="2xl"
                    color="brand.purple"
                    textAlign="center"
                >
                    Tu carrito está vacío
                </Heading>
                <Text fontSize="sm" color="brand.purpleSoft" textAlign="center">
                    Aún no has agregado nada. ¡Vamos a consentir a tu peludito!
                </Text>
                <Button
                    bg="brand.purple"
                    color="white"
                    borderRadius="pill"
                    px={6}
                    fontFamily="heading"
                    fontWeight="600"
                    _hover={{bg: 'brand.purpleDark'}}
                    onClick={() => navigate('/catalogo')}
                >
                    <Box as={FiArrowLeft} boxSize="16px" mr={2}/>
                    Ir a la tienda
                </Button>
            </Stack>
        );
    }

    return(
        <Box maxW="1100px" mx="auto" px={{base:5, md:8}} py={{base:6, md:10}}>
            <ChakraLink as={RouterLink} to="/catalogo" _hover={{textDecoration: 'none'}}>
                <HStack gap={1.5} color="brand.purpleSoft" mb={6} _hover={{color:'brand.purple'}}>
                    <Box as={FiArrowLeft} boxSize="16px"/>
                    <Text fontSize="sm" fontWeight="600">
                        Seguir comprando
                    </Text>
                </HStack>
            </ChakraLink>

            <Heading
                as="h1"
                fontFamily="heading"
                fontSize={{base:'2xl', md:'3xl'}}
                fontWeight="600"
                color="brand.purple"
                mb={6}
            >
                Tu carrito ({itemCount})
            </Heading>

            <Grid templateColumns={{base:'1fr', md:'1fr 320px'}} gap={{base:8, md:10}}>
                <Box>
                    {items.map((item) => (
                        <CartRow key={item.variantId} item={item}/>
                    ))}

                    <Flex justify="flex-end" mt={4}>
                        <Text
                            as="button"
                            fontSize="sm"
                            color="brand.purpleSoft"
                            textDecoration="underline"
                            cursor="pointer"
                            _hover={{color: 'brand.pinkDark'}}
                            onClick={clear}
                        >
                            Vaciar carrito
                        </Text>
                    </Flex>
                </Box>

                <Box>
                    <Box
                        bg="white"
                        borderRadius="card"
                        p={6}
                        boxShadow="0 2px 12px rgba(107, 46, 171, 0.06)"
                        position="sticky"
                        top="90px"
                    >
                        <Heading
                            fontFamily="heading"
                            fontSize="lg"
                            fontWeight="600"
                            color="brand.purple"
                            mb={4}
                        >
                            Resumen
                        </Heading>
                        <Stack gap={3}>
                            <Flex justify="space-between">
                                <Text fontSize="sm" color="brand.purpleSoft">
                                    Subtotal (sin envío)
                                </Text>
                                <Text fontSize="sm" fontWeight="600" color="brand.purple">
                                    {formatPrice(subtotalCents)}
                                </Text>
                            </Flex>

                            <Flex justify="space-between">
                                <Text fontSize="sm" color="brand.purpleSoft">
                                    Envío
                                </Text>
                                <Text fontSize="sm" color="brand.purpleSoft">
                                    Por calcular
                                </Text>
                            </Flex>
                            <Box borderTop="1px solid" borderColor="brand.purpleLight" pt={3}>
                                <Flex justify="space-between" align="center">
                                    <Text fontSize="md" fontWeight="700" color="brand.purple">
                                        Total
                                    </Text>
                                    <Text fontSize="xl" fontWeight="700" color="brand.purple">
                                        {formatPrice(subtotalCents)}
                                    </Text>
                                </Flex>
                            </Box>

                            <ChakraLink as={RouterLink} to="/checkout" _hover={{textDecoration:'none'}}>
                                    <Button
                                    bg="brand.purple"
                                    color="white"
                                    borderRadius="pill"
                                    py={6}
                                    mt={2}
                                    fontFamily="heading"
                                    fontWeight="600"
                                    _hover={{bg:'brand.purpleDark'}}
                                >
                                    Iniciar compra
                                </Button>
                            </ChakraLink>
                        </Stack>
                    </Box>
                </Box>
            </Grid>
        </Box>
    );
}

export default CartPage;