import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Stack, Heading, Text, Button, Spinner, Link as ChakraLink} from "@chakra-ui/react";
import { FiCheckCircle, FiXCircle, FiClock, FiArrowLeft, FiShoppingBag } from "react-icons/fi";
import { useCart } from "../lib/CartContext";
import { supabase } from "../lib/supabase";

function PaymentResultPage(){
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clear } = useCart();

    const status = searchParams.get('status');
    const orderId = searchParams.get('external_reference');
    const [order, setOrder] = useState(null);
    const [loadingOrder, setLoadingOrder] = useState(false);

    useEffect(() => {
        if(status === 'approved' || status === 'success'){
            clear();
        }
    }, [status]);

    useEffect(() => {
        if(!orderId) return;
        let mounted = true;

        async function loadOrder(){
            setLoadingOrder(true);
            const {data} = await supabase.from('orders').select('id, total_cents, status, created_at')
                .eq('id', orderId).maybeSingle();
            
            if(mounted){
                setOrder(data);
                setLoadingOrder(false);
            }
        }

        loadOrder();
        return() => {mounted = false};
    }, [orderId]);

    const esExito = status === 'approved' || status === 'success';
    const esPendiente = status === 'pending' || status === 'in_process';

    let config;
    if(esExito){
        config = {
            icon: FiCheckCircle,
            color: 'brand.mint',
            titulo: '¡Gracias por tu compra!',
            mensaje: 'Tu pago se realizó con éxito. Te enviaremos los detalles de tu pedido por correo.',
        };
    } else if(esPendiente){
        config = {
            icon: FiClock,
            color: 'brand.yellow',
            titulo: 'Tu pago está pendiente',
            mensaje: 'Estamos esperando la confirmación de tu pago. Te avisaremos en cuanto se acredite'
        };
    } else{
        config = {
            icon: FiXCircle,
            color: 'brand.pinkDark',
            titulo: 'El pago no se completó',
            mensaje: 'Algo salió mal con tu pago. No te preocupes, no se hizo ningún cargo. Puedes intentarlo de nuevo.'
        };
    }

    const numeroPedido = order?.id ? order.id.slice(0, 8).toUpperCase() : null;
    return(
        <Box maxW="500" mx="auto" px={5} py={{base:12, md:16}}>
            <Stack align="center" gap={5} textAlign="center">
                <Box as={config.icon} boxSize="72px" color={config.color}/>

                <Heading fontFamily="heading" fontSize={{base:'2xl', md:'3xl'}} fontWeight = "600" color="brand.purple">
                    {config.titulo}
                </Heading>

                <Text fontSize="md" color="brand.purpleSoft" lineHeight="1,6">
                    {config.mensaje}
                </Text>
                {esExito && (
                    <Box bg="white" borderRadius="card" px={6} py={4} boxShadow="0 2px 12px rgba(107, 46, 171, 0.06)">
                        {loadingOrder ? (
                            <Spinner color="brand.purple" size="sm"/>
                        ) : numeroPedido ? (
                            <Stack gap={0}>
                                <Text fontSize="xs" color="brand.purpleSoft" fontWeight="600" letterSpacing="0.5px">
                                    NÚMERO DE PEDIDO
                                </Text>
                                <Text fontSize="xl" fontWeight="700" color="brand.purple" fontFamily="mono">
                                    #{numeroPedido}
                                </Text>
                            </Stack>
                        ) : (
                            <Text fontSize="sm" color="brand.purpleSoft">
                                Tu pedido se está procesando
                            </Text>
                        )}
                    </Box>
                )}

                <Stack gap={3} w="full" maxW="280px" mt={2}>
                    {esExito || esPendiente ? (
                        <Button
                            bg="brand.purple"
                            color="white"
                            borderRadius="pill"
                            py={6}
                            fontFamily="heading"
                            fontWeight="600"
                            _hover={{bg:'brand.purpleDark'}}
                            onClick={() => navigate('/catalogo')}
                        >
                            <Box as={FiShoppingBag} boxSize="16px" mr={2}/>
                            Seguir comprando
                        </Button>
                    ) : (
                        <Button
                            bg="brand.purple"
                            color="white"
                            borderRadius="pill"
                            py={6}
                            fontFamily="heading"
                            fontWeight="600"
                            _hover={{bg:'brand.purpleDark'}}
                            onClick={() => navigate('/carrito')}
                        >
                            <Box as={FiArrowLeft} boxSize="16px" mr={2}/>
                            Volver al carrito
                        </Button>
                    )}

                    <ChakraLink as={RouterLink} to="/" _hover={{textDecoration:'none'}} textAlign="center">
                        <Text fontSize="sm" color="brand.purpleSoft" _hover={{color:'brand.purple'}} fontWeight="600">
                            Ir al inicio
                        </Text>
                    </ChakraLink>
                </Stack>
            </Stack>
        </Box>
    );
}

export default PaymentResultPage;