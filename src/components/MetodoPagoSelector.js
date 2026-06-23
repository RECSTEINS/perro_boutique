import { Box, Flex, Stack, Text, Circle } from "@chakra-ui/react";
import { FiCreditCard, FiDollarSign, FiRepeat, FiMapPin, FiExternalLink, FiChevronRight } from "react-icons/fi";


const CPS_CANCUN = ["77500", "77503", "77504",  "77505", "77506", "77507",
    "77508","77509", "77510", "77513", "77514", "77515", "77516", "77517",
    "77518", "77519", "77520", "77524", "77525", "77526", "77527", "77528",
    "77530", "77533", "77534", "77535", "77536", "77537", "77538", "77539",
    "77550", "77567", "77569"
];

function metodoContraEntregaDisponible(cpDestino){
    if(!cpDestino) return false;
    const cp = String(cpDestino).replace(/\D/g, "");
    return CPS_CANCUN.includes(cp);
}

function MetodoPagoSelector({ onSelect, cpDestino }){
    const contraEntregaOk = metodoContraEntregaDisponible(cpDestino);

    const metodos = [
        {
            id:"tarjeta",
            icon: FiCreditCard,
            titulo: "Tarjeta de crédito o débito",
            subtitulo: "Pago inmediato y seguro",
            disponible: true
        },
        {
            id:"oxxo",
            icon: FiDollarSign,
            titulo: "Efectivo en OXXO",
            subtitulo: "Genera tu ficha y paga en cualquier tienda",
            disponible: true
        },
        {
            id:"transferencia",
            icon: FiRepeat,
            titulo: "Transferencia bancaria (SPEI)",
            subtitulo: "Proximamente",
            disponible: true
        },
        {
            id:"contra_entrega",
            icon: FiMapPin,
            titulo: "Pago contra entrega",
            subtitulo: contraEntregaOk ? "Disponible en tu zona (Cancún) · acordamos punto por WhatsApp"
                : "Solo disponible en Cancún",
            disponible: true,
            soloInfo: !contraEntregaOk
        },
        {
            id:"mercadopago",
            icon: FiExternalLink,
            titulo: "Mercado Pago",
            subtitulo: "Proximamente  · te llevamos a su página segura",
            disponible: false
        }
    ];

    return(
        <Stack gap={3}>
            <Text fontSize="sm" fontWeight="700" color="brand.purple">
                Elige cómo quieres pagar
            </Text>
            {metodos.map((m) => {
                const clickable = m.disponible;
                return(
                    <Flex
                        key={m.id}
                        as={clickable ? "button" : "div"}
                        onClick={clickable ? () => onSelect(m.id) : undefined}
                        align="center"
                        gap={3}
                        p={4}
                        bg="white"
                        borderWidth="1px"
                        borderColor="brand.purpleLight"
                        borderRadius="card"
                        cursor={clickable ? "pointer" : "default"}
                        opacity={clickable ? 1 : 0.6}
                        textAlign="left"
                        transition="all 0.15s ease"
                        _hover={clickable ? {borderColor: "brand.purple", bg: "brand.cream"} : {}}
                    >
                        <Circle
                            size="44px"
                            bg={clickable ? "brand.purpleLight" : "gray.100"}
                            color={clickable ? "brand.purple" : "gray.400"}
                            flexShrink={0}
                        >
                            <Box as={m.icon} boxSize="20px"/>
                        </Circle>
                        <Stack gap={0} flex="1" minW={0}>
                            <Text fontSize="sm" fontWeight="700" color="brand.purple" lineHeight="1.2">
                                {m.titulo}
                            </Text>
                            <Text fontSize="xs" color="brand.purpleSoft">
                                {m.subtitulo}
                            </Text>
                        </Stack>
                        {clickable ? (
                            <Box as={FiChevronRight} boxSize="20px" color="brand.purpleSoft" flexShrink={0}/>
                        ) : (
                            <Text
                                fontSize="9px"
                                fontWeight="700"
                                bg="brand.purpleLight"
                                color="brand.purple"
                                px={2}
                                py={1}
                                borderRadius="pill"
                                letterSpacing="0.5px"
                                flexShrink={0}
                            >
                                PRONTO
                            </Text>
                        )}
                    </Flex>
                );
            })}
        </Stack>
    );
}

export default MetodoPagoSelector;