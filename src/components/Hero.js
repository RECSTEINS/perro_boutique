import { Box, Button, Flex, Heading, Text, Stack, HStack } from '@chakra-ui/react';

function Hero() {
  return (
    <Box maxW="1200px" mx="auto" px={{ base: 5, md: 8 }} py={{ base: 10, md: 14 }} position="relative">

      <Flex
        direction={{ base: 'column', md: 'row' }}
        gap={10}
        align="center"
      >
        {/* Lado izquierdo: texto y botones */}
        <Stack flex="1.1" gap={5} position="relative" zIndex={1}>
          <Box
            display="inline-block"
            bg="brand.pinkLight"
            color="brand.pinkDark"
            fontSize="xs"
            fontWeight="700"
            px={3.5}
            py={1.5}
            borderRadius="pill"
            letterSpacing="0.5px"
            alignSelf="flex-start"
          >
            ✨ NUEVA COLECCIÓN
          </Box>

          <Heading
            as="h1"
            fontFamily="heading"
            fontSize={{ base: '4xl', md: '6xl' }}
            fontWeight="600"
            lineHeight="1.05"
            letterSpacing="-1px"
            color="brand.purple"
          >
            Estilo para cada<br />
            <Box as="span" color="brand.pink">colita feliz</Box> 🎀
          </Heading>

          <Text fontSize="md" color="brand.purpleSoft" maxW="460px" lineHeight="1.6" fontWeight="500">
            Ropa, accesorios y mimos para tu peludito favorito. Hecho con mucho amor por mamá e hija.
          </Text>

          <HStack gap={3} pt={2}>
            <Button
              bg="brand.purple"
              color="white"
              borderRadius="pill"
              px={7}
              py={6}
              fontFamily="heading"
              fontWeight="600"
              fontSize="sm"
              _hover={{ bg: 'brand.purpleDark' }}
            >
              Ver tienda
            </Button>
            <Button
              bg="brand.mint"
              color="white"
              borderRadius="pill"
              px={7}
              py={6}
              fontFamily="heading"
              fontWeight="600"
              fontSize="sm"
              _hover={{ bg: '#56B8A0' }}
            >
              Conócenos 🐾
            </Button>
          </HStack>
        </Stack>

        {/* Lado derecho: visual con la mascota */}
        <Box
          flex="1"
          position="relative"
          h={{ base: '280px', md: '360px' }}
          w="full"
          bg="brand.purpleLight"
          borderRadius="24px"
          overflow="hidden"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* Borde punteado decorativo */}
          <Box
            position="absolute"
            inset="20px"
            border="3px dashed"
            borderColor="#C4A0E8"
            borderRadius="16px"
          />
          <Text fontSize={{ base: '160px', md: '200px' }} lineHeight="1" zIndex={1}>
            🐕
          </Text>
          <Box
            position="absolute"
            top="28px"
            left="28px"
            bg="brand.mint"
            color="white"
            px={3.5}
            py={2}
            borderRadius="pill"
            fontSize="xs"
            fontWeight="700"
            transform="rotate(-8deg)"
          >
            ¡Hola, soy Luna!
          </Box>
          <Box
            position="absolute"
            bottom="28px"
            right="28px"
            bg="brand.yellow"
            color="#78350F"
            px={3.5}
            py={2}
            borderRadius="pill"
            fontSize="xs"
            fontWeight="700"
            transform="rotate(6deg)"
          >
            ⭐ Modelo del mes
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}

export default Hero;
