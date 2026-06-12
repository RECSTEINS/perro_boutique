import { useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Button, Heading, Input, Stack, Text, Link as ChakraLink } from '@chakra-ui/react';
import { useAuth } from '../lib/AuthContext';

function LoginPage(){
    const navigate = useNavigate();
    const location = useLocation();
    const { signIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const redirectTo = location.state?.from?.pathname || '/';

    async function handleSubmit(e){
        e.preventDefault();
        setError(null);
        setLoading(true);

        const { error } = await signIn({ email, password });

        if(error){
            setError(error.message);
            setLoading(false);
        } else {
            navigate(redirectTo, { replace: true});
        }
    }

    return(
        <Box maxW="400px" mx="auto" px={5} py={{base: 10, md: 16}}>
            <Stack gap={6}>
                <Stack gap={2} align="center">
                    <Heading
                        as="h1"
                        fontFamily="heading"
                        fontSize="3xl"
                        fontWeight="600"
                        color="brand.purple"
                    >
                        Hola de nuevo 🐾
                    </Heading>
                    <Text fontSize="sm" color="brand.purpleSoft">
                        Inicia sesión para guardar tus favoritos y tu carrito.
                    </Text>
                </Stack>
                <form onSubmit={handleSubmit}>
                    <Stack gap={4}>
                        <Box>
                            <Text fontSize="sm" fontWeight="600" mb={1} color="brand.purple">
                                Correo electrónico
                            </Text>
                            <Input
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                bg="white"
                                borderColor="brand.purpleLight"
                                _focus={{ borderColor: 'brand.purple'}}
                            />
                        </Box>

                        <Box>
                            <Text fontSize="sm" fontWeight="600" mb={1} color="brand.purple">
                                Contraseña
                            </Text>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                bg="white"
                                borderColor="brand.purpleLight"
                                _focus={{ borderColor: 'brand.purple'}}
                            />
                        </Box>

                        {error && (
                            <Text fontSize="sm" color="brand.pinkDark" bg="brand.pinkLight" p={3} borderRadius="md">
                                {error}
                            </Text>
                        )}

                        <Button
                            type="submit"
                            bg="brand.purple"
                            color="white"
                            borderRadius="pill"
                            py={6}
                            fontFamily="heading"
                            fontWeight="600"
                            _hover={{ bg: 'brand.purpleDark' }}
                            loading={loading}
                            loadingText="Entrando..."
                        >
                                Iniciar sesión
                        </Button>
                    </Stack>
                </form>

                <Text fontSize="sm" textAlign="center" color="brand.purpleSoft">
                    ¿No tienes una cuenta?{' '}
                    <ChakraLink
                        as={RouterLink}
                        to="/registro"
                        color="brand.pink"
                        fontWeight="700"
                    >
                        Regístrate aquí
                    </ChakraLink>
                </Text>
            </Stack>
        </Box>
    )
}

export default LoginPage;