import { useMemo, useState } from "react";
import { Box, Flex, Stack, HStack, Heading, Text, Input, Button, Table, Badge, Spinner, Circle, Field } from "@chakra-ui/react";
import { FiPlus, FiEdit2, FiX, FiFolder } from "react-icons/fi";
import { useAdminCategories } from "../../hooks/useAdminCategories";
import { supabase } from "../../lib/supabase";
import { slugify } from '../../utils/slugify';

function CategoriesList(){
    const {categories, loading, error, refetch } = useAdminCategories();
    const [editing, setEditing] = useState(null);
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [slugEdited, setSlugEdited] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState(null);
    const [togglingId, setTogglingId] = useState(null);

    const isEditing = Boolean(editing?.id);

    function openCreate(){
        setEditing({});
        setName('');
        setSlug('');
        setSlugEdited(false);
        setFormError(null);
    }

    function openEdit(category){
        setEditing(category);
        setName(category.name);
        setSlug(category.slug);
        setSlugEdited(true);
        setFormError(null);
    }

    function closeModal(){
        setEditing(null);
    }

    function handleNameChange(value){
        setName(value);
        if(!slugEdited) setSlug(slugify(value));
    }

    async function handleSave(){
        setFormError(null);
        if(!name.trim() || !slug.trim()){
            setFormError('Campo obligatorio.')
            return;
        }

        setSaving(true);
        let dbError;
        if(isEditing){
            const {error} = await supabase.from('categories')
                .update({name: name.trim()}).eq('id', editing.id);
            dbError = error;
        } else{
            const {error} = await supabase.from('categories').insert({name: name.trim(), slug: slug.trim()});
            dbError = error;
        }

        if(dbError){
            setFormError(dbError.code === '23505'
                ? 'Ya existe una categoría con ese slug. Cambia el nombre.' : dbError.message
            );
            setSaving(false);
            return;
        }

        setSaving(false);
        closeModal();
        await refetch();
    }

    async function toggleActive(category){
        setTogglingId(category.id);

        const {error} = await supabase.from('categories')
            .update({is_active: !category.is_active}).eq('id', category.id);
        
        if(error){
            console.error('No se pudo cambiar el estado: ', error);
        }else{
            await refetch();
        }
        setTogglingId(null);
    }

    const total = useMemo(() => categories.length, [categories]);

    return(
        <Box px={{base: 5, md: 10}} py={{base: 6, md: 8}} maxW="900px">
            <Flex
                justify="space-between"
                align={{base:'flex-start', md:'center'}}
                direction={{base:'column', md:'row'}}
                gap={4}
                mb={6}
            >
                <Stack gap={1}>
                    <Heading fontFamily="heading" fontSize="2xl" fontWeight="600" color="brand.purple">
                        Categorías
                    </Heading>
                    <Text fontSize="sm" color="brand.purpleSoft">
                        Organiza los productos de la tienda.
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
                    _hover={{bg:'brand.purpleDark'}}
                    onClick={openCreate}
                >
                    <Box as={FiPlus} boxSize="16px" mr={1}/>
                    Nueva categoría
                </Button>
            </Flex>

            {loading && (
                <Stack align="center" py={16}>
                    <Spinner color="brand.purple"/>
                    <Text fontSize="sm" color="brand.purpleSoft">Cargando categorías</Text>
                </Stack>
            )}
            {error && (
                <Text textAlign="center" color="brand.pinkDark" py={10}>
                    Ups, no pudimos cargar las categorías. Recarga la página, por favor.
                </Text>
            )}
            {!loading && !error && (
                <>
                    {categories.length === 0 ? (
                        <Stack align="center" py={16} gap={2}>
                            <Box as={FiFolder} boxSize="40px" color="brand.purpleLight"/>
                            <Text fontSize="sm" color="brand.purpleSoft">
                                Todavía no hay categorías. ¡Crea la primera!
                            </Text>
                        </Stack>
                    ) : (
                        <Box bg="white" borderRadius="card" overflow="hidden" boxShadow="0 2px 12px rgba(107, 46, 171, 0.06)">
                            <Table.Root size="md">
                                <Table.Header>
                                    <Table.Row bg="brand.purpleLight">
                                        <Table.ColumnHeader fontWeight="700" color="brand.purple">Categoría</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="700" color="brand.purple">Slug</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="700" color="brand.purple">Productos</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="700" color="brand.purple">Estado</Table.ColumnHeader>
                                        <Table.ColumnHeader fontWeight="700" color="brand.purple" textAlign="end">Acciones</Table.ColumnHeader>
                                    </Table.Row>
                                </Table.Header>

                                <Table.Body>
                                    {categories.map((cat) =>(
                                        <Table.Row key={cat.id} _hover={{bg:'brand.cream'}}>
                                            <Table.Cell fontWeight="600" color="brand.purple" fontSize="sm">
                                                {cat.name}
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Text fontSize="xs" fontFamily="mono" color="brand.purpleSoft">
                                                    {cat.slug}
                                                </Text>
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Text fontSize="sm" color="brand.purple">
                                                    {cat.productCount}
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
                                                    bg={cat.is_active ? 'brand.mintLight' : 'brand.pinkLight'}
                                                    color={cat.is_active ? '#2C7A6B':'brand.pinkDark'}
                                                    opacity={togglingId === cat.id ? 0.5 : 1}
                                                    onClick={() => toggleActive(cat)}
                                                    title={cat.is_active ? 'Clic para desactivar' : 'Clic para activar'}
                                                    _hover={{filter: 'brightness(0.95)'}}
                                                >
                                                    {togglingId === cat.id ? '...' : (cat.is_active ? 'Activa' : 'Inactiva')}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell textAlign="end">
                                                <Button
                                                    size="xs"
                                                    variant="ghost"
                                                    color="brand.purple"
                                                    _hover={{bg:'brand.purpleLight'}}
                                                    onClick={() => openEdit(cat)}
                                                >
                                                    <Box as={FiEdit2} boxSize="14px" mr={1}/>
                                                    Editar
                                                </Button>
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        </Box>
                    )}

                    {categories.length > 0 && (
                        <Text fontSize="xs" color="brand.purpleSoft" mt={3} textAlign="right">
                            {total} categoría(s)
                        </Text>
                    )}
                </>
            )}

            {editing !== null && (
                <Box>
                    <Box
                        position="fixed"
                        inset={0}
                        bg="blackAlpha.600"
                        zIndex={50}
                        onClick={closeModal}
                    />
                    <Box
                        position="fixed"
                        top="50%"
                        left="50%"
                        transform="translate(-50%, -50%)"
                        bg="white"
                        borderRadius="card"
                        p={6}
                        zIndex={51}
                        w="92vw"
                        maxW="420px"
                        boxShadow="0 12px 40px rgba(107, 46, 171, 0.25)"
                    >
                        <Flex align="center" justify="space-between" mb={5}>"
                            <Heading fontFamily="heading" fontSize="lg" fontWeight="600" color="brand.purple">
                                {isEditing ? 'Editar categoría' : 'Nueva categoría'}
                            </Heading>
                            <Circle
                                size="32px"
                                bg="brand.purpleLight"
                                color="brand.purple"
                                cursor="pointer"
                                _hover={{bg:'brand.pinkLight', color:'brand.pinkDark'}}
                                onClick={closeModal}
                            >
                                <Box as={FiX} boxSize="18px"/>
                            </Circle>
                        </Flex>

                        <Stack gap={4}>
                            <Field.Root required>
                                <Field.Label fontWeight="600" color="brand.purple" fontSize="sm">
                                    Nombre <Field.RequiredIndicator/>
                                </Field.Label>
                                <Input
                                    placeholder="Ropa, Accesorios, Camas..."
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    bg="white"
                                    borderColor="brand.purpleLight"
                                    _focus={{borderColor:'brand.purple'}}
                                    autoFocus
                                />
                            </Field.Root>

                            <Field.Root required>
                                <Field.Label fontWeight="600" color="brand.purple" fontSize="sm">
                                    Slug (URL) <Field.RequiredIndicator/>
                                </Field.Label>
                                <Input
                                    placeholder="url de la pagina"
                                    value={slug}
                                    onChange={(e) => {setSlug(e.target.value); setSlugEdited(true);}}
                                    bg={isEditing ? 'brand.purpleLight' : 'white'}
                                    borderColor="brand.purpleLight"
                                    _focus={{borderColor:'brand.purple'}}
                                    fontFamily="mono"
                                    fontSize="sm"
                                    disabled={isEditing}
                                    readOnly={isEditing}
                                />
                                <Field.HelperText color="brand.purpleSoft" fontSize="xs">
                                    {isEditing ? 'El slug no puede cambiar una vez creada la categoría.'
                                    : 'Se genera automáticamente desde el nombre'}
                                </Field.HelperText>
                            </Field.Root>

                            {formError && (
                                <Text fontSize="sm" color="brand.pinkDark" bg="brand.pinkLight" p={3} borderRadius="md">
                                    {formError}
                                </Text>
                            )}

                            <HStack gap={3} justify="flex-end" pt={2}>
                                <Button
                                    variant="outline"
                                    borderRadius="pill"
                                    borderColor="brand.purpleLight"
                                    color="brand.purpleSoft"
                                    fontWeight="600"
                                    _hover={{borderColor:'brand.purple'}}
                                    onClick={closeModal}
                                    disabled={saving}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    bg="brand.purple"
                                    color="white"
                                    borderRadius="pill"
                                    px={6}
                                    fontFamily="heading"
                                    fontWeight="600"
                                    _hover={{bg:'brand.purpleDark'}}
                                    onClick={handleSave}
                                    loading={saving}
                                    loadingText="Guardando..."
                                >
                                    {isEditing ? 'Guardar' : 'Crear'}
                                </Button>
                            </HStack>
                        </Stack>
                    </Box>
                </Box>
            )}
        </Box>
    );
}

export default CategoriesList;