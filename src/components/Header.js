import { Box, Flex, HStack, Text, Link as ChakraLink, Image, Circle } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FiSearch, FiHeart, FiShoppingBag } from 'react-icons/fi';
import logo from '../assets/logo_sin_fondo.PNG';

// Items de navegación. Para agregar más solo añade un objeto a este array.
const navItems = [
  { label: 'Catálogo', to: '/catalogo' },
  { label: 'Accesorios', to: '/accesorios' },
  { label: 'Tallas', to: '/tallas' },
  { label: 'Contacto', to: '/contacto' },
];

function Header() {
  return (
    <Box
      as="header"
      bg="white"
      borderBottom="2px solid"
      borderColor="brand.purpleLight"
      position="sticky"
      top={0}
      zIndex={10}
    >
      <Flex
        align="center"
        justify="space-between"
        maxW="1200px"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={3}
      >
        {/* Logo + nombre de la marca */}
        <ChakraLink as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
          <HStack gap={2.5}>
            <Image
              src={logo}
              alt="La Perroboutique"
              boxSize="48px"
              borderRadius="full"
              objectFit="cover"
            />
            <Text
              fontFamily="heading"
              fontSize={{ base: 'lg', md: 'xl' }}
              fontWeight="600"
              color="brand.purple"
              letterSpacing="-0.3px"
              display={{ base: 'none', sm: 'block' }}
            >
              La Perroboutique
            </Text>
          </HStack>
        </ChakraLink>

        {/* Navegación central (se esconde en mobile) */}
        <HStack gap={6} display={{ base: 'none', md: 'flex' }}>
          {navItems.map((item) => (
            <ChakraLink
              key={item.to}
              as={RouterLink}
              to={item.to}
              fontSize="sm"
              fontWeight="600"
              color="brand.purple"
              _hover={{ color: 'brand.pink' }}
            >
              {item.label}
            </ChakraLink>
          ))}
        </HStack>

        {/* Acciones: buscar, favoritos, carrito */}
        <HStack gap={4} color="brand.purple">
          <Box as={FiSearch} boxSize="20px" cursor="pointer" _hover={{ color: 'brand.pink' }} />
          <Box as={FiHeart} boxSize="20px" cursor="pointer" _hover={{ color: 'brand.pink' }} />
          <Box position="relative" cursor="pointer" _hover={{ color: 'brand.pink' }}>
            <Box as={FiShoppingBag} boxSize="20px" />
            {/* Burbujita con el número de items en el carrito */}
            <Circle
              size="18px"
              bg="brand.pink"
              color="white"
              position="absolute"
              top="-8px"
              right="-8px"
              fontSize="10px"
              fontWeight="700"
            >
              2
            </Circle>
          </Box>
        </HStack>
      </Flex>
    </Box>
  );
}

export default Header;
