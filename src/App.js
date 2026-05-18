import { Box, Flex } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';

function App() {
  return (
    <Flex direction="column" minH="100vh" bg="brand.cream">
      <Header />
      <Box as="main" flex="1">
        <Routes>
          <Route path="/" element={<Home/>} />
          {/* Aquí agregaremos más páginas después:
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/producto/:slug" element={<Producto />} />
              <Route path="/carrito" element={<Carrito />} />
          */}
        </Routes>
      </Box>
      <Footer />
    </Flex>
  );
}

export default App;
