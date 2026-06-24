import { Box, Flex, HStack, Stack, Text, Circle, Image } from '@chakra-ui/react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { FiTag, FiFolder, FiUsers, FiBarChart2, FiLogOut, FiHome, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../lib/AuthContext';
import AppToaster  from '../utils/toaster';
import logo from '../assets/logo_sin_fondo.jpg'

const navItems = [
    { label: 'Pedidos', to: '/admin/pedidos', icon: FiShoppingBag},
    { label: 'Productos', to: '/admin/productos', icon: FiTag},
    { label: 'Categorías', to: '/admin/categorias', icon: FiFolder},
    { label: 'Usuarios', to: '/admin/usuarios', icon: FiUsers, soon: true},
    { label: 'Estadísticas', to:'/admin/estadisticas', icon: FiBarChart2, soon: true}
];

function SidebarItem({item}){
    const Icon = item.icon;

    if(item.soon){
        return(
            <HStack
                gap={3}
                px={4}
                py={2.5}
                borderRadius="14px"
                color="whiteAlpha.500"
                cursor="not-allowed"
                userSelect="none"
            >
                <Box as={Icon} boxSize="18px"/>
                <Text fontSize="sm" fontWeight="600">{item.label}</Text>
                <Text
                    fontSize="9px"
                    fontWeight="700"
                    bg="whiteAlpha.200"
                    px={2}
                    py={0.5}
                    borderRadius="pill"
                    ml="auto"
                    letterSpacing="0.5px"
                >
                    PRONTO
                </Text>
            </HStack>
        );
    }

    return(
        <NavLink to={item.to}>
            {({isActive}) =>(
                <HStack
                    gap={3}
                    px={4}
                    py={2.5}
                    borderRadius="14px"
                    bg={isActive ? 'brand.purple' : 'transparent'}
                    color={isActive ? 'white' : 'whiteAlpha.800'}
                    fontWeight="600"
                    transition="all 0.15s ease"
                    _hover={{ bg:'whiteAlpha.200', color: 'white'}}
                >
                    <Box as={Icon} boxSize="18px" color={isActive ? 'brand.mint' : 'inherit'}/>
                    <Text fontSize="sm">{item.label}</Text>
                </HStack>
            )}
        </NavLink>
    );
}

function DashboardLayout(){
    const {profile, signOut} = useAuth();
    const navigate = useNavigate();
    const firstName = profile?.full_name?.split(' ')[0] || 'Admin';
    const roleLabel = profile?.role === 'admin' ? 'Administrador' : 'Gerente';

    async function handleLogOut(){
        await signOut();
        navigate('/');
    }

    return(
        <Flex minH="100vh" bg="brand.cream">
            {/* Sidebar */}
            <Flex
                as="aside"
                direction="column"
                w={{base: '70px', md:'250px'}}
                bg="brand.purple"
                color="white"
                position="sticky"
                top="0"
                h="100vh"
                py={6}
                px={{base: 2, md: 4}}
                flexShrink={0}
            >
                <HStack gap={2.5} px={2} mb={8}>
                    <Circle size="40px" overflow="hidden" flexShrink={0} bg="brand.mint">
                        <Image src={logo} alt='La PerroBoutique' objectFit="cover" boxSize="40px"/>
                    </Circle>
                    <Stack gap={0} display={{base:'none', md:'flex'}}>
                        <Text fontFamily="heading" fontSize="md" fontWeight="600" lineHeight="1.1">
                            La PerroBoutique
                        </Text>
                        <Text fontSize="11px" color="brand.mint" fontWeight="600" letterSpacing="0.5px">
                            PANEL DE ADMIN
                        </Text>
                    </Stack>
                </HStack>

                <Stack gap={1} flex="1">
                    <Box display={{base:'none', md:'block'}}>
                        <Stack gap={1}>
                            {navItems.map((item) =>(
                                <SidebarItem key={item.label} item={item}/>
                            ))}
                        </Stack>
                    </Box>

                    <Stack gap={2} display={{base:'flex', md:'none'}} align="center">
                        {navItems.map((item) =>{
                            const Icon = item.icon;
                            const content = (
                                <Circle
                                    size="40px"
                                    color={item.soon ? 'whiteAlpha.400' : 'whiteAlpha.800'}
                                    _hover={item.soon ? {} : {bg:'whiteAlpha.200', color: 'white'}}
                                    cursor={item.soon ? 'not-allowed' : 'pointer'}
                                >
                                    <Box as={Icon} boxSize="18px" />
                                </Circle>
                            );
                            return item.soon ? (
                                <Box key={item.label}>{content}</Box>
                            ) : (
                                <NavLink key={item.label} to={item.to}>{content}</NavLink>
                            );
                        })}
                    </Stack>
                </Stack>

                <Stack gap={1} mt={4}>
                    <NavLink to="/">
                        <HStack
                            gap={3}
                            px={4}
                            py={2.5}
                            borderRadius="14px"
                            color="whiteAlpha.800"
                            fontWeight="600"
                            _hover={{bg: 'whiteAlpha.200', color:'white'}}
                            display={{base:'none', md:'flex'}}
                        >
                            <Box as={FiHome} boxSize="18px" />
                            <Text fontSize="sm">Ver tienda</Text>
                        </HStack>
                    </NavLink>

                    <HStack
                        gap={3}
                        px={4}
                        py={2.5}
                        borderRadius="14px"
                        color="whiteAlpha.800"
                        fontWeight="600"
                        cursor="pointer"
                        onClick={handleLogOut}
                        _hover={{bg: 'whiteAlpha.200', color:'white'}}
                        display={{base:'none', md:'flex'}}
                    >
                        <Box as={FiLogOut} boxSize="18px" />
                        <Text fontSize="sm">Cerrar sesión</Text>
                    </HStack>

                    <HStack
                        gap={2.5}
                        mt={3}
                        px={3}
                        py={3}
                        bg="whiteAlpha.100"
                        borderRadius="16px"
                        display={{base:'none',md:'flex'}}
                    >
                        <Circle size="36px" bg="brand.pink" color="white" fontWeight="700" fontSize="sm" flexShrink={0}>
                            {firstName[0]?.toUpperCase()}
                        </Circle>
                        <Stack gap={0} overflow="hidden">
                            <Text fontSize="sm" fontWeight="700" lineHeight="1.2" truncate>
                                {firstName}
                            </Text>
                            <Text fontSize="11px" color="brand.mint" fontWeight="600">
                                {roleLabel}
                            </Text>
                        </Stack>
                    </HStack>
                    <Circle
                        size="40px"
                        color="whiteAlpha.800"
                        cursor="pointer"
                        onClick={handleLogOut}
                        _hover={{bg:'whiteAlpha.200', color:'white'}}
                        display={{base:'flex', md:'none'}}
                        mx="auto"
                    >
                        <Box as={FiLogOut} boxSize="18px" />
                    </Circle>
                </Stack>
            </Flex>

            <Box as="main" flex="1" overflowX="auto">
                <Outlet/>
            </Box>
            <AppToaster/>
        </Flex>
    )
}

export default DashboardLayout;