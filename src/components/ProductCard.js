import { Box, Text, Stack, AspectRatio } from '@chakra-ui/react';

// Recibe un objeto "product" como prop y muestra una tarjetita.
function ProductCard({ product }) {
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
      {/* Badge "NUEVO" si product.isNew es true */}
      {product.isNew && (
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
          bg={product.bgColor || 'brand.mintLight'}
          borderRadius="14px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="80px"
        >
          {product.emoji}
        </Box>
      </AspectRatio>

      <Stack gap={1}>
        <Text fontFamily="heading" fontSize="md" fontWeight="600" color="brand.purple">
          {product.name}
        </Text>
        <Text fontSize="sm" color="brand.pink" fontWeight="700">
          ${product.price.toLocaleString('es-MX')} MXN
        </Text>
      </Stack>
    </Box>
  );
}

export default ProductCard;
