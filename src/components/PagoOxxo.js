import { useState } from "react";
import { Box, Flex, Stack, HStack, Text, Button, Spinner } from "@chakra-ui/react";
import { FiDollarSign, FiExternalLink, FiArrowLeft } from "react-icons/fi";
import { formatPrice } from "../utils/format";

function PagoOxxo({ amountCents, onGenerar, voucheUrl, generando, errorMessage, onVolver}){
    const [iframeError, setIframeError] = useState(false);

    if(voucheUrl){
        return(
            <Stack gap={4}>
                <HStack gap={2} color="brand.purple">
                    <Box as={FiDollarSign} boxSize="18px"/>
                    <Text fontSize="sm" fontWeight="700">
                        Tu ficha de pago OXXO
                    </Text>
                </HStack>

                <Box
                    bg="brand.cream"
                    borderRadius="card"
                    p={4}
                    borderWidth="1px"
                    borderColor="brand.purpleLight"
                >
                    <Text fontSize="sm" color="brand.purpleSoft" mb={3}>
                        Muestra este código en la caja de cualquier OXXO. Tu pedido queda
                        apartado y te confirmamos por correo cuando recibamos el pago.
                    </Text>
                    {!iframeError ? (
                        <Box
                            as="iframe"
                            src={voucheUrl}
                            title="Ficha de pago OXXO"
                            w="full"
                            h="600px"
                            borderRadius="12px"
                            borderWidth="1px"
                            borderColor="brand.purpleLight"
                            bg="white"
                            onError={() => setIframeError(true)}
                        />
                    ) : (
                        <Stack align="center" gap={3} py={6}>
                            <Text fontSize="sm" color="brand.purpleSoft" textAlign="center">
                                No pudimos mostrar la ficha aquí. Ábrela en una pestaña nueva:
                            </Text>
                        </Stack>
                    )}

                    <Button
                        as="a"
                        href={voucheUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        mt={3}
                        w="full"
                        bg="brand.purple"
                        color="white"
                        borderRadius="pill"
                        fontFamily="heading"
                        fontWeight="600"
                        _hover={{bg: "brand.purpleDark"}}
                    >
                        <Box as={FiExternalLink} boxSize="16px" mr={2}/>
                        Abrir ficha en pestaña nueva
                    </Button>
                </Box>

                <Text fontSize="xs" color="brand.purpleSoft" textAlign="center">
                    💡 La ficha también llegó a tu correo. Tienes un plazo para pagarla
                    antes de que expire.
                </Text>
            </Stack>
        );
    }

    return(
        <Stack gap={4}>
            <HStack gap={2} color="brand.purple">
                <Box as={FiDollarSign} boxSize="18px"/>
                <Text fontSize="sm" fontWeight="700">
                    Pago en efectivo (OXXO)
                </Text>
            </HStack>

            <Box bg="brand.cream" borderRadius="card" p={4}>
                <Stack gap={2}>
                    <Text fontSize="sm" color="brand.purpleSoft">
                        Al generar tu ficha, te mostramos un código de barras que puedes
                        pagar en cualquier tienda OXXO. Tu pedido quedará apartado mientras
                        recibimos el pago.
                    </Text>
                    <Flex justify="space-between" align="center" pt={2}>
                        <Text fontSize="sm" fontWeight="600" color="brand.purple">
                            Total a pagar
                        </Text>
                        <Text fontSize="lg" fontWeight="700" color="brand.purple">
                            {formatPrice(amountCents)}
                        </Text>
                    </Flex>
                </Stack>
            </Box>

            {errorMessage && (
                <Text
                    fontSize="sm"
                    color="brand.pinkDark"
                    bg="brand.pinkLight"
                    p={3}
                    borderRadius="md"
                >
                    {errorMessage}
                </Text>
            )}
            <Button
                bg="brand.purple"
                color="white"
                borderRadius="pill"
                py={6}
                fontFamily="heading"
                fontWeight="600"
                fontSize="md"
                _hover={{bg:"brand.purpleDark"}}
                onClick={onGenerar}
                loading={generando}
                loadingText="Generando ficha..."
            >
                <Box as={FiDollarSign} boxSize="18px" mr={2}/>
                Generar ficha de pago
            </Button>

            <Button
                variant="ghost"
                color="brand.purpleSoft"
                fontWeight="600"
                fontSize="sm"
                _hover={{bg:"transparent", color: "brand.purple"}}
                onClick={onVolver}
            >
                <Box as={FiArrowLeft} boxSize="14px" mr={1}/>
                Cambiar opción de pago
            </Button>
        </Stack>
    );
}

export default PagoOxxo;