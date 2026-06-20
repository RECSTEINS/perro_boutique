import { useState } from "react";
import { Box, Flex, Stack, HStack, Text, Button } from "@chakra-ui/react";
import { FiRepeat, FiCopy, FiCheck, FiArrowLeft, FiMessageCircle } from "react-icons/fi";
import { formatPrice } from "../utils/format";

function DatoCopiable({ etiqueta, valor, copiable = false }){
    const [copiado, setCopiado ] = useState(false);

    async function copiar(){
        try{
            await navigator.clipboard.writeText(valor);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        } catch(error){
            console.error("No se pudo copiar: ", error);
        }
    }

    return(
        <Flex justify="space-between" align="center" gap={3}>
            <Stack gap={0} minW={0}>
                <Text fontSize="xs" color="brand.purpleSoft" fontWeight="600">
                    {etiqueta}
                </Text>
                <Text fontSize="xs" fontWeight="700" color="brand.purple" fontFamily="mono" truncate>
                    {valor}
                </Text>
            </Stack>
            {copiable && (
                <Button
                    size="xs"
                    variant="ghost"
                    color={copiado ? "brand.mint" : "brand.purpleSoft"}
                    fontWeight="600"
                    flexShrink={0}
                    _hover={{bg: "brand.purpleLight"}}
                    onClick={copiar}
                >
                    <Box as={copiado ? FiCheck : FiCopy} boxSize="14px" mr={1}/>
                    {copiado ? "Copiado" : "Copiar"}
                </Button>
            )}
        </Flex>
    );
}

function PagoTransferencia({ amountCents, onRegistrar, datos, registrando, errorMessage, onVolver}){
    if(datos){
        const {datosBancarios, whatsapp, orderId} = datos;
        const numeroPedido = orderId ? String(orderId).slice(0, 8).toUpperCase() : null;

        const mensajeWA = encodeURIComponent(
            `¡Hola! Acabo de hacer mi pedido${numeroPedido ? ` #${numeroPedido}` : ""} en La PerroBoutique y quiero enviar mi comprobante de transferencia. :D`
        );
        const linkWhatsApp = whatsapp ? `https://wa.me/${whatsapp}?text=${mensajeWA}` : null;

        return(
            <Stack gap={4}>
                <HStack gap={2} color="brand.purple">
                    <Box as={FiRepeat} boxSize="18px"/>
                    <Text fontSize="sm" fontWeight="700">
                        Datos para tu transferencia
                    </Text>
                </HStack>

                <Box
                    bg="brand.cream"
                    borderRadius="card"
                    p={4}
                    borderWidth="1px"
                    borderColor="brand.purpleLight"
                >
                    <Text fontSize="sm" color="brand.purpleSoft" mb={4}>
                        Transfiere el monto exacto a esta cuenta. Tu pedido queda apartado
                        mientras confirmamos que recibimos el pago.
                    </Text>

                    <Stack gap={3.5}>
                        <DatoCopiable etiqueta={"Banco"} valor={datosBancarios.banco}/>
                        <DatoCopiable etiqueta={"Titular"} valor={datosBancarios.titular}/>
                        <DatoCopiable etiqueta={"CLABE"} valor={datosBancarios.clabe} copiable/>
                        <DatoCopiable etiqueta={"Tarjeta"} valor={datosBancarios.tarjeta} copiable/>
"
                        <Box borderTop="1px solid" borderColor="brand.purpleLight" pt={3.5}>
                            <Flex justify="space-between" align="center" gap={3}>
                                <Stack gap={0}>
                                    <Text fontSize="xs" color="brand.purpleSoft" fontWeight="600">
                                        Monto exacto
                                    </Text>
                                    <Text fontSize="lg" fontWeight="700" color="brand.pink">
                                        {formatPrice(amountCents)}
                                    </Text>
                                </Stack>
                                <CopiarMonto amountCents={amountCents}/>
                            </Flex>
                        </Box>
                    </Stack>
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
                            Cuando hayas transferido, envíanos tu comprobante por whatsapp
                            para confirmar tu pedido.
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
                            Enviar comprobante por WhatsApp
                        </Button>
                    </Stack>
                ) : (
                    <Text fontSize="sm" color="brand.purpleSoft" textAlign="center">
                        Cuando hayas transferido, envíanos tu comprobante para confirmar
                        tu pedido junto a tu número de orden. Te llegarán los datos de contacto 
                        por correo y/o whatsapp
                    </Text>
                )}
                
                <Text fontSize="xs" color="brand.purpleSoft" textAlign="center">
                    💡 Guarda tu número de pedido. Lo necesitarás para cualquier aclaración.
                </Text>
            </Stack>
        );
    }

    return(
        <Stack gap={4}>
            <HStack gap={2} color="brand.purple">
                <Box as={FiRepeat} boxSize="18px"/>
                <Text fontSize="sm" fontWeight="700">
                    Transferencia bancaria o depósito
                </Text>
            </HStack>

            <Box bg="brand.cream" borderRadius="card" p={4}>
                <Stack gap={2}>
                    <Text fontSize="sm" color="brand.purpleSoft">
                        Al registrar tu pedido te mostramos los datos de la cuenta para 
                        que hagas tu transferencia o depósito. Tu pedido queda apartado 
                        mientras confirmamos el pago.
                    </Text>
                    <Flex justify="space-between" align="center" pt={2}>
                        <Text fontSize="sm" fontWeight="600" color="brand.purple">
                            Total a transferencia
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
                _hover={{bg: "brand.purpleDark"}}
                onClick={onRegistrar}
                loading={registrando}
                loadingText="Registrando pedido..."
            >
                <Box as={FiRepeat} boxSize="18px" mr={2}/>
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

function CopiarMonto({ amountCents }){
    const [copiado, setCopiado] = useState(false);
    const montoPlano = (amountCents / 100).toFixed(2);

    async function copiar(){
        try{
            await navigator.clipboard.writeText(montoPlano);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000)
        } catch(error){
            console.error("No se pudo copiar: ", error)
        }
    }

    return(
        <Button
            size="xs"
            variant="ghost"
            color={copiado ? "brand.mint" : "brand.purpleSoft"}
            fontWeight="600"
            flexShrink={0}
            _hover={{bg: "brand.purpleLight"}}
            onClick={copiar}
        >
            <Box as={copiado ? FiCheck : FiCopy} boxSize="14px" mr={1}/>
            {copiado ? "Copiado" : "Copiar"}
        </Button>
    );
}

export default PagoTransferencia;