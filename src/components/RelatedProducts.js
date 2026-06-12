import { useRef } from "react";
import { Box, Flex, Heading, Text, Circle } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useRelatedProducts } from "../hooks/useRelatedProducts";
import ProductCard from './ProductCard';

function RelatedProducts({currentId, categoryId}){
    const {products, loading} = useRelatedProducts(currentId, categoryId);

    const trackRef = useRef(null);

    function scroll(direction){
        if(!trackRef.current) return;
        const amount = 240*(direction === 'left' ? -1 : 1);
        trackRef.current.scrollBy({left: amount, behavior: 'smooth'});
    }

    if(products.length === 0) return null;

    return(
        <Box mt={12}>
            <Flex align="center" justify="space-between" mb={5}>
                <Heading fontFamily="heading" fontSize="xl" fontWeight="600" color="brand.purple">
                    También te puede gustar 🐾
                </Heading>
                <Flex gap={2}>
                    <Circle
                        as="button"
                        size="36px"
                        bg="white"
                        color="brand.purple"
                        borderWidth="1px"
                        borderColor="brand.purpleLight"
                        cursor="pointer"
                        _hover={{bg:'brand.purpleLight'}}
                        onClick={() => scroll('left')}
                        aria-label="Anterior"
                    >
                        <Box as={FiChevronLeft} boxSize="18px"/>
                    </Circle>
                    <Circle
                        as="button"
                        size="36px"
                        bg="white"
                        color="brand.purple"
                        borderWidth="1px"
                        borderColor="brand.purpleLight"
                        cursor="pointer"
                        _hover={{bg:'brand.purpleLight'}}
                        onClick={() =>scroll('right')}
                        aria-label="Siguiente"
                    >
                        <Box as={FiChevronRight} boxSize="18px"/>
                    </Circle>
                </Flex>
            </Flex>

            <Flex
                ref={trackRef}
                gap={4}
                overflowX="auto"
                pb={2}
                css={{
                    scrollSnapType:'x mandatory',
                    '&::-webkit-scrollbar' : {display:'none'},
                    scrollbarWidth:'none'
                }}
            >
                {products.map((product) => (
                    <Box
                        key={product.id}
                        flexShrink={0}
                        w={{base:'160px', sm:'200px'}}
                        css={{scrollSnapAlign:'start'}}
                    >
                        <ProductCard product={product}/>
                    </Box>
                ))}
            </Flex>
        </Box>
    );
}

export default RelatedProducts;