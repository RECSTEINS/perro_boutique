import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CloseButton, Flex, Text } from '@chakra-ui/react'
import Hero from '../components/Hero';
import Benefits from '../components/Benefits';
import ProductGrid from '../components/ProductGrid';

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDeniedToast, setShowDeniedToast] = useState(false);

  useEffect(() => {
    if(location.state?.deniedAccess){
      setShowDeniedToast(true);
      navigate(location.pathname,{ replace:true, state:{} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if(!showDeniedToast) return;
    const timer = setTimeout(() => setShowDeniedToast(false), 5000);
    return () => clearTimeout(timer);
  }, [showDeniedToast]);

  return (
    <>
      {showDeniedToast && (
        <Flex
          position="fixed"
          top="80px"
          left="50%"
          transform="translateX(-50%)"
          bg="brand.pinkLight"
          color="brand.pinkDark"
          px={5}
          py={3}
          borderRadius="pill"
          align="center"
          gap={3}
          zIndex={20}
          boxShadow="0 4px 16px rgba(190, 24, 93, 0.18)"
          maxW="90vw"
        >
          <Text fontSize="sm" fontWeight="600">
            Acceso restringido
          </Text>
          <CloseButton size="sm" onClick={() => setShowDeniedToast(false)}/>
        </Flex>
      )}
      <Hero />
      <Benefits />
      <ProductGrid />
    </>
  );
}

export default Home;
