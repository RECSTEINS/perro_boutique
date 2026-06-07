import { useState } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { Box, Flex, Grid, Stack, HStack, Heading, Text, Image, Button, Badge, Spinner, AspectRatio, Link as ChakraLink} from "@chakra-ui/react";
import { FiShoppingBag, FiArrowLeft, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useProduct } from "../hooks/useProduct";
import { formatPrice } from "../utils/format";
import SizeGuide from "../components/SizeGuide";

function ProductPage(){
    const {slug} = useParams();
    const {product, loading, notFound} = useProduct(slug);

    const [activeImage, setActiveImage] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(null);

    if(loading){
        return(
            <Stack align="center" justify="center" minH="60vh" gap={3}>
                <Spinner color="brand.purple" size="lg"/>
                <Text fontSize="sm" color="brand.purpleSoft">Cargando producto...</Text>
            </Stack>
        );
    }

    if(notFound || !product){
        return(
            <Stack align="center" justify="center" minH="60vh" gap={4} px={5}>
                <Text fontSize="60px">🐾</Text>
                <Heading fontFamily="heading" fontSize="2xl" color="brand.purple" textAlign="center">
                    No encontramos este producto
                </Heading>
                <Text fontSize="sm" color="brand.purpleSoft" textAlign="center">
                    Puede que ya no esté disponible.
                </Text>
                <ChakraLink as={RouterLink} to="/">
                    <Button
                        bg="brand.purple"
                        color="white"
                        borderRadius="pill"
                        px={6}
                        fontFamily="heading"
                        fontWeight="600"
                        _hover={{bg: 'brand.purpleDark'}}
                    >
                        <Box as={FiArrowLeft} boxSize="16px" mr={2}/>
                        Volver a la tienda
                    </Button>
                </ChakraLink>
            </Stack>
        )
    }

    const images = product.image_urls && product.image_urls.length > 0 ? product.image_urls : [];
    const hasImages = images.length > 0;
    const variants = product.product_variants || [];

    const displayVariant = 
        selectedVariant || 
        (variants.length > 0 
            ? variants.reduce((min, v) => (v.price_cents < min.price_cents ? v : min), variants[0])
            : null);
    
    const hasDiscount = 
        displayVariant && 
        displayVariant.compare_at_price_cents && 
        displayVariant.compare_at_price_cents > displayVariant.price_cents;

    function prevImage(){
        setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1));
    }

    function nextImage(){
        setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1));
    }

    return(
        <Box maxW="1100px" mx="auto" px={{base: 5, md: 8}} py={{base: 6, md: 10}}>
            <ChakraLink as={RouterLink} to="/" _hover={{textDecoration: 'none'}}>
                <HStack gap={1.5} color="brand.purpleSoft" mb={6} _hover={{color:'brand.purple'}}>
                    <Box as={FiArrowLeft} boxSize="16px"/>
                    <Text fontSize="sm" fontWeight="600">Volver a la tienda</Text>
                </HStack>
            </ChakraLink>

            <Grid templateColumns={{base: '1fr', md: '1fr 1fr'}} gap={{base: 8, md: 10}}>
                <Stack gap={3}>
                    <Box position="relative" borderRadius="card" overflow="hidden" bg="brand.mintLight">
                        <AspectRatio ratio={1}>
                            {hasImages ? (
                                <Image
                                    src={images[activeImage]}
                                    alt={product.name}
                                    objectFit="cover"
                                    w="full"
                                    h="full"
                            />
                            ) : (
                                <Flex align="center" justify="center" fontSize="120px">
                                    🐾
                                </Flex>
                            )}
                        </AspectRatio>

                        {images.length > 1 && (
                            <>
                                <Box
                                    as="button"
                                    position="absolute"
                                    top="50%"
                                    left="12px"
                                    transform="translateY(-50%)"
                                    bg="whiteAlpha.900"
                                    color="brand.purple"
                                    borderRadius="full"
                                    p={2}
                                    cursor="pointer"
                                    _hover={{bg:'white'}}
                                    onClick={prevImage}
                                    aria-label="Anterior"
                                >
                                    <Box as={FiChevronLeft} boxSize="20px"/>
                                </Box>
                                <Box
                                    as="button"
                                    position="absolute"
                                    top="50%"
                                    right="12px"
                                    transform="translateY(-50%)"
                                    bg="whiteAlpha.900"
                                    color="brand.purple"
                                    borderRadius="full"
                                    p={2}
                                    cursor="pointer"
                                    _hover={{bg: 'white'}}
                                    onClick={nextImage}
                                    aria-label="Siguiente"
                                >
                                    <Box as={FiChevronRight} boxSize="20px"/>
                                </Box>
                            </>
                        )}

                        {product.is_new && (
                            <Badge
                                position="absolute"
                                top="14px"
                                left="14px"
                                bg="brand.pink"
                                color="white"
                                fontSize="11px"
                                fontWeight="700"
                                borderRadius="pill"
                                px={3}
                                py={1}
                                letterSpacing="0.5px"
                            >
                                NUEVO
                            </Badge>
                        )}
                    </Box>

                    {images.length > 1 && (
                        <HStack gap={2} wrap="wrap">
                            {images.map((url, index) => (
                                <Box
                                    key={url}
                                    as="button"
                                    w="64px"
                                    h="64px"
                                    borderRadius="12px"
                                    overflow="hidden"
                                    borderWidth="2px"
                                    borderColor={index === activeImage ? 'brand.pink' : 'transparent'}
                                    cursor="pointer"
                                    onClick={() => setActiveImage(index)}
                                    transition="all 0.15s ease"
                                    _hover={{borderColor: 'brand.purpleLight'}}
                                >
                                    <Image src={url} alt={`Vista ${index + 1}`} w="full" h="full" objectFit="cover"/>
                                </Box>
                            ))}
                        </HStack>
                    )}
                </Stack>

                <Stack gap={5}>
                    <Stack gap={2}>
                        <Heading
                            as="h1"
                            fontFamily="heading"
                            fontSize={{ base:'2xl', md:'3xl'}}
                            fontWeight="600"
                            color="brand.purple"
                            lineHeight="1.1"
                        >
                            {product.name}
                        </Heading>

                        {displayVariant && (
                            <HStack gap={3} align="baseline">
                                <Text fontSize="2xl" fontWeight="700" color="brand.pink">
                                    {formatPrice(displayVariant.price_cents)}
                                </Text>
                                {hasDiscount && (
                                    <Text fontSize="md" color="brand.purpleSoft" textDecoration="line-through">
                                        {formatPrice(displayVariant.compare_at_price_cents)}
                                    </Text>
                                )}
                                {!selectedVariant && variants.length > 1 && (
                                    <Text fontSize="xs" color="brand.purpleSoft">
                                        (desde)
                                    </Text>
                                )}
                            </HStack>
                        )}
                    </Stack>

                    {product.description && (
                        <Text fontSize="sm" color="brand.purpleSoft" lineHeight="1.7">
                            {product.description}
                        </Text>
                    )}
                    <Stack gap={2}>
                        <Text fontSize="sm" fontWeight="700" color="brand.purple">
                            Elige una talla
                        </Text>
                        <HStack gap={2} wrap="wrap">
                            {variants.map((variant) => {
                                const isSelected = selectedVariant?.id === variant.id;
                                const soldOut = variant.stock <= 0;
                                return(
                                    <Box
                                        key={variant.id}
                                        as="button"
                                        px={4}
                                        py={2}
                                        borderRadius="12px"
                                        borderWidth="2px"
                                        borderColor={isSelected ? 'brand.purple' : 'brand.purpleLight'}
                                        bg={isSelected ? 'brand.purpleLight' : 'white'}
                                        color={soldOut ? 'gray.400': 'brand.purple' }
                                        fontWeight="700"
                                        fontSize="sm"
                                        cursor={soldOut ? 'not-allowed' : 'pointer'}
                                        opacity={soldOut ? 0.5 : 1}
                                        position="relative"
                                        onClick={() => !soldOut && setSelectedVariant(variant)}
                                        _hover={soldOut ? {} : {borderColor: 'brand.purple'}}
                                        title={soldOut ? 'Agotado' : `Talla ${variant.size}`}
                                    >
                                        {variant.size}
                                        {soldOut && (
                                            <Text fontSize="9px" color="brand.pinkDark" fontWeight="600">
                                                agotado
                                            </Text>
                                        )}
                                    </Box>
                                );
                            })}
                        </HStack>

                        {selectedVariant && (
                            <Text fontSize="xs" color="brand.purpleSoft">
                                {selectedVariant.stock > 0
                                    ? `${selectedVariant.stock} disponibles en talla ${selectedVariant.size}`
                                    : 'Esta talla está agotada'}
                            </Text>
                        )}
                    </Stack>

                    <Button
                        bg="brand.purple"
                        color="white"
                        borderRadius="pill"
                        py={7}
                        fontFamily="heading"
                        fontWeight="600"
                        fontSize="md"
                        _hover={{ bg: 'brand.purpleDark'}}
                        disabled
                    >
                        <Box as={FiShoppingBag} boxSize="18px" mr={2}/>
                        Agregar al carrito
                    </Button>
                    <Text fontSize="xs" color="brand.purpleSoft" textAlign="center" mt={-2}>
                        🐾 El carrito estará disponible muy pronto
                    </Text>
                </Stack>
            </Grid>

            <SizeGuide/>
        </Box>
    )
}

export default ProductPage;