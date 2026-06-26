import { useEffect, useState, useMemo } from 'react';
import { Box, Flex, Heading, Text, Stack, HStack, Spinner, Input, NativeSelect, Badge, Table, Image, Circle, Button } from "@chakra-ui/react";
import { FiX, FiCheck, FiTruck, FiDollarSign, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { formatPrice, formatDate } from '../../utils/format';

function parseAddress(raw){
    if(!raw) return null;
    if(typeof raw === 'object') return raw;
    try{
        return JSON.parse(raw);
    } catch{
        return null;
    }
}

const METODO_LABEL = {
    oxxo: 'OXXO',
    transferencia: 'Transferencia',
    contra_entrega: 'Contra entrega'
};

function metodoLabel(pm){
    if(!pm) return 'Tarjeta';
    return METODO_LABEL[pm] || pm;
}

const ESTADO_CONFIG = {
    pendiente_pago: {label: 'Pendiente de pago', palette: 'yellow'},
    pagado: {label: 'Pagado', palette: 'teal'},
    enviado: {label: 'Enviado', palette: 'purple'},
    entregado: {label: 'Entregado', palette: 'green'},
    cancelado: {label: 'Cancelado', palette: 'red'}
}

function EstadoBadge({status}){
    const cfg = ESTADO_CONFIG[status] || {label: status, palette: 'gray'};
    return(
        <Badge colorPalette={cfg.palette} variant="subtle" borderRadius="md" px={2.5} py={1}>
            {cfg.label}
        </Badge>
    )
}

function OrderDetailDrawer({ order, onClose, onMarcadoPagado, onGuiaGenerada }){
    const [items, setItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(true);
    const [itemsError, setItemsError] = useState(null);

    const [confirmando, setConfirmando] = useState(false);
    const [marcando, setMarcando] = useState(false);

    const [confirmandoGuia, setConfirmandoGuia] = useState(false);
    const [generandoGuia, setGenerandoGuia] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function cargarItems(){
            setLoadingItems(true);
            setItemsError(null);

            //JOIN
            const {data, error} = await supabase.from('order_items')
                .select(`
                    product_name,
                    size,
                    price_cents,
                    quantity,
                    product_variants: variant_id(
                        products: product_id(
                            image_urls
                        )
                    )
                `).eq('order_id', order.id);
            
            if(!mounted) return;

            if(error){
                setItemsError(error.message);
                setItems([]);
            } else{
                setItems(data || []);
            }
            setLoadingItems(false);
        }

        cargarItems();
        return() => {
            mounted = false;
        };
    }, [order.id]);

    useEffect(() => {
        setConfirmando(false);
        setConfirmandoGuia(false);
    }, [order.id]);

    const addr = parseAddress(order.shipping_address);
    const nombre = addr?.fullName || '—';
    const esPendiente = order.status === 'pendiente_pago';
    const puedeGenerarGuia = order.status === 'pagado' && order.payment_method !== 'contra_entrega' && !order.tracking_number;

    async function handleMarcarPagado(){
        setMarcando(true);
        const {data, error} = await supabase.functions.invoke(
            'marcar-orden-pagada',
            {body:{orderId: order.id}}
        );

        setMarcando(false);

        if(error){
            let mensaje = 'No se pudo marcar el pedido como pagado.';
            try{
                const ctx = await error.context?.json?.();
                if(ctx?.error) mensaje = ctx.error;
            } catch{

            }
            toast.error(mensaje);
            return;
        }

        if(!data?.ok){
            toast.error('La orden no se pudo marcar como pagada.');
            return;
        }

        toast.success('Pedido marcado como pagado. Stock descontado.');
        setConfirmando(false);
        onMarcadoPagado(order.id);
    }

    async function handleGenerarGuia(){
        setGenerandoGuia(true);
        const {data, error} = await supabase.functions.invoke(
            'crear-guia-envio',
            {body:{orderId: order.id}}
        );

        setGenerandoGuia(false);

        if(error){
            let mensaje = 'No se pudo generar la guía.';
            try{
                const ctx = await error.context?.json?.();
                if(ctx?.error) mensaje = ctx.error;
            } catch{
                console.error('Ocurrio un error D:')
            }
            toast.error(mensaje);
            return;
        }
        if(!data?.ok){
            toast.error('La guía no se pudo generar.');
            return;
        }

        toast.success(`Guía generada: Rastreo: ${data.trackingNumber}`);
        setConfirmandoGuia(false);
        onGuiaGenerada(order.id, data.trackingNumber);
    }

    return(
        <>
            <Box
                position="fixed"
                inset={0}
                bg="blackAlpha.600"
                zIndex={100}
                onClick={onClose}
            />

            <Flex
                direction="column"
                position="fixed"
                top={0}
                right={0}
                h="100vh"
                w={{base:'100vw', sm:'440px'}}
                bg="white"
                zIndex={101}
                boxShadow="-8px 0 40px rgba(107, 46, 171, 0.18)"
            >
                <Flex
                    align="center"
                    justify="space-between"
                    px={5}
                    py={4}
                    borderBottom="1px solid"
                    borderColor="brand.purpleLight"
                    flexShrink={0}
                >
                    <Stack gap={0}>
                        <Text fontFamily="mono" fontSize="xs" color="brand.purpleSoft">
                            #{order.id.slice(0, 8)}
                        </Text>+
                        <Heading
                            fontFamily="heading"
                            fontSize="lg"
                            fontWeight="600"
                            color="brand.purple"
                        >
                            Detalle del pedido
                        </Heading>
                    </Stack>
                    <Circle
                        size="32px"
                        bg="brand.purpleLight"
                        color="brand.purple"
                        cursor="pointer"
                        _hover={{bg: 'brand.pinkLight', color:'brand.pinkDark'}}
                        onClick={onClose}
                    >
                        <Box as={FiX} boxSize="18px"/>
                    </Circle>
                </Flex>

                <Box flex="1" overflow="auto" px={5} py={5}>
                    <Stack gap={6}>
                        <HStack justify="space-between">
                            <EstadoBadge status={order.status}/>
                            <Text fontSize="sm" color="brand.purpleSoft" fontWeight="600">
                                {metodoLabel(order.payment_method)}
                            </Text>
                        </HStack>

                        <Stack gap={1}>
                            <Text
                                fontSize="11px"
                                fontWeight="700"
                                color="brand.purpleSoft"
                                letterSpacing="0.5px"
                                textTransform="uppercase"
                            >
                                Contacto
                            </Text>
                            <Text fontSize="sm" fontWeight="600" color="brand.purple">
                                {nombre}
                            </Text>
                            <Text fontSize="xs" color="gray.600">
                                {order.email} · {order.phone}
                            </Text>
                        </Stack>
                        <Stack gap={1}>
                            <Text
                                fontSize="11px"
                                fontWeight="700"
                                color="brand.purpleSoft"
                                letterSpacing="0.5px"
                                textTransform="uppercase"
                            >
                                Envío
                            </Text>
                            {addr ? (
                                <Text fontSize="sm" color="gray.700" lineHeight="1.6">
                                    {addr.street} {addr.number}
                                    {addr.neighborhood ? `, ${addr.neighborhood}` : ''}
                                    <br/>
                                    {addr.city}, {addr.state}, {addr.postal_code}
                                </Text>
                            ) : (
                                <Text fontSize="sm" color="gray.500">
                                    Sin dirección
                                </Text>
                            )}
                            {(order.shipping_carrier || order.shipping_service) && (
                                <Text fontSize="xs" color="brand.purpleSoft">
                                    {order.shipping_carrier}
                                    {order.shipping_carrier && order.shipping_service ? ' · ' : ''}
                                    {order.shipping_service}
                                </Text>
                            )}
                        </Stack>

                        <Stack gap={2}>
                            <Text
                                fontSize="11px"
                                fontWeight="700"
                                color="brand.purpleSoft"
                                letterSpacing="0.5px"
                                textTransform="uppercase"
                            >
                                Productos
                            </Text>

                            {loadingItems ? (
                                <Flex justify="center" py={6}>
                                    <Spinner size="sm" color="brand.purple"/>
                                </Flex>
                            ) : itemsError ? (
                                <Box bg="red.50" color="red.700" p={3} borderRadius="md" fontSize="xs">
                                    Error al cargar productos: {itemsError}
                                </Box>
                            ) : (
                                <Stack gap={3}>
                                    {items.map((it, idx) => {
                                        const img = it.product_variants?.products?.image_urls?.[0] ?? null;
                                        const lineTotal = (it.price_cents || 0) * (it.quantity || 0);
                                        return(
                                            <Flex key={idx} gap={3} align="center">
                                                <Box
                                                    w="48px"
                                                    h="48px"
                                                    flexShrink={0}
                                                    borderRadius="12px"
                                                    overflow="hidden"
                                                    bg="brand.mintLight"
                                                    display="flex"
                                                    alignItems="center"
                                                    justifyContent="center"
                                                >
                                                    {img ? (
                                                        <Image
                                                            src={img}
                                                            alt={it.product_name}
                                                            w="full"
                                                            h="full"
                                                            objectFit="cover"
                                                        />
                                                    ) : (
                                                        <Text fontSize="20px">🐾</Text>
                                                    )}
                                                </Box>
                                                <Stack gap={0} flex="1" minW={0}>
                                                    <Text
                                                        fontSize="sm"
                                                        fontWeight="600"
                                                        color="brand.purple"
                                                        lineHeight="1.2"
                                                    >
                                                        {it.product_name}
                                                    </Text>
                                                    <Text fontSize="xs" color="brand.purpleSoft">
                                                        Talla {it.size} · x{it.quantity}
                                                    </Text>
                                                </Stack>
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="700"
                                                    color="brand.purple"
                                                    flexShrink={0}
                                                >
                                                    {formatPrice(lineTotal)}
                                                </Text>
                                            </Flex>
                                        );
                                    })}
                                </Stack>
                            )}
                        </Stack>

                        <Stack
                            gap={2}
                            pt={4}
                            borderTop="1px solid"
                            borderColor="brand.purpleLight"
                        >
                            <Flex justify="space-between">
                                <Text fontSize="sm" color="gray.600">
                                    Subtotal
                                </Text>
                                <Text fontSize="sm" color="gray.700">
                                    {formatPrice(order.subtotal_cents)}
                                </Text>
                            </Flex>
                            <Flex justify="space-between">
                                <Text fontSize="sm" color="gray.600">
                                    Envío
                                </Text>
                                <Text fontSize="sm" color="gray.700">
                                    {formatPrice(order.shipping_cents)}
                                </Text>
                            </Flex>
                            <Flex justify="space-between" pt={1}>
                                <Text fontSize="md" fontWeight="700" color="brand.purple">
                                    Total
                                </Text>
                                <Text fontSize="md" fontWeight="700" color="brand.purple">
                                    {formatPrice(order.total_cents)}
                                </Text>
                            </Flex>
                        </Stack>
                    </Stack>
                </Box>

                {esPendiente && (
                    <Box
                        px={5}
                        py={4}
                        borderTop="1px solid"
                        borderColor="brand.purpleLight"
                        flexShrink={0}
                    >
                        {!confirmando ? (
                            <Button
                                w="full"
                                bg="brand.purple"
                                color="white"
                                borderRadius="pill"
                                fontFamily="heading"
                                fontWeight="600"
                                _hover={{bg: 'brand.purpleDark'}}
                                onClick={() => setConfirmando(true)}
                            >
                                <Box as={FiCheck} boxSize="18px" mr={2}/>
                                Marcar como pagado
                            </Button>
                        ) : (
                            <Stack gap={3}>
                                <Text fontSize="sm" color="gray.700" textAlign="center">
                                    ¿Confirmas que recibiste el pago de este pedido?
                                    Se descontará el stock
                                </Text>
                                <HStack gap={2}>
                                    <Button
                                        flex="1"
                                        variant="outline"
                                        borderColor="brand.purpleLight"
                                        color="brand.purpleSoft"
                                        borderRadius="pill"
                                        fontWeight="600"
                                        _hover={{bg: 'brand.purpleLight'}}
                                        onClick={() => setConfirmando(false)}
                                        disabled={marcando}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        flex="1"
                                        bg="brand.purple"
                                        color="white"
                                        borderRadius="pill"
                                        fontWeight="600"
                                        _hover={{bg: 'brand.purpleDark'}}
                                        onClick={handleMarcarPagado}
                                        loading={marcando}
                                        loadingText="Marcando..."
                                    >
                                        Sí, confirmar
                                    </Button>
                                </HStack>
                            </Stack>
                        )}
                    </Box>
                )}

                {puedeGenerarGuia && (
                    <Box
                        px={5}
                        py={4}
                        borderTop="1px solid"
                        borderColor="brand.purpleLight"
                        flexShrink={0}
                    >
                        {!confirmandoGuia ? (
                            <Button
                                w="full"
                                bg="brand.purple"
                                color="white"
                                borderRadius="pill"
                                fontFamily="heading"
                                fontWeight="600"
                                _hover={{bg:'brand.purpleDark'}}
                                onClick={() => setConfirmandoGuia(true)}
                            >
                                <Box as={FiTruck} boxSize="18px" mr={2}/>
                                Generar guía
                            </Button>
                        ) : (
                            <Stack gap={3}>
                                <Text fontSize="sm" color="gray.700" textAlign="center">
                                    Se generará una guía real y se descontará saldo de 
                                    Envíosperros. ¿Continuar?
                                </Text>
                                <HStack gap={2}>
                                    <Button
                                        flex="1"
                                        variant="outline"
                                        borderColor="brand.purpleLight"
                                        color="brand.purpleSoft"
                                        borderRadius="pill"
                                        fontWeight="600"
                                        _hover={{bg:'brand.purpleLight'}}
                                        onClick={() => setConfirmandoGuia(false)}
                                        disabled={generandoGuia}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        flex="1"
                                        bg="brand.purple"
                                        color="white"
                                        borderRadius="pill"
                                        fontWeight="600"
                                        _hover={{bg:'brand.purpleDark'}}
                                        onClick={handleGenerarGuia}
                                        loading={generandoGuia}
                                        loadingText="Generando..."
                                    >
                                        Sí, generar
                                    </Button>
                                </HStack>
                            </Stack>
                        )}
                    </Box>
                )}

                {order.tracking_number && (
                    <Box
                        px={5}
                        py={4}
                        borderTop="1px solid"
                        borderColor="brand.purpleLight"
                        flexShrink={0}
                    >
                        <Stack gap={1}>
                            <Text
                                fontSize="11px"
                                fontWeight="700"
                                color="brand.purpleSoft"
                                letterSpacing="0.5px"
                                textTransform="uppercase"
                            >
                                Número de rastreo
                            </Text>
                            <Text fontSize="sm" fontFamily="mono" color="brand.purple" fontWeight="600" wordBreak="break-all">
                                {order.tracking_number}
                            </Text>
                        </Stack>
                    </Box>
                )}
            </Flex>
        </>
    );
}

function OrdersList(){
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [pedidoSel, setPedidoSel] = useState(null);

    const [filtroEstado, setFiltroEstado] = useState('');
    const [filtroMetodo, setFiltroMetodo] = useState('');
    const [busqueda, setBusqueda] = useState('');

    const [saldo, setSaldo] = useState(null);
    const [cargandoSaldo, setCargandoSaldo] = useState(false);
    const [errorSaldo, setErrorSaldo] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function cargarPedidos(){
            setLoading(true);
            setError(null);

            const {data, error} = await supabase.from('orders')
                .select(
                    'id, email, phone, status, payment_method, subtotal_cents, shipping_cents, total_cents, shipping_address, shipping_carrier, shipping_service, tracking_number, created_at'
                ).order('created_at', {ascending: false});

            if(!mounted) return;

            if(error){
                setError(error.message);
                setOrders([]);
            } else{
                setOrders(data || []);
            }
            setLoading(false);
        }

        cargarPedidos();
        return() => {
            mounted = false;
        };
    }, []);

    function handleMarcadoPagado(orderId){
        setOrders((prev) =>
            prev.map((o) =>
                o.id === orderId ? {...o, status: 'pagado'} : o
            )
        );
        setPedidoSel((prev) =>
            prev && prev.id === orderId ? {...prev, status: 'pagado'} : prev
        );
    }

    function handleGuiaGenerada(orderId, trackingNumber){
        setOrders((prev) =>
            prev.map((o) =>
                o.id === orderId ? {...o, status: 'enviado', tracking_number: trackingNumber} : o
            )
        );
        setPedidoSel((prev) =>
            prev && prev.id === orderId ? {...prev, status: 'enviado', tracking_number: trackingNumber} : prev
        );
    }

    async function consultarSaldo(){
        setCargandoSaldo(true);
        setErrorSaldo(false);

        const {data, error} = await supabase.functions.invoke('consultar-saldo');

        setCargandoSaldo(false);

        if(error || !data || typeof data.balance !== 'number'){
            setErrorSaldo(true);
            setSaldo(null);
            return;
        }
        setSaldo(data.balance);
    }
    
    useEffect(() => {
        consultarSaldo();
    }, []);

    const pedidosFiltrados = useMemo(() => {
        const q = busqueda.trim().toLowerCase();
        return orders.filter((o) => {
            if(filtroEstado && o.status !== filtroEstado) return false;

            const metodo = o.payment_method || 'tarjeta';
            if(filtroMetodo && metodo !== filtroMetodo) return false;

            if(q){
                const addr = parseAddress(o.shipping_address);
                const nombre = (addr?.fullName || '').toLowerCase();
                const email = (o.email || '').toLowerCase();
                const id = (o.id || '').toLowerCase();
                if(
                    !nombre.includes(q) &&
                    !email.includes(q) &&
                    !id.includes(q)
                ){
                    return false;
                }
            }
            return true;
        });
    }, [orders, filtroEstado, filtroMetodo, busqueda]);

    return(
        <Box p={{base: 4, md: 8}}>
            <Flex justify="space-between" align="flex-start" mb={6} gap={4} flexWrap="wrap">
                <Stack gap={1}>
                <Heading fontFamily="heading" color="brand.purple">
                    Pedidos                    
                </Heading>
                <Text color="gray.600" fontSize="sm">
                    {loading
                        ? 'Cargando...'
                        : `${pedidosFiltrados.length} de ${orders.length} pedidos`
                    }
                </Text>
            </Stack>
            <Box
                bg={errorSaldo ? 'orange.50' : 'brand.cream'}
                border="1px solid"
                borderColor={errorSaldo ? 'orange.200' : 'brand.purpleLight'}
                borderRadius="16px"
                px={5}
                py={4}
                mb={6}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
            >
                <HStack gap={3}>
                    <Circle size="40px" bg="brand.purpleLight">
                        <Box as={FiDollarSign} boxSize="20px" color="brand.purple"/>
                    </Circle>
                    <Stack gap={0}>
                        <Text fontSize="11px" fontWeight="700" color="brand.purpleSoft" letterSpacing="0.5px" textTransform="uppercase">
                            Saldo Envíosperros
                        </Text>
                        {cargandoSaldo ? (
                            <Spinner size="sm" color="brand.purple"/>
                        ) : (
                            <Text fontSize="22px" fontWeight="600" color="brand.purple">
                                {formatPrice(Math.round((saldo || 0) * 100))}
                            </Text>
                        )}
                    </Stack>
                </HStack>
                <Button
                    size="sm"
                    variant="outline"
                    borderColor="brand.purpleLight"
                    color="brand.purple"
                    borderRadius="pill"
                    onClick={consultarSaldo}
                    loading={cargandoSaldo}
                >
                    <Box as={FiRefreshCw} boxSize="16px"/>
                </Button>
            </Box>
            </Flex>

            <HStack gap={3} mb={5} flexWrap="wrap" align={'flex-end'}>
                <NativeSelect.Root size="sm" maxW="200px">
                    <NativeSelect.Field 
                        value={filtroEstado} 
                        onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                        <option value="">Todos los estados</option>
                        <option value="pendiente_pago">Pendiente de pago</option>
                        <option value="pagado">Pagado</option>
                        <option value="enviado">Enviado</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator/>
                </NativeSelect.Root>

                <NativeSelect.Root size="sm" maxW="200px">
                    <NativeSelect.Field 
                        value={filtroMetodo} 
                        onChange={(e) => setFiltroMetodo(e.target.value)}
                    >
                        <option value="">Todos los métodos</option>
                        <option value="tarjeta">Tarjeta</option>
                        <option value="oxxo">OXXO</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="contra_entrega">Contra entrega</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator/>
                </NativeSelect.Root>

                <Input
                    size="sm"
                    maxW="260px"
                    placeholder='Buscar nombre, email o  # de pedido'
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
            </HStack>

            {loading ? (
                <Flex justify="center" py={16}>
                    <Spinner color="brand.purple"/>
                </Flex>
            ) : error ? (
                <Box bg="red.50" color="red.700" p={4} borderRadius="md" fontSize="sm">
                    Error al cargar pedidos: {error}
                </Box>
            ) : pedidosFiltrados.length === 0 ? (
                <Box
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="16px"
                    p={10}
                    textAlign="center"
                    color="gray.500"
                >
                    No hay pedidos que coincidan con los filtros.
                </Box>
            ) : (
                <Box
                    bg="white"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="16px"
                    overflow="hidden"
                >
                    <Table.Root size="sm" interactive>
                        <Table.Header bg="brand.cream">
                            <Table.Row>
                                <Table.ColumnHeader>Pedido</Table.ColumnHeader>
                                <Table.ColumnHeader>Cliente</Table.ColumnHeader>
                                <Table.ColumnHeader>Método</Table.ColumnHeader>
                                <Table.ColumnHeader>Estado</Table.ColumnHeader>
                                <Table.ColumnHeader>Total</Table.ColumnHeader>
                                <Table.ColumnHeader>Fecha</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {pedidosFiltrados.map((o) =>{
                                const addr = parseAddress(o.shipping_address);
                                const nombre = addr?.fullName || '—';
                                return(
                                    <Table.Row
                                        key={o.id}
                                        cursor="pointer"
                                        _hover={{bg: 'brand.cream'}}
                                        onClick={() => setPedidoSel(o)}
                                    >
                                        <Table.Cell
                                            fontFamily="mono"
                                            fontSize="xs"
                                            color="gray.500"
                                        >
                                            #{o.id.slice(0.6)}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Stack gap={0}>
                                                <Text fontWeight="600" fontSize="sm">
                                                    {nombre}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500">
                                                    {o.email}
                                                </Text>
                                            </Stack>
                                        </Table.Cell>
                                        <Table.Cell fontSize="sm">
                                            {metodoLabel(o.payment_method)}
                                        </Table.Cell>
                                        <Table.Cell>
                                            <EstadoBadge status={o.status} />
                                        </Table.Cell>
                                        <Table.Cell fontSize="end" fontWeight="600">
                                            {formatPrice(o.total_cents)}
                                        </Table.Cell>
                                        <Table.Cell fontSize="xs" color="gray.600">
                                            {formatDate(o.created_at)}
                                        </Table.Cell>
                                    </Table.Row>
                                );
                            })}
                        </Table.Body>
                    </Table.Root>
                </Box>
            )}

            {pedidoSel && (
                <OrderDetailDrawer
                    order={pedidoSel}
                    onClose={() => setPedidoSel(null)}
                    onMarcadoPagado={handleMarcadoPagado}
                    onGuiaGenerada={handleGuiaGenerada}
                />
            )}
        </Box>
    );
}

export default OrdersList;