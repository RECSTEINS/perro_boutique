import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Flex, Grid, Stack, HStack, Heading, Text, Input, Button, Field, Link as ChakraLink } from "@chakra-ui/react";
import { FiArrowLeft, FiShoppingBag } from "react-icons/fi";
import { useCart } from "../lib/CartContext";
import { useCheckoutForm, ESTADOS_MX } from "../hooks/useCheckoutForm";
import { useShipping } from "../hooks/useShipping";
import { formatPrice } from "../utils/format";
import { supabase } from "../lib/supabase";

function CheckoutPage(){
    const {items, itemCount, subtotalCents} = useCart();
    const {form, errors, updateField, validate, getShippingAddress} = useCheckoutForm();
    const navigate = useNavigate();
    const shipping = useShipping();
    const [procesandoPago, setProcesandoPago] = useState(false);
    const [errorPago, setErrorPago] = useState(null);

    if(items.length === 0){
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

    async function handleContinue(){
        const isValid = validate();
        if(!isValid) return;

        if(!shipping.selected){
            setErrorPago('Elige una opción de envío antes de continuar.');
            return;
        }

        setProcesandoPago(true);
        setErrorPago(null);

        try{
            const {data, error} = await supabase.functions.invoke('crear-preferencia',{
                body:{
                    items: items.map((it) => ({
                        variantId: it.variantId,
                        quantity: it.quantity
                    })),
                    contacto: {
                        fullName: form.fullName.trim(),
                        email: form.email.trim(),
                        phone: form.phone.replace(/\D/g, '')
                    },
                    direccion: getShippingAddress(),
                    envio:{
                        priceCents: shipping.selected.priceCents,
                        courier: shipping.selected.courier,
                        serviceType: shipping.selected.serviceType
                    }
                }
            });

            if(error || data?.error){
                setErrorPago(data?.error || 'No se pudo iniciar el pago. Intenta de nuevo.');
                setProcesandoPago(false);
                return;
            }

            if(data?.initPoint){
                window.location.href = data.initPoint;
            } else{
                setErrorPago('No se recibió el enlace de pago. Intenta de nuevo.');
                setProcesandoPago(false);
            }
        } catch(error){
            console.error("Error al iniciar el pago: ", error);
            setErrorPago('Ocurrió un error al procesar tu pedido. Intenta de nuevo.');
            setProcesandoPago(false);
        }
    }

    function handleCalculaEnvio(){
        const cp = form.postalCode.replace(/\D/g, '');
        if(cp.length !== 5){
            updateField('postalCode', form.postalCode);
            return;
        }
        shipping.calculate(cp, items);
    }

    const shippingCents = shipping.selected ? shipping.selected.priceCents : 0;
    const totalCents = subtotalCents + shippingCents;

    return(
        <Box maxW="1100px" mx="auto" px={{base:5, md:8}} py={{base:6, md:10}}>
            <ChakraLink as={RouterLink} to="/carrito" _hover={{textDecoration:'none'}}>
                <HStack gap={1.5} color="brand.purpleSoft" mb={6} _hover={{color:'brand.purple'}}>
                    <Box as={FiArrowLeft} boxSize="16px"/>
                    <Text fontSize="sm" fontWeight="600">Volver al carrito</Text>
                </HStack>
            </ChakraLink>

            <Stack gap={1} mb={6}>
                <Heading
                    as="h1"
                    fontFamily="heading"
                    fontSize={{base:'2xl', md:'3xl'}}
                    fontWeight="600"
                    color="brand.purple"
                >
                    Finalizar compra
                </Heading>
                <Text fontSize="sm" color="brand.purpleSoft">
                    Completa tus datos para enviar tu pedido 🐾
                </Text>
            </Stack>
            <Grid templateColumns={{base:'1fr', md:'1fr 320px'}} gap={{base:8, md:10}}>
                <Stack gap={6}>
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
                </Stack>

                <Box>
                    <Box
                        bg="white"
                        borderRadius="card"
                        p={6}
                        boxShadow="0 2px 12px rgba(107, 46, 171, 0.06)"
                        position="sticky"
                        top="90px"
                    >
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

                            <Box borderTop="1px solid" borderColor="brand.purpleLight" pt={3}>
                                <Flex justify="space-between" align="center">
                                    <Text fontSize="md" fontWeight="700" color="brand.purple">Total</Text>
                                    <Text fontSize="xl" fontWeight="700" color="brand.purple">
                                        {formatPrice(totalCents)}
                                    </Text>
                                </Flex>
                            </Box>

                            <Button
                                bg="brand.purple"
                                color="white"
                                borderRadius="pill"
                                py={6}
                                mt={2}
                                fontFamily="heading"
                                fontWeight="600"
                                _hover={{bg:'brand.purpleDark'}}
                                onClick={handleContinue}
                                disabled={!shipping.selected || procesandoPago}
                                loading={procesandoPago}
                                loadingText="Redirigiendo al pago"
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
                        </Stack>
                    </Box>
                </Box>
            </Grid>
        </Box>
    );
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