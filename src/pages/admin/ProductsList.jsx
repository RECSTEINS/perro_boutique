import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Flex, Stack, HStack, Heading, Text, Input, Button, Table, Badge, Image, Spinner, Circle} from '@chakra-ui/react'
import { FiSearch, FiPlus, FiEdit2 } from 'react-icons/fi';
import { useAdminProducts } from '../../hooks/useAdminProducts';
import { formatPriceRange } from '../../utils/format';
import { supabase } from '../../lib/supabase';

const STATUS_FILTERS = [
    {key: 'todos', label: 'Todos'},
    {key: 'activos', label: 'Activos'},
    {key: 'inactivos', label: 'Inactivos'}
];

function totalStock(product){
    if(!product.product_variants) return 0;
    return product.product_variants.reduce((sum, v) => sum + (v.stock || 0), 0);
}

function ProductsList(){
    const {products, loading, error, refetch} = useAdminProducts();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const navigate = useNavigate();
    const [togglingId, setTogglingId] = useState(null);

    const filtered = useMemo(() => {
        return products.filter((p) => {
            const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase().trim());

            const matchesStatus = statusFilter === 'todos' || 
                (statusFilter === 'activos' && p.is_active) ||
                (statusFilter === 'inactivos' && !p.is_active);
            return matchesSearch && matchesStatus;
        });
    }, [products, search, statusFilter]);

    async function toggleActive(product){
        setTogglingId(product.id);

        const {error} = await supabase.from('products').update({is_active: !product.is_active}).eq('id', product.id);

        if(error){
            console.error('No se pudo cambiar el estado: ',error)
        }else{
            await refetch();
        }
        setTogglingId(null);
    }

    return(
        <Box px={{base: 5, md: 10}} py={{base: 6, md:8}} maxW="1100px">
            <Flex
                justify="space-between"
                align={{base: 'flex-start', md: 'center'}}
                direction={{base:'column', md: 'row'}}
                gap={4}
                mb={6}
            >
                <Stack gap={1}>
                    <Heading fontFamily="heading" fontSize="2xl" fontWeight="600" color="brand.purple">
                        Productos
                    </Heading>
                    <Text fontSize="sm" color="brand.purpleSoft">
                        Gestiona el catálogo de la tienda.
                    </Text>
                </Stack>

                <Button
                    bg="brand.purple"
                    color="white"
                    borderRadius="pill"
                    px={6}
                    fontFamily="heading"
                    fontWeight="600"
                    fontSize="sm"
                    _hover={{bg: 'brand.purpleDark'}}
                    onClick={() => navigate('/admin/productos/nuevo')}
                >
                    <Box as={FiPlus} boxSize="16px" mr={1}/>
                    Nuevo producto
                </Button>
            </Flex>

            <Flex
                gap={3}
                mb={5}
                direction={{base:'column', sm:'row'}}
                align={{base:'stretch', sm: 'center'}}
            >
                <Flex
                    align="center"
                    bg="white"
                    borderRadius="pill"
                    px={4}
                    flex="1"
                    borderWidth="1px"
                    borderColor="brand.purpleLight"
                    _focusWithin={{borderColor:'brand.purple'}}
                >
                    <Box as={FiSearch} boxSize="18px" color="brand.purpleSoft"/>
                    <Input
                        placeholder='Buscar por nombre...'
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        border="none"
                        _focus={{boxShadow: 'none'}}
                        fontSize="sm"
                    />
                </Flex>

                <HStack gap={2}>
                    {STATUS_FILTERS.map((f) => {
                        const active = statusFilter === f.key;
                        return(
                            <Button
                                key={f.key}
                                size="sm"
                                borderRadius="pill"
                                fontWeight="600"
                                fontSize="xs"
                                onClick={() => setStatusFilter(f.key)}
                                bg={active ? 'brand.purple' : 'white'}
                                color={active ? 'white' : 'brand.purpleSoft'}
                                borderWidth="1px"
                                borderColor={active ? 'brand.purple' : 'brand.purpleLight'}
                                _hover={{borderColor: 'brand.purple'}}
                            >
                                {f.label}
                            </Button>
                        );
                    })}
                </HStack>
            </Flex>

            {loading && (
                <Stack align="center" py={16}>
                    <Spinner color="brand.purple"/>
                    <Text fontSize="sm" color="brand.purpleSoft">Cargando productos...</Text>
                </Stack>
            )}

            {error && (
                <Text textAlign="center" color="brand.pinkDark" py={10}>
                    Ups, no pudimos cargar los productos. Recarga la página, por favor.
                </Text>
            )}

            {!loading && !error && (
                <>
                    {filtered.length === 0 ? (
                        <Stack align="center" py={16} gap={2}>
                            <Text fontSize="40px">🐾</Text>
                            <Text fontSize="sm" color="brand.purpleSoft">
                                {products.length === 0
                                    ? 'Todavía no hay productos. ¡Crea el primero!'
                                    : 'Ningún producto coincide con tu búsqueda.'}
                            </Text>
                        </Stack>
                    ) : (
                        <Box bg="white" borderRadius="card" overflow="hidden" boxShadow="0 2px 12px rgba(107, 46, 171, 0.06)">
                            <Table.Root size="md">
                                <Table.Header>
                                    <Table.Row bg="brand.purpleLight">
                                        <Table.ColumnHeader fontWeight="700" color="brand.purple">Producto</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="700" color="brand.purple">Precio</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="700" color="brand.purple">Stock</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="700" color="brand.purple">Estado</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="700" color="brand.purple" textAlign="end">Acciones</Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {filtered.map((product) => {
                                        const stock = totalStock(product);
                                        const hasImage = product.image_urls && product.image_urls.length > 0;
                                        return(
                                            <Table.Row key={product.id} _hover={{bg: 'brand.cream'}}>
                                                <Table.Cell>
                                                    <HStack gap={3}>
                                                        <Circle size="44px" bg="brand.mintLight" overflow="hidden" flexShrink={0}>
                                                            {hasImage ? (
                                                                <Image
                                                                    src={product.image_urls[0]}
                                                                    alt={product.name}
                                                                    w="full"
                                                                    h="full"
                                                                    objectFit="cover"
                                                                />
                                                            ) : (
                                                                <Text fontSize="20px">🐾</Text>
                                                            )}
                                                        </Circle>
                                                        <Stack gap={0}>
                                                            <HStack gap={2}>
                                                                <Text fontWeight="600" color="brand.purple" fontSize="sm">
                                                                    {product.name}
                                                                </Text>
                                                                {product.is_new && (
                                                                    <Badge
                                                                        bg="brand.pink"
                                                                        color="white"
                                                                        fontSize="9px"
                                                                        borderRadius="pill"
                                                                        px={2}
                                                                    >
                                                                        NUEVO
                                                                    </Badge>
                                                                )}
                                                            </HStack>
                                                            <Text fontSize="xs" color="brand.purpleSoft">
                                                                {product.product_variants?.length || 0} variante(s)
                                                            </Text>
                                                        </Stack>
                                                    </HStack>
                                                </Table.Cell>

                                                <Table.Cell>
                                                    <Text fontSize="sm" fontWeight="600" color="brand.purple">
                                                        {formatPriceRange(product.product_variants) || '—'}
                                                    </Text>
                                                </Table.Cell>

                                                <Table.Cell>
                                                    <Text
                                                        fontSize="sm"
                                                        fontWeight="600"
                                                        color={stock === 0 ? 'brand.pinkDark' : 'brand.purple'}
                                                    >
                                                        {stock}
                                                    </Text>
                                                </Table.Cell>

                                                <Table.Cell>
                                                    <Badge
                                                        as="button"
                                                        borderRadius="pill"
                                                        px={3}
                                                        py={1}
                                                        fontSize="11px"
                                                        fontWeight="700"
                                                        cursor="pointer"
                                                        bg={product.is_active ? 'brand.mintLight' : 'brand.pinkLight'}
                                                        color={product.is_active ? '#2C7A6B': 'brand.pinkDark'}
                                                        opacity={togglingId === product.id ? 0.5 : 1}
                                                        onClick={() => toggleActive(product)}
                                                        _disabled={togglingId === product.id}
                                                        title={product.is_active ? 'Clic para ocultar de la tienda' : 'Clic para mostrar en la tienda'}
                                                        _hover={{filter:'brightness(0.95)'}}
                                                    >
                                                        {togglingId === product.id ? '...' : (product.is_active ? 'Activo' : 'Inactivo')}
                                                    </Badge>
                                                </Table.Cell>

                                                <Table.Cell textAlign="end">
                                                    <Button
                                                        size="xs"
                                                        variant="ghost"
                                                        color="brand.purple"
                                                        _hover={{bg: 'brand.purpleLight'}}
                                                        onClick={() => navigate(`/admin/productos/${product.id}/editar`)}
                                                    >
                                                        <Box as={FiEdit2} boxSize="14px" mr={1}/>
                                                        Editar
                                                    </Button>
                                                </Table.Cell>
                                            </Table.Row>
                                        );
                                    })}
                                </Table.Body>
                            </Table.Root>
                        </Box>
                    )}
                    {filtered.length > 0 && (
                        <Text fontSize="xs" color="brand.purpleSoft" mt={3} textAlign="right">
                            {filtered.length} de {products.length} producto(s)
                        </Text>
                    )}
                </>
            )}
        </Box>
    );
}

export default ProductsList;