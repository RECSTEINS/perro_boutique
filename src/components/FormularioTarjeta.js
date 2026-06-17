import { useEffect, useRef, useState } from "react";
import { Box, Flex, Stack, HStack, Text, Input, Button, Image, Spinner } from "@chakra-ui/react";
import { FiLock, FiCreditCard } from "react-icons/fi";
import { useMercadoPago } from "../hooks/useMercadoPago";
import { formatPrice } from "../utils/format";

function formatCardNumber(value){
    const digits = value.replace(/\D/g, "").slice(0, 16);
    const groups = digits.match(/.{1,4}/g);
    return groups ? groups.join(" ") : "";
}

function formatExpiry(value){
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if(digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function FormularioTarjeta({ amountCents, payerEmail, onPay, processing, errorMessage}){
    const {mp, ready, error: sdkError} = useMercadoPago();
    const [cardNumber, setCardNumber] = useState("");
    const [cardholderName, setCardholderName] = useState("");
    const [expiry, setExpiry] = useState("");
    const [securityCode, setSecurityCode] = useState("");
    const [idNumber, setIdNumber] = useState("");

    // Datos derivados del BIN (primeros dígitos de la tarjeta)
    const [paymentMethodId, setPaymentMethodId] = useState(null);
    const [issuerId, setIssuerId] = useState(null);
    const [thumbnail, setThumbnail] = useState(null)

    //Cuotas
    const [installmentOptions, setInstallmentOptions] = useState([]);
    const [installments, setInstallments] = useState(1);
    const [loadingInstallments, setLoadingInstallments] = useState(false);

    const [formError, setFormError] = useState(null);
    const [tokenizing, setTokenizing] = useState(false);

    const binTimeoutRef = useRef(null);
    const lastBinRef = useRef(null);
    const amountPesos = amountCents / 100;

    useEffect(() => {
        const digits = cardNumber.replace(/\D/g, "");
        if(digits.length < 6){
            setPaymentMethodId(null);
            setIssuerId(null);
            setThumbnail(null);
            setInstallmentOptions([]);
            setInstallments(1);
            lastBinRef.current = null;
            return;
        }

        const bin = digits.slice(0, 8);

        if(bin === lastBinRef.current) return;

        if(binTimeoutRef.current) clearTimeout(binTimeoutRef.current);

        binTimeoutRef.current = setTimeout(async () => {
            if(!mp) return;
            lastBinRef.current = bin;
            await lookupByBin(digits.slice(0, 6));
        }, 500);

        return() => {
            if(binTimeoutRef.current) clearTimeout(binTimeoutRef.current);
        };
    }, [cardNumber, mp]);

    async function lookupByBin(bin){
        try{
            setLoadingInstallments(true);

            const pmResult = await mp.getPaymentMethods({bin});
            const method = pmResult?.results && pmResult.results.length > 0 ? pmResult.results[0] : null;

            if(method){
                setPaymentMethodId(method.id);
                setThumbnail(method.thumbnail || method.secure_thumbnail || null);

                const issuer = method.issuer && method.issuer.id != null ? String(method.issuer.id) : null;
                setIssuerId(issuer);
            }

            const instResult = await mp.getInstallments({
                amount: String(amountPesos),
                bin,
                paymentType: "credict_card"
            });

            if(instResult && instResult.length > 0 && instResult[0].payer_costs){
                setInstallmentOptions(instResult[0].payer_costs);
                setInstallments(instResult[0].payer_costs[0].installments);
            } else{
                setInstallmentOptions([]);
                setInstallments(1);
            }
        } catch(err){
            console.error("Error al consultar BIN: ",err);
            setInstallmentOptions([]);
            setInstallments(1);
        } finally{
            setLoadingInstallments(false);
        }
    }

    function validate(){
        const digits = cardNumber.replace(/\D/g, "");
        if(digits.length < 15) return "Revisa el número de tarjeta.";
        if(!cardholderName.trim()) return "Escribe el nombre del titular como aparece en la tarjeta.";

        const exp = expiry.replace(/\D/g, "");
        if(exp.length !== 4) return "Revisa la fecha de vencimiento (MM/AA).";
        const month = parseInt(exp.slice(0, 2), 10);
        if(month < 1 || month > 12) return "El mes de vencimiento no es válido.";

        if(securityCode.replace(/\D/g, "").length < 3) return "Revisa el código de seguridad.";
        if(!paymentMethodId) return "No reconocimos la tarjeta. Verifica el número.";
        return null;
    }

    async function handleSubmit(){
        setFormError(null);
        const validationError = validate();
        if(validationError){
            setFormError(validationError);
            return;
        }

        if(!mp){
            setFormError("El sistema de pago aún se está cargando. Espera un momento.");
            return;
        }
        setTokenizing(true);

        try{
            const exp = expiry.replace(/\D/g, "");
            const expirationMonth = exp.slice(0, 2);
            const expirationYear = `20${exp.slice(2, 4)}`;

            // Tokeniza la tarjeta DENTRO del navegador.
            // Devuelve un token de un solo uso que caduca en minutos.
            const tokenData = {
                cardNumber: cardNumber.replace(/\D/g, ""),
                cardholderName: cardholderName.trim(),
                cardExpirationMonth: expirationMonth,
                cardExpirationYear: expirationYear,
                securityCode: securityCode.replace(/\D/g, "")
            };

            if(idNumber.trim()){
                tokenData.identificationType = "RFC";
                tokenData.identificationNumber = idNumber.trim();
            }

            const token = await mp.createCardToken(tokenData);

            if(!token || !token.id){
                setTokenizing(false);
                setFormError("No se pudo procesar la tarjeta. Revisa los datos e intenta de nuevo.");
                return;
            }

            await onPay({
                token: token.id,
                paymentMethodId,
                issuerId,
                installments,
                payerEmail,
                identificaction: idNumber.trim() ? {type: "RFC", number: idNumber.trim()} : null
            });
        } catch(err){
            console.error("Error al tokenizar la tarjeta:", err);
            const causa = Array.isArray(err) && err.length > 0 && err[0].description ? err[0].description : "No se pudo procesar la tarjeta. Revisa los datos e intenta de nuevo.";
            setFormError(causa);
        } finally{
            setTokenizing(false);
        }
    }

    if(sdkError){
        return(
            <Box bg="brand.pinkLight" borderRadius="card" p={4}>
                <Text fontSize="sm" color="brand.pinkDark" fontWeight="600">
                    {sdkError}
                </Text>
            </Box>
        );
    }

    if(!ready){
        return(
            <Stack align="center" py={8} gap={3}>
                <Spinner color="brand.purple"/>
                <Text fontSize="sm" color="brand.purpleSoft">
                    Cargando pago seguro...
                </Text>
            </Stack>
        );
    }

    const busy = tokenizing || processing;

    return(
        <Stack gap={4}>
            <HStack gap={2} color="brand.purpleSoft">
                <Box as={FiLock} boxSize="14px"/>
                <Text fontSize="xs" fontWeight="600">
                    Pago seguro · tus datos viajan cifrados
                </Text>
            </HStack>

            <Box>
                <Text fontSize="sm" fontWeight="600" mb={1} color="brand.purple">
                    Número de tarjeta
                </Text>
                <Flex
                    align="center"
                    bg="white"
                    borderWidth="1px"
                    borderColor="brand.purpleLight"
                    borderRadius="md"
                    px={3}
                    _focusWithin={{borderColor: "brand.purple"}}
                >
                    <Box as={FiCreditCard} boxSize="18px" color="brand.purpleSoft" flexShrink={0}/>
                    <Input
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        border="none"
                        _focus={{boxShadow: "none"}}
                        fontSize="sm"
                        inputMode="numeric"
                    />
                    {thumbnail && (
                        <Image src={thumbnail} alt="" h="20px" flexShrink={0}/>
                    )}
                </Flex>
            </Box>

            <Box>
                <Text fontSize="sm" fontWeight="600" mb={1} color="brand.purple">
                    Nombre del titular
                </Text>
                <Input
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    bg="white"
                    borderColor="brand.purpleLight"
                    _focus={{borderColor: "brand.purpleLight"}}
                    fontSize="sm"
               />
            </Box>

            <HStack gap={3}>
                <Box flex="1">
                    <Text fontSize="sm" fontWeight="600" mb={1} color="brand.purple">
                        Vencimiento
                    </Text>
                    <Input
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        bg="white"
                        borderColor="brand.purpleLight"
                        _focus={{borderColor: "brand.purple"}}
                        fontSize="sm"
                        inputMode="numeric"
                    />
                </Box>
                <Box flex="1">
                    <Text fontSize="sm" fontWeight="600" mb={1} color="brand.purple">
                        CVV
                    </Text>
                    <Input
                        value={securityCode}
                        onChange={(e) => setSecurityCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                        bg="white"
                        borderColor="brand.purpleLight"
                        _focus={{borderColor: "brand.purple"}}
                        fontSize="sm"
                        inputMode="numeric"
                    />
                </Box>
            </HStack>

            <Box>
                <Text fontSize="sm" fontWeight="600" mb={1} color="brand.purple">
                    RFC del titular (opcional)
                </Text>
                <Input
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value.toUpperCase())}
                    bg="white"
                    borderColor="brand.purpleLight"
                    _focus={{borderColor: "brand.purple"}}
                    fontSize="sm"
                />
            </Box>

            {loadingInstallments ? (
                <HStack gap={2} color="brand.purpleSoft">
                    <Spinner size="sm" />
                    <Text fontSize="xs">Buscando opciones de pago...</Text>
                </HStack>
            ) : (
                installmentOptions.length > 0 && (
                    <Box>
                        <Text fontSize="sm" fontWeight="600" mb={1} color="brand.purple">
                            Meses
                        </Text>
                        <Box
                            as="select"
                            value={installments}
                            onChange={(e) => setInstallments(Number(e.target.value))}
                            bg="white"
                            borderWidth="1px"
                            borderColor="brand.purpleLight"
                            borderRadius="md"
                            px={3}
                            py={2}
                            fontSize="sm"
                            color="brand.purple"
                            w="full"
                            _focus={{borderColor: "brand.purple", outline: "none"}}
                        >
                            {installmentOptions.map((opt) =>(
                                <option key={opt.installments} value={opt.installments}>
                                    {opt.recommended_message}
                                </option>
                            ))}
                        </Box>
                    </Box>
                )
            )}
            {(formError || errorMessage) && (
                <Text
                    fontSize="sm"
                    color="brand.pinkDark"
                    bg="brand.pinkLight"
                    p={3}
                    borderRadius="md"
                >
                    {formError || errorMessage}
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
                onClickCapture={handleSubmit}
                loading={busy}
                loadingText={tokenizing ? "Validando tarjeta..." : "Procesando pago..."}
             >
                <Box as={FiLock} boxSize="16px" mr={2}/>
                Pagar {formatPrice(amountCents)}
            </Button>
        </Stack>
    );
}

export default FormularioTarjeta;