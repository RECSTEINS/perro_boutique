import { Spinner, Stack, Text } from '@chakra-ui/react';
import { Navigate, useLocation} from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

function RequireAdmin({ children }){
    const { user, isStaff, loading } = useAuth();
    const location = useLocation();

    if(loading){
        return(
            <Stack align="center" justify="center" minH="60vh" gap={3}>
                <Spinner color="brand.purple" size="lg"/>
                <Text fontSize="sm" color="brand.purpleSoft">Verificando acceso</Text>
            </Stack>
        )
    }

    if(!user){
        return <Navigate to="/" state={{deniedAccess: true}} replace/>
    }

    return children;
}

export default RequireAdmin;