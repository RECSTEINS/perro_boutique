import { Box, Text, Stack, AspectRatio, Image } from '@chakra-ui/react';
import { formatPriceRange } from '../utils/format';

// Recibe un objeto "product" como prop y muestra una tarjetita.
function ProductCard({ product }) {
  const hasImage = product.image_urls && product.image_urls.length > 0;
  const firstImage = hasImage ? product.image_urls[0] : null;
  return (
    <Box
      bg="white"
      borderRadius="card"
      p={3.5}
      position="relative"
      cursor="pointer"
      transition="all 0.2s ease"
      _hover={{ transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(107, 46, 171, 0.12)' }}
    >
      {product.is_new && (
        <Box
          position="absolute"
          top={4}
          right={4}
          bg="brand.pink"
          color="white"
          fontSize="10px"
          fontWeight="700"
          px={2.5}
          py={1}
          borderRadius="pill"
          zIndex={1}
          letterSpacing="0.5px"
        >
          NUEVO
        </Box>
      )}

      <AspectRatio ratio={1} mb={3}>
        <Box
          bg="brand.mintLight"
          borderRadius="14px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="80px"
          overflow="hidden"
        >
          {firstImage ? (
            <Image src={firstImage} alt={product.name} w="full" h="full" objectFit="cover" />
            ) : (
            // Placeholder mientras no haya foto real
            '🐾'
          )}
        </Box>
      </AspectRatio>

      <Stack gap={1}>
        <Text fontFamily="heading" fontSize="md" fontWeight="600" color="brand.purple">
          {product.name}
        </Text>
        <Text fontSize="sm" color="brand.pink" fontWeight="700">
          {formatPriceRange(product.product_variants)}
        </Text>
      </Stack>
    </Box>
  );
}

export default ProductCard;