import { Box, Flex, HStack, Text, Link } from '@chakra-ui/react';
import { CiInstagram, CiFacebook } from "react-icons/ci";
import { FaTiktok } from "react-icons/fa";


function Footer() {
  return (
    <Box as="footer" bg="brand.purple" color="brand.purpleLight" mt={12}>
      <Flex
        maxW="1200px"
        mx="auto"
        px={{ base: 5, md: 8 }}
        py={8}
        align={{ base: 'flex-start', md: 'center' }}
        justify="space-between"
        direction={{ base: 'column', md: 'row' }}
        gap={4}
      >
        <Text fontSize="sm" fontWeight="500">
          © {new Date().getFullYear()} La Perroboutique · Hecho con 💜 por mamá e hija
        </Text>
        <HStack gap={5}>
          <Link href="#" color="brand.purpleLight" _hover={{ color: 'white' }} fontSize="sm" fontWeight="600">
            <Box as={CiInstagram} boxSize="30px" cursor="pointer" _hover={{ color: 'brand.pink' }} />
          </Link>
          <Link href="#" color="brand.purpleLight" _hover={{ color: 'white' }} fontSize="sm" fontWeight="600">
            <Box as={CiFacebook} boxSize="30px" cursor="pointer" _hover={{ color: 'brand.pink' }} />
          </Link>
          <Link href="#" color="brand.purpleLight" _hover={{ color: 'white' }} fontSize="sm" fontWeight="600">
            <Box as={FaTiktok} boxSize='30px' cursor='pointer' _hobver={{ color: 'brand.pink' }} />
          </Link>
        </HStack>
      </Flex>
    </Box>
  );
}

export default Footer;
