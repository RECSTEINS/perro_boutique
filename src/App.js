import { Box, Flex } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import RequireAdmin from './components/RequireAdmin';
import DashboardLayout from './components/DashboardLayout';
import CartDrawer, { CartToaster } from './components/CartDrawer';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductPage from './pages/ProductPage';

import ProductsList from './pages/admin/ProductsList';
import ProductForm from './pages/admin/ProductForm';
import CategoriesList from './pages/admin/CategoriesList';
import OrdersList from './pages/admin/OrdenList';
import CatalogPage from './pages/CatalogPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentResultPage from './pages/PaymentResultPage';

function PublicLayout({children}){
  return(
    <Flex direction="column" minH="100vh" bg="brand.cream">
      <Header/>
      <Box as="main" flex="1">
        {children}
      </Box>
      <Footer/>
      <CartDrawer/>
      <CartToaster/>
    </Flex>
  );
}

function App() {
  return (
    <Routes>
      <Route path='/' element={<PublicLayout><Home/></PublicLayout>}/>
      <Route path='/login' element={<PublicLayout><LoginPage/></PublicLayout>}/>
      <Route path='/registro' element={<PublicLayout><RegisterPage/></PublicLayout>}/>
      <Route path='/producto/:slug' element={<PublicLayout><ProductPage/></PublicLayout>}/>
      <Route path='/catalogo' element={<PublicLayout><CatalogPage/></PublicLayout>}/>
      <Route path='/carrito' element={<PublicLayout><CartPage/></PublicLayout>}/>
      <Route path='/checkout' element={<PublicLayout><CheckoutPage/></PublicLayout>}/>
      <Route path='/pago/resultado' element={<PublicLayout><PaymentResultPage/></PublicLayout>}/>
      <Route
        path='/admin'
        element={
          <RequireAdmin>
            <DashboardLayout/>
          </RequireAdmin>
        }
      >
        <Route index element={<Navigate to="pedidos" replace/>}/>
        <Route path='pedidos' element={<OrdersList/>}/>
        <Route path='productos' element={<ProductsList/>}/>
        <Route path='productos/nuevo' element={<ProductForm/>}/>
        <Route path='productos/:id/editar' element={<ProductForm/>}/>
        <Route path='categorias' element={<CategoriesList/>}/>
      </Route>
      
      <Route path='*' element={<Navigate to="/"/>}/>
    </Routes>
  );
}

export default App;
