import { Box, Grid, Heading, Spinner, Stack, Text } from '@chakra-ui/react';
import ProductCard from './ProductCard';
import { useFeaturedProducts } from '../hooks/useFeaturedProducts';

function ProductGrid() {

  const { products, loading, error } = useFeaturedProducts();
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

      {loading && (
        <Stack align="center" py={10}>
          <Spinner color="brand.purple"/>
          <Text fontSize="sm" color="brand.purpleSoft">Cargando productos...</Text>
        </Stack>
      )}

      {error && (
        <Text textAlign="center" color="brand.pinkDark" py={6}>
          Ups, no pudimos cargar los productos. Recarga la página, por favor.
        </Text>
      )}

      {!loading && !error && (
        <Grid
          templateColumns={{
            base: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          }}
          gap={5}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default ProductGrid;
