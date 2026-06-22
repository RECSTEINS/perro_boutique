import { Box, Flex, Stack, HStack, Text, Button} from "@chakra-ui/react";
import { FiMapPin, FiArrowLeft, FiMessageCircle } from "react-icons/fi";
import { formatPrice } from "../utils/format";

function PagoContraEntrega({ amountCents, onRegistrar, datos, registrando, errorMessage, onVolver}){
    if(datos){
        const {whatsapp, orderId} = datos;
        const numeroPedido = orderId ? String(orderId).slice(0, 8).toUpperCase() : null;

        const mensajeWA = encodeURIComponent(
            `¡Hola! Acabo de hacer mi pedido${numeroPedido ? ` #${numeroPedido}` : ""} en La PerroBoutique 
            con pago contra entrega y quiero acordar el punto de entrega. `
        );
        const linkWhatsApp = whatsapp ? `https://wa.me/${whatsapp}?text=${mensajeWA}` : null;

        return(
            <Stack gap={4}>
                <HStack gap={2} color="brand.purple">
                    <Box as={FiMapPin} boxSize="18px"/>
                    <Text fontSize="sm" fontWeight="700">
                        ¡Pedido registrado!
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
                        Tu pedido quedó apartado. Escríbenos por WhatsApp para acordar 
                        dónde y cuándo entregártelo. Pagas en efectivo al recibir.
                    </Text>

                    <Box borderTop="1px solid" borderColor="brand.purpleLight" pt={3}>
                        <Flex justify="space-between" align="center">
                            <Text fontSize="sm" fontWeight="600" color="brand.purple">
                                Pagas al recibir
                            </Text>
                            <Text fontSize="lg" fontWeight="700" color="brand.pink">
                                {formatPrice(amountCents)}
                            </Text>
                        </Flex>
                    </Box>
                </Box>

                {numeroPedido && (
                    <Box bg="white" borderRadius="card" px={4} py={3} borderWidth="1px" borderColor="brand.purpleLight">
                        <Flex justify="space-between" align="center">
                            <Text fontSize="xs" color="brand.purpleSoft" fontWeight="600" letterSpacing="0.5px">
                                NÚMERO DE PEDIDO
                            </Text>
                            <Text fontSize="md" fontWeight="700" color="brand.purple" fontFamily="mono">
                                #{numeroPedido}
                            </Text>
                        </Flex>
                    </Box>
                )}

                {linkWhatsApp ? (
                    <Stack gap={2}>
                        <Text fontSize="sm" color="brand.purpleSoft" textAlign="center">
                            Acordemos el punto de entrega por WhatsApp para coordinar tu pedido.
                        </Text>
                        <Button
                            as="a"
                            href={linkWhatsApp}
                            target="_blank"
                            rel="noopener noreferrer"
                            bg="brand.mint"
                            color="white"
                            borderRadius="pill"
                            py={6}
                            fontFamily="heading"
                            fontWeight="600"
                            _hover={{bg: "#56B8A0"}}
                        >
                            <Box as={FiMessageCircle} boxSize="18px" mr={2}/>
                            Acordar entrega por WhatsApp
                        </Button>
                    </Stack>
                ) : (
                    <Text fontSize="xs" color="brand.purpleSoft" textAlign="center">
                       💡 Guarda tu número de pedido. Lo necesitarás para coordinar la entrega.
                    </Text>
                )}
            </Stack>
        );
    }

    return(
        <Stack gap={4}>
            <HStack gap={2} color="brand.purple">
                <Box as={FiMapPin} boxSize="18px"/>
                <Text fontSize="sm" fontWeight="700">
                    Pago contra entrega (Cancún)
                </Text>
            </HStack>

            <Box bg="brand.cream" borderRadius="card" p={4}>
                <Stack gap={2}>
                    <Text fontSize="sm" color="brand.purpleSoft">
                        Registra tu pedido y acordamos por WhatsApp dónde entregártelo.
                        Pagas en efectivo en persona, al momento de recibir tu pedido.
                    </Text>
                    <Flex justify="space-between" align="center" pt={2}>
                        <Text fontSize="sm" fontWeight="600" color="brand.purple">
                            Total a pagar al recibir
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
                onClick={onRegistrar}
                loading={registrando}
                loadingText="Registrando pedido..."
            >
                <Box as={FiMapPin} boxSize="18px" mr={2}/>
                Registrar mi pedido
            </Button>

            <Button
                variant="ghost"
                color="brand.purpleSoft"
                fontWeight="600"
                fontSize="sm"
                _hover={{bg: "transparent", color: "brand.purple"}}
                onClick={onVolver}
            >
                <Box as={FiArrowLeft} boxSize="14px" mr={1}/>
                Cambiar opción de pago
            </Button>
        </Stack>
    );
}

export default PagoContraEntrega;