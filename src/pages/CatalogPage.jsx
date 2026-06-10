import { useState } from "react";
import { Box, Flex, Grid, Stack, HStack, Heading, Text, Input, Button, Spinner } from '@chakra-ui/react';
import { FiSearch } from "react-icons/fi";
import { useCatalog } from "../hooks/useCatalog";
import { useCategories } from "../hooks/useCategories";
import ProductCard from "../components/ProductCard";

const SORT_LABELS = [
    {key: 'recientes', label: 'Más recientes'},
    {key: 'precio_asc', label: 'Precio: menor a mayor'},
    {key: 'precio_desc', label: 'Precio: mayor a menor'},
    {key: 'nombre_az', label: 'Nombre: A - Z'},
    {key: 'nombre_za', label: 'Nombre: Z - A'}
];

function CatalogPage(){
    const {categories} = useCategories();

    const [selected, setSelected] = useState([]);
    const [sortKey, setSortKey] = useState('recientes');
    const [search, setSearch] = useState('');

    const {products, total, loading, loadingMore, error, hasMore, loadMore} = useCatalog(selected, sortKey, search);

    function toggleCategory(catId){
        setSelected((prev) => 
            prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
        );
    }

    function clearCategories(){
        setSelected([]);
    }

    return(
        <Box maxW="1200px" mx="auto" px={{base:5, md:8}} py={{base:8, md:10}}>
            <Stack gap={1} mb={6}>
                <Text color="brand.pink" fontSize="xs" fontWeight="700" letterSpacing="1.5px">
                    ⋆ NUESTRA TIENDA ⋆
                </Text>
                <Heading fontFamily="heading" fontSize={{base:'3xl', md:'4xl'}} fontWeight="600" color="brand.purple">
                    Catálogo
                </Heading>
                <Text fontSize="sm" color="brand.purpleSoft">
                    Todo para consentir a tu peludito 🐾
                </Text>
            </Stack>

            <Flex gap={3} mb={4} direction={{base: 'column', sm:'row'}} align={{base:'stretch', sm:'center'}}>
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
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        border="none"
                        _focus={{boxShadow: 'none'}}
                        fontSize="sm"
                    />
                </Flex>

                <Box
                    as="select"
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    bg="white"
                    borderWidth="1px"
                    borderColor="brand.purpleLight"
                    borderRadius="pill"
                    px={4}
                    py={2}
                    fontSize="sm"
                    fontWeight="600"
                    color="brand.purple"
                    cursor="pointer"
                    _focus={{borderColor:'brand.purple', outline:'none'}}
                >
                    {SORT_LABELS.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                </Box>
            </Flex>
            <Flex gap={2} mb={8} wrap="wrap">
                <CategoryPill label="Todos" active={selected.length === 0} onClick={clearCategories}/>
                {categories.map((cat) => (
                    <CategoryPill
                        key={cat.id}
                        label={cat.name}
                        active={selected.includes(cat.id)}
                        onClick={() => toggleCategory(cat.id)}
                    />
                ))}
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
                    {products.length === 0 ? (
                        <Stack align="center" py={16} gap={2}>
                            <Text fontSize="40px">🐾</Text>
                            <Text fontSize="sm" color="brand.purpleSoft">
                                No encontramos productos con estos filtros.
                            </Text>
                        </Stack>
                    ) : (
                        <>
                            <Grid
                                templateColumns={{base:'1fr' , sm:'repeat(2, 1fr)', md:'repeat(3, 1fr)', lg:'repeat(4, 1fr)'}}
                                gap={5}
                            >
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product}/>
                                ))}
                            </Grid>

                            <Stack align="center" mt={10} gap={3}>
                                {hasMore ? (
                                    <Button
                                        onClick={loadMore}
                                        bg="white"
                                        borderWidth="1px"
                                        borderColor="brand.purpleLight"
                                        borderRadius="pill"
                                        px={8}
                                        py={6}
                                        fontFamily="heading"
                                        fontWeight="600"
                                        fontSize="sm"
                                        _hover={{bg:'brand.purpleLight'}}
                                        loading={loadingMore}
                                        loadingText="Cargando..."
                                    >
                                        Cargar más productos ({products.length} de {total})
                                    </Button>
                                ) : (
                                    <Text fontSize="xs" color="brand.purpleSoft">
                                        {total} producto(s) · eso es todo 🐾
                                    </Text>
                                )}
                            </Stack>
                        </>
                    )}
                </>
            )}
        </Box>
    );
}

function CategoryPill({label, active, onClick}){
    return(
        <Box
            as="button"
            onClick={onClick}
            bg={active ? 'brand.purple' : 'white'}
            color={active ? 'white' : 'brand.purpleSoft'}
            borderWidth="1px"
            borderColor={active ? 'brand.purple' : 'brand.purpleLight'}
            borderRadius="pill"
            px={4}
            py={1.5}
            fontSize="xs"
            fontWeight="600"
            cursor="pointer"
            transition="all 0.15s ease"
            _hover={{borderColor:'brand.purple'}}
        >
            {label}
        </Box>
    );
}

export default CatalogPage;