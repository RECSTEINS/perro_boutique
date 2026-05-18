import { Box, Grid, Heading, Stack, Text } from '@chakra-ui/react';
import ProductCard from './ProductCard';
import { featuredProducts } from '../data/products';

function ProductGrid() {
  return (
    <Box maxW="1200px" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 10, md: 12 }}>
      <Stack align="center" mb={8} gap={1}>
        <Text color="brand.pink" fontSize="xs" fontWeight="700" letterSpacing="1.5px">
          ⋆ FAVORITOS ⋆
        </Text>
        <Heading
          as="h2"
          fontFamily="heading"
          fontSize={{ base: '3xl', md: '4xl' }}
          fontWeight="600"
          color="brand.purple"
          letterSpacing="-0.5px"
        >
          Lo más adorable
        </Heading>
      </Stack>

      <Grid
        templateColumns={{
          base: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
        gap={5}
      >
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Grid>
    </Box>
  );
}

export default ProductGrid;
