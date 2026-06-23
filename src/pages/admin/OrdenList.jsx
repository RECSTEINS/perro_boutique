import { useEffect, useState, useMemo } from 'react';
import { Box, Flex, Heading, Text, Stack, HStack, Spinner, Input, NativeSelect, Badge, Table } from "@chakra-ui/react";
import { supabase } from '../../lib/supabase';
import { formatPrice, formatDate } from '../../utils/format';

function parseAddress(raw){
    if(!raw) return null;
    if(typeof raw === 'object') return raw;
    try{
        return JSON.parse(raw);
    } catch{
        return null;
    }
}

const METODO_LABEL = {
    oxxo: 'OXXO',
    transferencia: 'Transferencia',
    contra_entrega: 'Contra entrega'
}

function metodoLabel(pm){
    if(!pm) return 'Tarjeta';
    return METODO_LABEL[pm] || pm;
}

const ESTADO_CONFIG = {
    pendiente_pago: {label: 'Pendiente de pago', palette: 'yellow'},
    pagado: {label: 'Pagado', palette: 'teal'},
    enviado: {label: 'Enviado', palette: 'purple'},
    entregado: {label: 'Entregado', palette: 'green'},
    cancelado: {label: 'Cancelado', palette: 'red'}
}

function EstadoBadge({status}){
    const cfg = ESTADO_CONFIG[status] || {label: status, palette: 'gray'};
    return(
        <Badge colorPallete={cfg.palette} variant="subtle" borderRadius="md" px={2.5} py={1}>
            {cfg.label}
        </Badge>
    )
}

function OrdersList(){
    return(
        <Box p={{base: 4, md: 8}}>
            <Heading fontFamily="heading" color="brand.purple" mb={2}>
                Pedidos
            </Heading>
            <Text color="gray.600">
                Aqui apareceran los pedidos.
            </Text>
        </Box>
    );
}

export default OrdersList;