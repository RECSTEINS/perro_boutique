import { Box, Flex, HStack, Text } from '@chakra-ui/react';

const benefits = [
  { icon: '🚚', text: 'Envío gratis +$800' },
  { icon: '💖', text: 'Hecho a mano' },
  { icon: '🎁', text: 'Empaque sorpresa' },
];

function Benefits() {
  return (
    <Box bg="white" py={6}>
      <Flex
        maxW="1200px"
        mx="auto"
        px={{ base: 5, md: 8 }}
        gap={3}
        justify="center"
        wrap="wrap"
      >
        {benefits.map((b) => (
          <HStack
            key={b.text}
            bg="brand.cream"
            px={4}
            py={2}
            borderRadius="pill"
            gap={2}
          >
            <Text fontSize="md">{b.icon}</Text>
            <Text fontSize="sm" fontWeight="600" color="brand.purple">
              {b.text}
            </Text>
          </HStack>
        ))}
      </Flex>
    </Box>
  );
}

export default Benefits;
