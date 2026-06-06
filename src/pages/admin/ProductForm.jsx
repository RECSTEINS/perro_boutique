import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Flex, Stack, HStack, Heading, Text, Input, Textarea, Button, Grid, IconButton, Switch, Spinner, Field } from "@chakra-ui/react";
import { FiArrowLeft, FiPlus, FiTrash2, FiSave } from "react-icons/fi";
import { supabase } from "../../lib/supabase";
import { useCategories } from "../../hooks/useCategories";
import { useAdminProducts } from "../../hooks/useAdminProducts";
import { slugify } from "../../utils/slugify";
import ImageUploader from "../../components/ImageUploader";

function emptyVariant(){
    return { size: '', price: '', discountPct: '', stock: ''};
}

function pesosToCents(value){
    if(value === '' || value == null) return null;
    const num = parseFloat(value);
    if(Number.isNaN(num)) return null;
    return Math.round(num * 100);
}

function compareAtFromDiscount(priceStr, pctStr){
    const price = parseFloat(priceStr);
    const pct = parseFloat(pctStr);

    if(Number.isNaN(price) || Number.isNaN(pct) || pct <= 0) return null;
    if(pct >= 100) return null;

    const originalPesos = price / (1 - pct / 100);
    return Math.round(originalPesos) * 100;
}

function compareAtLabel(priceStr, pctStr){
    const cents = compareAtFromDiscount(priceStr, pctStr);
    if(cents == null) return '—'
    return `$${(cents / 100).toLocaleString('es-MX')}`;
}

function ProductForm(){
    const navigate = useNavigate();
    const {categories, loading: loadingCategories} = useCategories();
    const { refetch } = useAdminProducts();

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [slugEdited, setSlugEdited] = useState(false);
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [isNew, setIsNew] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [imageUrls, setImageUrls] = useState([]);
    const [variants, setVariants] = useState([emptyVariant()]);

    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    function handleNameChange(value){
        setName(value);
        if(!slugEdited) setSlug(slugify(value));
    }

    function handleSlugChage(value){
        setSlug(value);
        setSlugEdited(true);
    }

    function addVariant(){
        setVariants((prev) => [...prev, emptyVariant()]);
    }

    function removeVariant(index){
        setVariants((prev) => prev.filter((_, i) => i !== index));
    }

    function updateVariant(index, field, value){
        setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value} : v)));
    }

    function validate(){
        if(!name.trim()) return 'El nombre es obligatorio.';
        if(!slug.trim()) return 'El slug es obligatorio.';
        if(!categoryId) return 'Debes elegir una categoría.';
        if(variants.length === 0) return 'Agrega al menos una variante.';

        for(const v of variants){
            if(!v.size.trim()) return 'Cada variane necesita una talla.';
            if(pesosToCents(v.price) == null) return 'Cada variante necesita un precio válido.';

            if(v.discountPct !== ''){
                const pct = parseFloat(v.discountPct);
                if(Number.isNaN(pct) || pct < 0 || pct >=100){
                    return 'El descuento debe ser un número entre 0 y 99.';
                }
            }
        }
        return null;
    }

    async function handleSubmit(){
        console.log('handleSubmit llamado', Date.now()); 
        setError(null);
        const validationError = validate();
        if(validationError){
            setError(validationError);
            return;
        }

        setSaving(true);

        const variantsPayload = variants.map((v) => ({
            size: v.size.trim(),
            price_cents: pesosToCents(v.price),
            compare_at_price_cents: compareAtFromDiscount(v.price, v.discountPct),
            stock: v.stock === '' ? 0 : parseInt(v.stock, 10)
        }))

        const { error: rpcError} = await supabase.rpc('create_product_with_variants', {
            p_name: name.trim(),
            p_slug: slug.trim(),
            p_description: description.trim() || null,
            p_category_id: categoryId,
            p_is_new: isNew,
            p_is_active: isActive,
            p_image_urls: imageUrls,
            p_variants: variantsPayload
        });
        
        if(rpcError){
            setError(
                rpcError.code === '23505' ? 'Ya existe un producto con ese slug. Cámbialo e intenta de nuevo.' : rpcError.message
            );
            setSaving(false);
            return;
        }

        await refetch();
        navigate('/admin/productos');
    }

    return(
        <Box px={{base: 5, md: 10}} py={{base: 6, md: 8}} maxW="800px">
            <HStack gap={3} mb={6}>
                <IconButton
                    aria-label="Volver"
                    variant="ghost"
                    color="brand.purple"
                    _hover={{bg: 'brand.purpleLight'}}
                    onClick={() => navigate('/admin/productos')}
                >
                    <Box as={FiArrowLeft} boxSize="20px"/>
                </IconButton>
                <Stack gap={0}>
                    <Heading fontFamily="heading" fontSize="2xl" fontWeight="600" color="brand.purple">
                        Nuevo producto
                    </Heading>
                    <Text fontSize="sm" color="brand.purpleSoft">
                        Completa los datos y agrega al menos una variante.
                    </Text>
                </Stack>
            </HStack>

            <Stack gap={6}>
                <Box bg="white" borderRadius="card" p={5} boxShadow="0 2px 12px rgba(107, 46, 171, 0.06)">
                    <Stack gap={4}>
                        <Field.Root required>
                            <Field.Label fontWeight="600" color="brand.purple" fontSize="sm">
                                Nombre <Field.RequiredIndicator/>
                            </Field.Label>
                            <Input
                                placeholder="Nombre de producto"
                                value={name}
                                onChange={(e) => handleNameChange(e.target.value)}
                                bg="white"
                                borderColor="brand.purpleLight"
                                _focus={{ borderColor: 'brand.purple'}}
                            />
                        </Field.Root>

                        <Field.Root required>
                            <Field.Label fontWeight="600" color="brand.purple" fontSize="sm">
                                Slug (URL) <Field.RequiredIndicator/>
                            </Field.Label>
                            <Input
                                placeholder="ejemplo-producto"
                                value={slug}
                                onChange={(e) => handleSlugChage(e.target.value)}
                                bg="white"
                                borderColor="brand.purpleLight"
                                _focus={{borderColor: 'brand.purple'}}
                                fontFamily="mono"
                                fontSize="sm"
                            />
                            <Field.HelperText color="brand.purpleSoft" fontSize="xs">
                                Se genera automaticamente. Edítalo unicamente si quieres otro.
                            </Field.HelperText>
                        </Field.Root>

                        <Field.Root required>
                            <Field.Label fontWeight="600" color="brand.purple" fontSize="sm">
                                Categoría <Field.RequiredIndicator/>
                            </Field.Label>
                            {loadingCategories ? (
                                <HStack gap={2} color="brand.purpleSoft">
                                    <Spinner size="sm"/>
                                    <Text fontSize="sm">Cargando categorías</Text>
                                </HStack>
                            ) : (
                                <Box
                                    as="select"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    bg="white"
                                    borderWidth="1px"
                                    borderColor="brand.purpleLight"
                                    borderRadius="md"
                                    px={3}
                                    py={2}
                                    fontSize="sm"
                                    color="brand.purple"
                                    w="full"
                                    _focus={{borderColor: 'brand.purple', outline: 'none'}}
                                >
                                    <option value="">Elige una categoría</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </Box>
                            )}
                        </Field.Root>

                        <Field.Root>
                            <Field.Label fontWeight="600" color="brand.purple" fontSize="sm">
                                Descripción
                            </Field.Label>
                            <Textarea
                                placeholder="Suéter tejido a mano, suavecito y abrigador..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                bg="white"
                                borderColor="brand.purpleLight"
                                _focus={{borderColor:'brand.purple'}}
                                rows={3}
                            />
                        </Field.Root>
                        
                        <HStack gap={6} pt={1}>
                            <Switch.Root checked={isNew} onCheckedChange={(e) => setIsNew(e.checked)}>
                                <Switch.HiddenInput/>
                                <Switch.Control bg={isNew ? 'brand.pink' : 'gray.300'}>
                                    <Switch.Thumb/>
                                </Switch.Control>
                                <Switch.Label fontSize="sm" fontWeight="600" color="brand.purple" ml={2}>
                                    Marcar como NUEVO
                                </Switch.Label>
                            </Switch.Root>

                            <Switch.Root checked={isActive} onCheckedChange={(e) => setIsActive(e.checked)}>
                                <Switch.HiddenInput/>
                                <Switch.Control bg={isActive ? 'brand.mint' : 'gray.300'}>
                                    <Switch.Thumb/>
                                </Switch.Control>
                                <Switch.Label fontSize="sm" fontWeight="600" color="brand.purple" ml={2}>
                                    Activo (visible en la tienda)
                                </Switch.Label>
                            </Switch.Root>
                        </HStack>
                    </Stack>
                </Box>

                <Box bg="white" borderRadius="card" p={5} boxShadow="0 2px 12px rgba(107, 46, 171, 0.06)">
                    <Text fontWeight="600" color="brand.purple" fontSize="sm" mb={3}>
                        Fotos del producto
                    </Text>
                    <ImageUploader value={imageUrls} onChange={setImageUrls}/>
                </Box>

                <Box bg="white" borderRadius="card" p={5} boxShadow="0 2px 12px rgba(107, 46, 171, 0.06)">
                    <Flex justify="space-between" align="center" mb={4}>
                        <Stack gap={0}>
                            <Text fontWeight="600" color="brand.purple" fontSize="sm">
                                Variantes (talla · precio · stock)
                            </Text>
                            <Text fontSize="xs" color="brand.purpleSoft">
                                El precio va en pesos. El descuento es opcional (en %).
                            </Text>
                        </Stack>
                        <Button
                            size="sm"
                            borderRadius="pill"
                            bg="brand.mint"
                            color="white"
                            fontWeight="600"
                            fontSize="xs"
                            _hover={{bg: '#56B8A0'}}
                            onClick={addVariant}
                        >
                            <Box as={FiPlus} boxSize="14px" mr={1}/>
                            Agregar talla
                        </Button>
                    </Flex>

                    <Stack gap={3}>
                        {variants.map((v, index) => (
                            <Grid
                                key={index}
                                templateColumns={{base:'1fr 1fr', sm:'1fr 1fr 1fr 1.2fr 1fr auto'}}
                                gap={2}
                                alignItems="center"
                            >
                                <Input
                                    placeholder="Talla (S, M...)"
                                    value={v.size}
                                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                    bg="white"
                                    borderColor="brand.purpleLight"
                                    _focus={{borderColor: 'brand.purple'}}
                                    size="sm"
                                />
                                <Input
                                    placeholder="Precio $"
                                    type="number"
                                    value={v.price}
                                    onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                    bg="white"
                                    borderColor="brand.purpleLight"
                                    _focus={{borderColor: 'brand.purple'}}
                                    size="sm"
                                />
                                <Input
                                    placeholder="0%"
                                    type="number"
                                    value={v.discountPct}
                                    onChange={(e) =>updateVariant(index, 'discountPct', e.target.value)}
                                    bg="white"
                                    borderColor="brand.purpleLight"
                                    _focus={{borderColor: 'brand.purple'}}
                                    size="sm"
                                />
                                <Flex
                                    align="center"
                                    px={3}
                                    h="32px"
                                    bg="brand.cream"
                                    borderRadius="md"
                                    borderWidth="1px"
                                    borderColor="brand.purpleLight"
                                >
                                    <Text
                                        fontSize="sm"
                                        fontWeight="600"
                                        color={compareAtFromDiscount(v.price, v.discountPct) ? 'brand.pink' : 'brand.purpleSoft'}
                                        textDecoration={compareAtFromDiscount(v.price, v.discountPct) ? 'line-through' : 'none'}
                                    >
                                        {compareAtLabel(v.price, v.discountPct)}
                                    </Text>
                                </Flex>
                                <Input
                                    placeholder="Stock"
                                    type="number"
                                    value={v.stock}
                                    onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                                    bg="white"
                                    borderColor="brand.purpleLight"
                                    _focus={{borderColor: 'brand.purple'}}
                                    size="sm"
                                />
                                <IconButton
                                    aria-label="Quitar variante"
                                    size="sm"
                                    variant="ghost"
                                    color="brand.pinkDark"
                                    _hover={{bg: 'brand.pinkLight'}}
                                    onClick={() => removeVariant(index)}
                                    disabled={variants.length === 1}
                                >
                                    <Box as={FiTrash2} boxSize="16px"/>
                                </IconButton>
                            </Grid>
                        ))}
                    </Stack>
                </Box>

                {error && (
                    <Text fontSize="sm" color="brand.pinkDark" bg="brand.pinkLight" p={3} borderRadius="md">
                        {error}
                    </Text>
                )}

                <HStack gap={3} justify="flex-end">
                    <Button
                        variant="outline"
                        borderRadius="pill"
                        borderColor="brand.purpleLight"
                        color="brand.purpleSoft"
                        fontWeight="600"
                        _hover={{borderColor: 'brand.purple'}}
                        onClick={() => navigate('/admin/productos')}
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
                        onClick={handleSubmit}
                        loading={saving}
                        loadingText="Guardando..."
                    >
                        <Box as={FiSave} boxSize="16px" mr={1}/>
                        Guardar producto
                    </Button>
                </HStack>
            </Stack>
        </Box>
    );
}

export default ProductForm;