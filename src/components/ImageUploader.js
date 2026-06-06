import { useRef } from "react";
import { Box, Flex, Grid, Image, Text, Spinner, Circle, Stack, Input } from '@chakra-ui/react';
import { FiUploadCloud, FiX, FiStar } from "react-icons/fi";
import { useImageUpload } from "../hooks/useImageUpload";

function ImageUploader({value = [], onChange}){
    const { uploadMany, removeByUrl, uploading, error } = useImageUpload();
    const inputRef = useRef(null);

    async function handleFiles(e){
        const files = e.target.files;
        if(!files || files.length === 0) return;

        const newUrls = await uploadMany(files);
        if(newUrls.length > 0){
            onChange([...value, ...newUrls]);
        }

        if(inputRef.current) inputRef.current.value = '';
    }

    async function handleRemove(url){
        onChange(value.filter((u) => u !== url));
        await removeByUrl(url);
    }

    function makePrimary(url){
        onChange([url, ...value.filter((u) => u !== url)]);
    }

    return(
        <Stack gap={3}>
            <Flex
                direction="column"
                align="center"
                justify="center"
                gap={2}
                py={6}
                px={4}
                bg="brand.purpleLight"
                borderRadius="card"
                border="2px dashed"
                borderColor="#C4A0E8"
                cursor={uploading ? 'wait' : 'pointer'}
                transition="all 0.15s ease"
                _hover={uploading ? {} : {borderColor: 'brand.purple', bg:'#EEE0FB'}}
                onClick={() => !uploading && inputRef.current?.click()}
            >
                {uploading ? (
                    <>
                        <Spinner color="brand.purple"/>
                        <Text fontSize="sm" color="brand.purpleSoft" fontWeight="600">
                            Subiendo fotos...
                        </Text>
                    </>
                ):(
                    <>
                        <Box as={FiUploadCloud} boxSize="28px" color="brand.purple"/>
                        <Text fontSize="sm" color="brand.purple" fontWeight="600">
                            Haz clic para subir fotos
                        </Text>
                        <Text fontSize="xs" color="brand.purpleSoft">
                            Puedes elegir varias fotos a la vez · JPG, PNG, WEBP
                        </Text>
                    </>
                )}

                <Input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFiles}
                    style={{display: 'none'}}
                />
            </Flex>
            {error && (
                <Text fontSize="sm" color="brand.pinkDark" bg="brand.pinkLight" p={3} borderRadius="md">
                    {error}
                </Text>
            )}

            {value.length > 0 && (
                <>
                    <Text fontSize="xs" color="brand.purpleSoft" fontWeight="600">
                        {value.length} foto(s) · la primera es la principal
                    </Text>
                    <Grid templateColumns="repeat(auto-fill, minmax(100px, 1fr))" gap={3}>
                        {value.map((url, index) => {
                            const isPrimary = index === 0;
                            return(
                                <Box
                                    key={url}
                                    position="relative"
                                    overflow="hidden"
                                    aspectRatio={1}
                                    borderWidth="2px"
                                    borderRadius="14px"
                                    borderColor={isPrimary ? 'brand.pink' : 'transparent'}
                                >
                                    <Image src={url} alt={`Foto ${index + 1}`} w="full" h="full" objectFit="cover" />
                                    {isPrimary && (
                                        <Flex
                                            position="absolute"
                                            bottom={0}
                                            left={0}
                                            right={0}
                                            bg="brand.pink"
                                            color="white"
                                            align="center"
                                            justify="center"
                                            gap={1}
                                            py={1}
                                        >
                                            <Box as={FiStar} boxSize="11px"/>
                                            <Text fontSize="9px" fontWeight="700" letterSpacing="0.5px">
                                                PRINCIPAL
                                            </Text>
                                        </Flex>                                        
                                    )}

                                    {!isPrimary && (
                                        <Circle
                                            size="24px"
                                            bg="whiteAlpha.900"
                                            color="brand.purple"
                                            top="6px"
                                            left="6px"
                                            cursor="pointer"
                                            _hover={{bg:'brand.pink', color:'white'}}
                                            onClick={() => makePrimary(url)}
                                            title="Hacer foto principal"
                                        >
                                            <Box as={FiStar} boxSize="12px"/>
                                        </Circle>
                                    )}

                                    <Circle
                                        size="24px"
                                        bg="whiteAlpha.900"
                                        color="brand.pinkDark"
                                        position="absolute"
                                        top="6px"
                                        right="6px"
                                        cursor="pointer"
                                        _hover={{ bg: 'brand.pinkDark', color: 'white'}}
                                        onClick={() => handleRemove(url)}
                                        title="Quitar foto"
                                    >
                                        <Box as={FiX} boxSize="14px"/>
                                    </Circle>
                                </Box>
                            );
                        })}
                    </Grid>
                </>
            )}
        </Stack>
    );
}

export default ImageUploader;