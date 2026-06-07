import { useState } from "react";
import { Box, Flex, Grid, Stack, HStack, Heading, Text, Image, Button, Table, Circle } from  '@chakra-ui/react';
import { FiX } from "react-icons/fi";
import medirLargo from '../assets/medir_largo.jpg';
import medirCuello from '../assets/medir_cuello.jpg';
import medirPecho from '../assets/medir_pecho.jpg';

const SIZE_TABLE = [
    {talla: 'XS', largo: '25 - 30', cuello: '22 - 24', pecho: '36 - 40'},
    {talla: 'S', largo: '32 - 35', cuello: '30 - 32', pecho: '44 - 52'},
    {talla: 'M', largo: '39 - 42', cuello: '34 - 37', pecho: '54 - 60'},
    {talla: 'L', largo: '45 - 49', cuello: '42 - 45', pecho: '65 - 67'},
    {talla: 'XL', largo: '61 - 85', cuello: '52 - 56', pecho: '76 - 88'},
];

const STEPS = [
    {num: 1, img: medirLargo, label: 'Largo total',desc: 'Desde la base del cuello hasta el inicio de la cola.'},
    {num: 2, img: medirCuello, label: 'Contorno de cuello', desc:'Alrededor del cuello, donde va el collar.'},
    {num: 3, img: medirPecho, label: 'Contorno de pecho', desc:'La parte más ancha del pecho, detrás de las patas.'}
];

function GuideContent(){
    return(
        <Stack gap={6}>
            <Grid templateColumns={{ base: '1fr', sm:'repeat(3, 1fr'}} gap={4}>
                {STEPS.map((step) =>(
                    <Stack key={step.num} align="center" gap={2} textAlign="center">
                        <Box position="relative" w="full" bg="brand.cream" borderRadius="card" p={3}>
                            <Circle
                                size="28px"
                                bg="brand.pink"
                                color="white"
                                fontWeight="700"
                                fontSize="sm"
                                position="absolute"
                                top="8px"
                                left="8px"
                            >
                                {step.num}
                            </Circle>
                            <Image src={step.img} alt={step.label} mx="auto" maxH="130px" objectFit="contain"/>
                        </Box>
                        <Text fontWeight="700" color="brand.purple" fontSize="sm">
                            {step.label}
                        </Text>
                        <Text fontSize="xs" color="brand.purpleSoft" lineHeight="1.5">
                            {step.desc}
                        </Text>
                    </Stack>
                ))}
            </Grid>

            <Box borderRadius="card" overflow="hidden" borderWidth="1px" borderColor="brand.purpleLight">
                <Table.Root size="sm">
                    <Table.Header>
                        <Table.Row bg="brand.purpleLight">
                            <Table.ColumnHeader fontWeight="700" color="brand.purple">Talla</Table.ColumnHeader>
                            <Table.ColumnHeader fontWeight="700" color="brand.purple">Largo (cm)</Table.ColumnHeader>
                            <Table.ColumnHeader fontWeight="700" color="brand.purple">Cuello (cm)</Table.ColumnHeader>
                            <Table.ColumnHeader fontWeight="700" color="brand.purple">Pecho (cm)</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {SIZE_TABLE.map((row) => (
                            <Table.Row key={row.talla} _hover={{bg:'brand.cream'}}>
                                <Table.Cell fontWeight="700" color="brand.pink">{row.talla}</Table.Cell>
                                <Table.Cell color="brand.purple">{row.largo}</Table.Cell>
                                <Table.Cell color="brand.purple">{row.cuello}</Table.Cell>
                                <Table.Cell color="brand.purple">{row.pecho}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Box>

            <Text fontSize="xs" color="brand.purpleSoft" textAlign="center">
                💡 Si tu perrito queda entre dos tallas, te recomendamos elegir la más grande.
            </Text>
        </Stack>
    );
}

function SizeGuide(){
    const [open, setOpen] = useState(false);

    return(
        <Box mt={4}>
            <Flex align="center" justify="space-between" mb={4} wrap="wrap" gap={2}>
                <Heading fontFamily="heading" fontSize="xl" fontWeight="600" color="brand.purple">
                    📏 Cómo medir a tu perro
                </Heading>

                <Button
                    display={{base: 'inline-flex', md:'none'}}
                    size="sm"
                    borderRadius="pill"
                    bg="brand.purple"
                    color="white"
                    fontWeight="600"
                    fontSize="xs"
                    _hover={{bg: 'brand.purpleDark'}}
                    onClick={() => setOpen(true)}
                >
                    Ver guía de tallas
                </Button>
            </Flex>

            <Box
                display={{base: 'none', md:'block'}}
                bg="white"
                borderRadius="card"
                p={6}
                boxShadow="0 2px 12px rgba(107, 46, 171, 0.06)"
            >
                <GuideContent/>
            </Box>

            {open && (
                <Box display={{base:'block', md:'none'}}>
                    <Box
                        position="fixed"
                        inset={0}
                        bg="blackAlpha.600"
                        zIndex={50}
                        onClick={() => setOpen(false)}
                    />

                    <Box
                        position="fixed"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        bg="white"
                        borderRadius="card"
                        p={5}
                        zIndex={51}
                        w="92vw"
                        maxH="85vh"
                        overflowY="auto"
                        boxShadow="0 12px 40px rgba(107, 46, 171, 0.25)"
                    >
                        <Flex align="center" justify="space-between" mb={4}>
                            <Heading fontFamily="heading" fontSize="lg" fontWeight="600" color="brand.purple">
                                Cómo medir a tu perro
                            </Heading>
                            <Circle
                                size="32px"
                                bg="brand.purpleLight"
                                color="brand.purple"
                                cursor="pointer"
                                _hover={{bg: 'brand.pinkLight', color:'brand.pinkDark'}}
                                onClick={() => setOpen(false)}
                            >
                                <Box as={FiX} boxSize="18px"/>
                            </Circle>
                        </Flex>
                        <GuideContent/>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default SizeGuide;