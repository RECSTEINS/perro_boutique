import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Flex, Grid, Stack, HStack, Heading, Text, Input, Button, Field, Link as ChakraLink } from "@chakra-ui/react";
import { FiArrowLeft, FiShoppingBag, FiCheckCircle, FiXCircle, FiClock, FiEdit2 } from "react-icons/fi";
import { useCart } from "../lib/CartContext";
import { useCheckoutForm, ESTADOS_MX } from "../hooks/useCheckoutForm";
import { useShipping } from "../hooks/useShipping";
import { formatPrice } from "../utils/format";
import { supabase } from "../lib/supabase";
import FormularioTarjeta from "../components/FormularioTarjeta";
import { clear } from "@testing-library/user-event/dist/clear";

function CheckoutPage(){
    const {items, itemCount, subtotalCents, clear} = useCart();
    const {form, errors, updateField, validate, getShippingAddress} = useCheckoutForm();
    const navigate = useNavigate();
    const shipping = useShipping();

    const [paso, setPaso] = useState('datos');
    const [procesando, setProcesando] = useState(false);
    const [errorPago, setErrorPago] = useState(null);
    const [resultado, setResultado] = useState(null);

    if(items.length === 0 && paso !== 'resultado'){
        return(
            <Stack align="center" justify="center" minH="60vh" gap={4} px={5}>
                <Box as={FiShoppingBag} boxSize="60px" color="brand.purpleLight"/>
                <Heading fontFamily="heading" fontSize="2xl" color="brand.purple" textAlign="center">
                    Tu carrito está vacío
                </Heading>
                <Text fontSize="sm" color="brand.purpleSoft" textAlign="center">
                    Agrega algo lindo antes de finalizar la compra.
                </Text>
                <Button
                    bg="brand.purple"
                    color="white"
                    borderRadius="pill"
                    px={6}
                    fontFamily="heading"
                    fontWeight="600"
                    _hover={{bg:'brand.purpleDark'}}
                    onClick={() => navigate('/catalogo')}
                >
                    <Box as={FiArrowLeft} boxSize="16px" mr={2}/>
                    Ir a la tienda
                </Button>
            </Stack>
        )
    }

    const shippingCents = shipping.selected ? shipping.selected.priceCents : 0;
    const totalCents = subtotalCents + shippingCents;

    function handleCalculaEnvio(){
        const cp = form.postalCode.replace(/\D/g, '');
        if(cp.length !== 5){
            updateField('postalCode', form.postalCode);
            return;
        }
        shipping.calculate(cp, items);
    }

    function handleIrAPago(){
        const isValid = validate();
        if(!isValid) return;

        if(!shipping.selected){
            setErrorPago("Elige una opción de envío antes de continuar.");
            return;
        }
        setErrorPago(null);
        setPaso('pago');
    }

    async function handlePagar(datosPago){
        setProcesando(true);
        setErrorPago(null);

        try{
            const {data, error} = await supabase.functions.invoke('procesar-pago',{
                body:{
                    items: items.map((it) => ({
                        variantId: it.variantId,
                        quantity: it.quantity
                    })),
                    contacto:{
                        fullName: form.fullName.trim(),
                        email: form.email.trim(),
                        phone: form.phone.replace(/\D/g, '')
                    },
                    direccion: getShippingAddress(),
                    envio:{
                        priceCents: shipping.selected.priceCents,
                        courier: shipping.selected.courier,
                        serviceType: shipping.selected.serviceType
                    },
                    pago:{
                        token: datosPago.token,
                        paymentMethodId: datosPago.paymentMethodId,
                        issuerId: datosPago.installments,
                        identification: datosPago.identification
                    }
                }
            });

            if(error || data?.error){
                setErrorPago(data?.error || 'No se pudo procesar el pago. Intenta de nuevo.');
                setProcesando(false);
                return;
            }

            const status = data.status;
            setResultado({
                status,
                statusDetail: data.statusDetail,
                orderId: data.orderId
            });

            if(status === 'approved'){
                clear();
            }
            setPaso('resultado');
        } catch(error){
            console.error("Error al procesar el pago: ", error);
            setErrorPago('Ocurrió un error al procesar tu pago. Intenta de nuevo.');
        } finally{
            setProcesando(false);
        }
    }

    function reintentarPago(){
        setResultado(null);
        setPaso('pago');
    }

    return(
        <Box maxW="1100px" mx="auto" px={{base:5, md:8}} py={{base:6, md:10}}>
            {paso !== 'resultado' && (
                <ChakraLink as={RouterLink} to="/carrito" _hover={{textDecoration:'none'}}>
                    <HStack gap={1.5} color="brand.purpleSoft" mb={6} _hover={{color:'brand.purple'}}>
                        <Box as={FiArrowLeft} boxSize="16px"/>
                        <Text fontSize="sm" fontWeight="600">Volver al carrito</Text>
                    </HStack>
                </ChakraLink>
            )}

            {paso === 'resultado' && resultado &&(
                <ResultadoPago
                    resultado={resultado}
                    onReintentar={reintentarPago}
                    onSeguirComprando={() => navigate('/catalogo')}
                    onInicio={() => navigate('/')}
                />
            )}

            {paso !== 'resultado' &&(
                <>
                    <Stack gap={1} mb={6}>
                        <Heading
                            as="h1"
                            fontFamily="heading"
                            fontSize={{base:'2xl', md:'3xl'}}
                            fontWeight="600"
                            color="brand.purple"
                        >
                            {paso === 'datos' ? 'Finalizar compra' : 'Datos de pago'}
                        </Heading>
                        <Text fontSize="sm" color="brand.purpleSoft">
                            {paso === 'datos' ? 'Completa tus datos para enviar tu pedido 🐾' : 'Ingresa los datos de tu tarjeta de forma segura 🔒'}
                        </Text>
                    </Stack>

                    <Grid templateColumns={{base:'1fr', md:'1fr 320px'}} gap={{base:8, md:10}}>
                        <Stack gap={6}>
                            {paso === 'datos' ? (
                                <DatosEnvio
                                    form={form}
                                    errors={errors}
                                    updateField={updateField}
                                />
                            ) : (
                                <>
                                    <ResumenEnvio
                                        form={form}
                                        onEditar={() => setPaso('datos')}
                                    />
                                    <Box bg="white" borderRadius="card" p={5} boxShadow="0 2px 12px rgba(107, 46, 171, 0.06)">
                                        <Heading fontFamily="heading" fontSize="lg" fontWeight="600" color="brand.purple" mb={4}>
                                            Tarjeta
                                        </Heading>
                                        <FormularioTarjeta
                                            amountCents={totalCents}
                                            payerEmail={form.email.trim()}
                                            onPay={handlePagar}
                                            processing={procesando}
                                            errorMessage={errorPago}
                                        />
                                    </Box>
                                </>
                            )}
                        </Stack>

                        <Box>
                            <Box bg="white" borderRadius="card" p={6} boxShadow="0 2px 12px rgba(107, 46, 171, 0.06)" position="sticky" top="90px">
                                <Heading fontFamily="heading" fontSize="lg" fontWeight="600" color="brand.purple" mb={4}>
                                    Tu pedido ({itemCount})
                                </Heading>

                                <Stack gap={0} mb={4}>
                                    {items.map((item) => (
                                        <Flex
                                            key={item.variantId}
                                            gap={3}
                                            py={3}
                                            borderBottom="1px solid"
                                            borderColor="brand.purpleLight"
                                            align="center"
                                        >
                                            <Box
                                                w="44px"
                                                h="44px"
                                                flexShrink={0}
                                                borderRadius="10px"
                                                overflow="hidden"
                                                bg="brand.mintLight"
                                                display="flex"
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                {item.image ? (
                                                    <Box as="img" src={item.image} alt={item.name} w="full" h="full" objectFit="cover"/>
                                                ) : (
                                                    <Text fontSize="20px">🐾</Text>
                                                )}
                                            </Box>
                                            <Stack gap={0} flex="1" minW={0}>
                                                <Text fontSize="sm" fontWeight="600" color="brand.purple" lineHeight="1.2">
                                                    {item.name}
                                                </Text>
                                                <Text fontSize="sm" fontWeight="700" color="brand.purple">
                                                    {formatPrice(item.priceCents * item.quantity)}
                                                </Text>
                                            </Stack>
                                        </Flex>
                                    ))}
                                </Stack>

                                <Stack gap={3}>
                                    <Flex justify="space-between">
                                        <Text fontSize="sm" color="brand.purpleSoft">Subtotal</Text>
                                        <Text fontSize="sm" fontWeight="600" color="brand.purple">
                                            {formatPrice(subtotalCents)}
                                        </Text>
                                    </Flex>

                                    {paso === 'datos' ? (
                                        <Box borderTop="1px solid" borderColor="brand.purpleLight" pt={3}>
                                            <Text fontSize="sm" fontWeight="700" color="brand.purple" mb={2}>
                                                Envío
                                            </Text>

                                            {!shipping.calculated && (
                                                <Button
                                                    size="sm"
                                                    w="full"
                                                    bg="brand.mint"
                                                    borderRadius="pill"
                                                    fontWeight="600"
                                                    fontSize="xs"
                                                    _hover={{bg:'#56B8A0'}}
                                                    onClick={handleCalculaEnvio}
                                                    loading={shipping.loading}
                                                    loadingText="Calculando..."
                                                    disabled={form.postalCode.replace(/\D/g,'').length !== 5}
                                                >
                                                    Calcular envío
                                                </Button>
                                            )}
                                            {!shipping.calculated && form.postalCode.replace(/\D/g,'').length !== 5 && (
                                                <Text fontSize="xs" color="brand.purpleSoft" mt={1}>
                                                    Escribe tu código postal arriba para calcular
                                                </Text>
                                            )}
                                            {shipping.error && (
                                                <Stack gap={2} mt={1}>
                                                    <Text fontSize="xs" color="brand.pinkDark">
                                                        {shipping.error}
                                                    </Text>
                                                    <Button
                                                        size="xs"
                                                        variant="outline"
                                                        borderColor="brand.purpleLight"
                                                        color="brand.purpleSoft"
                                                        fontWeight="600"
                                                        _hover={{borderColor:'brand.purple'}}
                                                        onClick={handleCalculaEnvio}
                                                        loading={shipping.loading}
                                                    >
                                                        Reintentar
                                                    </Button>
                                                </Stack>
                                            )}
                                            {shipping.calculated && !shipping.error && shipping.options.length === 0 && (
                                                <Text fontSize="xs" color="brand.purpleSoft">
                                                    No hay opciones de envío para tu zona. Verifica tu código postal.
                                                </Text>
                                            )}

                                            {shipping.options.length > 0 && (
                                                <Stack gap={2} mt={1}>
                                                    {shipping.options.map((op, i) => {
                                                        const isSelected = shipping.selected?.title === op.title;
                                                        return(
                                                            <Box
                                                                key={i}
                                                                as="button"
                                                                onClick={() => shipping.setSelected(op)}
                                                                textAlign="left"
                                                                p={2.5}
                                                                borderRadius="12px"
                                                                borderWidth="2px"
                                                                borderColor={isSelected ? 'brand.purple' : 'brand.purpleLight'}
                                                                bg={isSelected ? 'brand.purpleLight' : 'white'}
                                                                cursor="pointer"
                                                                _hover={{borderColor:'brand.purple'}}
                                                            >
                                                                <Flex justify="space-between" align="center" gap={2}>
                                                                    <Stack gap={0} minW={0}>
                                                                        <Text fontSize="xs" fontWeight="700" color="brand.purple" lineHeight="1.2">
                                                                            {op.courier}
                                                                        </Text>
                                                                        <Text fontSize="10px" color="brand.purpleSoft">
                                                                            {op.deliveryCommitment}
                                                                        </Text>
                                                                    </Stack>
                                                                    <Text fontSize="sm" fontWeight="700" color="brand.pink" flexShrink={0}>
                                                                        {formatPrice(op.priceCents)}
                                                                    </Text>
                                                                </Flex>
                                                            </Box>
                                                        )
                                                    })}
                                                </Stack>
                                            )}
                                        </Box>
                                    ) : (
                                        <Flex justify="space-between">
                                            <Text fontSize="sm" color="brand.purpleSoft">
                                                Envío ({shipping.selected?.courier})
                                            </Text>
                                            <Text fontSize="sm" fontWeight="600" color="brand.purple">
                                                {formatPrice(shippingCents)}
                                            </Text>
                                        </Flex>
                                    )}
                                    <Box borderTop="1px solid" borderColor="brand.purpleLight" pt={3}>
                                        <Flex justify="space-between" align="center">
                                            <Text fontSize="md" fontWeight="700" color="brand.purple">Total</Text>
                                            <Text fontSize="xl" fontWeight="700" color="brand.purple">
                                                {formatPrice(totalCents)}
                                            </Text>
                                        </Flex>
                                    </Box>

                                    {paso === 'datos' && (
                                        <>
                                            <Button
                                                bg="brand.purple"
                                                color="white"
                                                py={6}
                                                mt={2}
                                                fontFamily="heading"
                                                fontWeight="600"
                                                _hover={{bg:'brand.purpleDark'}}
                                                onClick={handleIrAPago}
                                                disabled={!shipping.selected}
                                            >
                                                Continuar al pago
                                            </Button>
                                            {errorPago && (
                                                <Text fontSize="xs" color="brand.pinkDark" textAlign="center" mt={1}>
                                                    {errorPago}
                                                </Text>
                                            )}
                                            {!shipping.selected && (
                                                <Text fontSize="xs" color="brand.purpleSoft" textAlign="center" mt={-1}>
                                                   Elige una opción de envío para continuar
                                                </Text>
                                            )}
                                        </>
                                    )}
                                </Stack>
                            </Box>
                        </Box>
                    </Grid>
                </>
            )}
        </Box>
    );
}

function DatosEnvio({form, errors, updateField}){
    return(
        <>
            <Box bg="white" borderRadius="card" p={5} boxShadow="0 2px 12px rgba(107, 46, 171, 0.06)">
                <Heading fontFamily="heading" fontSize="lg" fontWeight="600" color="brand.purple" mb={4}>
                    Datos de contacto
                </Heading>
                <Stack gap={4}>
                    <CheckoutField
                        label="Nombre completo" required
                        value={form.fullName} error={errors.fullName}
                        onChange={(v) => updateField('fullName', v)}
                        placeholder="Tu nombre"
                    />
                    <Grid templateColumns={{base:'1fr', sm:'1fr 1fr'}} gap={3}>
                        <CheckoutField
                            label="Correo electrónico" required type="email"
                            value={form.email} error={errors.email}
                            onChange={(v) => updateField('email', v)}
                            placeholder="tu@email.com"
                        />
                        <CheckoutField
                            label="Teléfono (10 dígitos)" required
                            value={form.phone} error={errors.phone}
                            onChange={(v) => updateField('phone', v)}
                            placeholder=""
                        />
                    </Grid>
                </Stack>
            </Box>

            <Box bg="white" borderRadius="card" p={5} boxShadow="0 2px 12px rgba(107,46,171, 0.06)">
                <Heading fontFamily="heading" fontSize="lg" fontWeight="600" color="brand.purple" mb={4}>
                    Dirección de envío
                </Heading>
                <Stack gap={4}>
                    <Grid templateColumns={{base:'1fr', sm:'2fr 1fr'}} gap={3}>
                        <CheckoutField
                            label="Calle" required
                            value={form.street} error={errors.street}
                            onChange={(v) => updateField('street', v)}
                            placeholder=''
                        />
                        <CheckoutField
                            label="Número exterior" required
                            value={form.number} error={errors.number}
                            onChange={(v) => updateField('number', v)}
                            placeholder=''
                        />
                    </Grid>
                    <Grid templateColumns={{base:'1fr', sm:'2fr 1fr'}} gap={3}>
                        <CheckoutField
                            label="Colonia" required
                            value={form.neighborhood} error={errors.neighborhood}
                            onChange={(v) => updateField('neighborhood', v)}
                            placeholder=''
                        />
                        <CheckoutField
                            label="Código postal" required
                            value={form.postalCode} error={errors.postalCode}
                            onChange={(v) => updateField('postalCode', v)}
                            placeholder=''
                        />
                    </Grid>
                    <Grid templateColumns={{base:'1fr', sm:'2fr 1fr'}} gap={3}>
                        <CheckoutField
                            label="Ciudad" required
                            value={form.city} error={errors.city}
                            onChange={(v) => updateField('city', v)}
                            placeholder=''
                        />
                        <Field.Root required invalid={!!errors.state}>
                            <Field.Label fontWeight="600" color="brand.purple" fontSize="sm">
                                Estado <Field.RequiredIndicator/>
                            </Field.Label>
                            <Box
                                as="select"
                                value={form.state}
                                onChange={(e) => updateField('state', e.target.value)}
                                bg="white"
                                borderWidth="1px"
                                borderColor={errors.state ? 'brand.pinkDark' : 'brand.purpleLight'}
                                borderRadius="md"
                                px={3}
                                py={2}
                                fontSize="sm"
                                color="brand.purple"
                                w="full"
                                _focus={{borderColor:'brand.purple', outline:'none'}}
                            >
                                <option value="">Elige un estado</option>
                                {ESTADOS_MX.map((edo) => (
                                    <option key={edo} value={edo}>{edo}</option>
                                ))}
                            </Box>
                            {errors.state && (
                                <Text fontSize="xs" color="brand.pinkDark" mt={1}>
                                    {errors.state}
                                </Text>
                            )}
                        </Field.Root>
                    </Grid>
                    <CheckoutField
                        label="Referencias (opcional)"
                        value={form.references}
                        onChange={(v) => updateField('references',v )}
                        placeholder=''
                    />
                </Stack>
            </Box>
        </>
    );
}

function ResumenEnvio({form, onEditar}){
    return(
        <Box bg="white" borderRadius="card" p={5} boxShadow="0 2px 12px rgba(107, 46, 171, 0.06)">
            <Flex justify="space-between" align="flex-start" mb={3}>
                <Heading fontFamily="heading" fontSize="lg" fontWeight="600" color="brand.purple">
                    Envío a
                </Heading>
                <Button
                    size="xs"
                    variant="ghost"
                    color="brand.purple"
                    fontWeight="600"
                    _hover={{bg:'brand.purpleLight'}}
                    onClick={onEditar}
                >
                    <Box as={FiEdit2} boxSize="13px" mr={1}/>
                    Editar
                </Button>
            </Flex>
            <Stack gap={0.5}>
                <Text fontSize="sm" fontWeight="600" color="brand.purple">
                    {form.fullName}
                </Text>
                <Text fontSize="sm" fontWeight="600" color="brand.purpleSoft">
                    {form.street} {form.number}, {form.neighborhood}
                </Text>
                <Text fontSize="sm" fontWeight="600" color="brand.purple">
                    {form.city}, {form.state}, CP {form.postalCode}
                </Text>
                <Text fontSize="sm" fontWeight="600" color="brand.purple">
                    {form.phone} · {form.email}
                </Text>
            </Stack>
        </Box>
    );
}

function ResultadoPago({resultado, onReintentar, onSeguirComprando, onInicio}){
    const esExito = resultado.status === 'approved';
    const esPendiente = resultado.status === 'in_process' || resultado.status === 'pending';

    let config;
    if(esExito){
        config = {
            icon: FiCheckCircle,
            color: 'brand.mint',
            titulo: '¡Gracias por tu compra!',
            mensaje: 'Tu pago se realizó con éxito. Te enviaremos los detalles de tu pedido por correo.'
        };
    } else if(esPendiente){
        config = {
            icon: FiClock,
            color: 'brand.yellow',
            titulo: 'Tu pago está en proceso',
            mensaje: 'Estamos confirmando tu pago. Te avisaremos por correo en cuanto se acredite.'
        }
    } else{
        config = {
            icon: FiXCircle,
            color: 'brand.pinkDark',
            titulo: 'El pago no se completó',
            mensaje: 'Tu tarjeta fue rechazada o hubo un problema. No se hizo ningún cargo. Puedes intentar con otra tarjeta.'
        };
    }

    const numeroPedido = resultado.orderId ? String(resultado.orderId).slice(0, 8).toUpperCase() : null;

    return(
        <Box maxW="500px" mx="auto" py={{base:8, md:12}}>
            <Stack align="center" gap={5} textAlign="center">
                <Box as={config.icon} boxSize="72px" color={config.color}/>
                
                <Heading fontFamily="heading" fontSize={{base:'2xl', md:'3xl'}} fontWeight="600" color="brand.purple">
                    {config.titulo}
                </Heading>

                <Text fontSize="md" color="brand.purpleSoft" lineHeight="1.6">
                    {config.mensaje}
                </Text>

                {(esExito || esPendiente) && numeroPedido && (
                    <Box bg="white" borderRadius="card" px={6} py={4} boxShadow="0 2px 12px rgba(107, 46, 171, 0.06)">
                        <Stack gap={0}>
                            <Text fontSize="xs" color="brand.purpleSoft" fontWeight="600" letterSpacing="0.5px">
                                NÚMERO DE PEDIDO
                            </Text>
                            <Text fontSize="xl" fontWeight="700" color="brand.purple" fontFamily="mono">
                                #{numeroPedido}
                            </Text>
                        </Stack>
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
                            onClick={onSeguirComprando}
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
                            _hover={{bg:'brand.purpleDark'}}
                            onClick={onReintentar}
                        >
                            <Box as={FiArrowLeft} boxSize="16px" mr={2}/>
                            Intentar de nuevo
                        </Button>
                    )}

                    <Text
                        as="button"
                        fontSize="sm"
                        color="brand.purpleSoft"
                        fontWeight="600"
                        _hover={{color:'brand.purple'}}
                        onClick={onInicio}
                    >
                        Ir al inicio
                    </Text>
                </Stack>
            </Stack>
        </Box>
    )
}


function CheckoutField({label, required, type='text', value, error, onChange, placeholder}){
    return(
        <Field.Root required={required} invalid={!!error}>
            <Field.Label fontWeight="600" color="brand.purple" fontSize="sm">
                {label} {required && <Field.RequiredIndicator/>}
            </Field.Label>
            <Input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                bg="white"
                borderColor={error ? 'brand.pinkDark' : 'brand.purpleLight'}
                _focus={{borderColor:'brand.purple'}}
            />
            {error && (
                <Text fontSize="xs" color="brand.pinkDark" mt={1}>
                    {error}
                </Text>
            )}
        </Field.Root>
    );
}

export default CheckoutPage;