import { Box, Flex, Stack, HStack, Text, Circle } from "@chakra-ui/react";
import { FiCreditCard, FiDollarSign, FiRepeat, FiMapPin, FiExternalLink, FiChevronRight } from "react-icons/fi";


const CPS_CANCUN = ["77500", "77510", "77520",  "77533", "77535", "77560"];

function metodoContraEntregaDisponible(cpDestino){
    if(!cpDestino) return false;
    const cp = String(cpDestino).replace(/\D/g, "");
    return CPS_CANCUN.includes(cp);
}

function MetodoPagoSelector({ onSelect, cpDestino }){
    const contraEntregaOk = metodoContraEntregaDisponible(cpDestino);

    const metodos = [
        
    ]
}