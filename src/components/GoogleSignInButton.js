import { useNavigate } from "react-router-dom";
import { Box, Flex, Text, Spinner } from "@chakra-ui/react";
import { useGoogleOneTap } from "../hooks/useGoogleOneTap";

function GoogleSignInButton({ redirectTo = "/"}){
    const navigate = useNavigate();
    const { buttonRef, ready, error } = useGoogleOneTap({
        onSuccess: () => navigate(redirectTo, {replace: true}),
    });

    if(error){
        return(
            <Text fontSize="xs" color="brand.pinkDark" textAlign="center">
                {error}
            </Text>
        );
    }

    return(
        <Flex direction="column" align="center" gap={2}>
            {!ready && <Spinner size="sm" color="brand.purple"/>}
            <Box ref={buttonRef} minH="40px"/>
        </Flex>
    );
}

export default GoogleSignInButton;