import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import RequireAdmin from './components/RequireAdmin';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

function AdminPlaceholder(){
  return(
    <Box maxW="1200px" mx="auto" px={5} py={12}>
      <Stack gap={3}>
        <Heading fontFamily="heading" fontSize="3xl" color="brand.purple">
          Dashboard
        </Heading>
        <Text color="brand.purpleSoft">
          Bienvenido
        </Text>
      </Stack>
    </Box>
  )
}

function App() {
  return (
    <Flex direction="column" minH="100vh" bg="brand.cream">
      <Header />
      <Box as="main" flex="1">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path='/login' element={<LoginPage/>}/>
          <Route path='/registro' element={<RegisterPage/>}/>
          

          <Route
            path='/admin'
            element={
              <RequireAdmin>
                <AdminPlaceholder/>
              </RequireAdmin>
            }
          />
        </Routes>
      </Box>
      <Footer />
    </Flex>
  );
}

export default App;
