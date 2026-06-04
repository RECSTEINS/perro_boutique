import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import RequireAdmin from './components/RequireAdmin';
import DashboardLayout from './components/DashboardLayout';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsList from './pages/admin/ProductsList';


function PublicLayout({ children}){
  return(
    <Flex direction="column" minH="100vh" bg="brand.cream">
      <Header/>
      <Box as="main" flex="1">
        {children}
      </Box>
      <Footer/>
    </Flex>
  );
}

function App() {
  return (
    <Routes>
      <Route path='/' element={<PublicLayout><Home/></PublicLayout>}/>
      <Route path='/login' element={<PublicLayout><LoginPage/></PublicLayout>}/>
      <Route path='/registro' element={<PublicLayout><RegisterPage/></PublicLayout>}/>

      <Route
        path='/admin'
        element={
          <RequireAdmin>
            <DashboardLayout/>
          </RequireAdmin>
        }
      >"
        <Route index element={<Navigate to="productos" replace/>}/>
        <Route path='productos' element={<ProductsList/>}/>

      </Route>
      
      <Route path='*' element={<Navigate to="/"/>}/>
    </Routes>
  );
}

export default App;
