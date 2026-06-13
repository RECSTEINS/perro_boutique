import { useState } from "react";
import { useAuth } from "../lib/AuthContext";

export const ESTADOS_MX = [
    'Aguascalientes','Baja California', 'Baja California Sur', 'Campeche','Chiapas',
    'Chihuahua','Ciudad de México','Coahuila', 'Colima', 'Durango', 'Estado de México',
    'Guanajuato','Guerrero','Hidalgo','Jalisco','Michoacán','Morelos','Nayarit','Nuevo León',
    'Oaxaca','Puebla','Querétaro','Quintana Roo','San Luis Potosí','Sinaloa','Sonora','Tabasco',
    'Tamaulipas','Tlaxcala','Veracruz','Yucatán','Zacatecas'
];

function initialForm(profile, userEmail){
    return{
        fullName: profile?.full_name || '',
        email: userEmail || '',
        phone: '',
        street: '',
        number: '',
        neighborhood: '',
        postalCode: '',
        city: '',
        state: '',
        references: ''
    };
}

export function useCheckoutForm(){
    const {user, profile} = useAuth();
    const [form, setForm] = useState(() => initialForm(profile, user?.email));
    const [errors, setErrors] = useState({});

    function updateField(field, value){
        setForm((prev) => ({...prev,[field]: value}));
        setErrors((prev) => {
            if(!prev[field]) return prev;
            const next = {...prev};
            delete next[field];
            return next;
        })
    }

    function validate(){
        const e = {};

        if(!form.fullName.trim()) e.fullName = 'Escribe tu nombre.';

        if(!form.email.trim()){
            e.email = 'Escribe tu correo.';
        } else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())){
            e.email = 'El correo no tiene un formato válido.'
        }

        const phoneDigits = form.phone.replace(/\D/g, '');
        if(!form.phone.trim()){
            e.phone = 'Escribe tu teléfono.';
        }else if(phoneDigits.length !== 10){
            e.phone = 'El teléfono debe tener 10 dígitos.';
        }

        if(!form.street.trim()) e.street = 'Escribe la calle.';
        if(!form.number.trim()) e.number = 'Escribe el número.';
        if(!form.neighborhood.trim()) e.neighborhood = 'Escribe la colonia.'

        const cpDigits = form.postalCode.replace(/\D/g, '');
        if(!form.postalCode.trim()){
            e.postalCode = 'Escribe el código postal.';
        } else if(cpDigits.length !== 5){
            e.postalCode = 'El código postal debe tener 5 dígitos.';
        }

        if(!form.city.trim()) e.city = 'Escribe la ciudad.';
        if(!form.state) e.state = 'Elige un estado.';

        setErrors(e);
        return Object.keys(e).length === 0;
    }

    function getShippingAddress(){
        return {
            street: form.street.trim(),
            number: form.number.trim(),
            neighborhood: form.neighborhood.trim(),
            postal_code: form.postalCode.replace(/\D/g, ''),
            city: form.city.trim(),
            state: form.state
        };
    }

    return{
        form,
        errors,
        updateField,
        validate,
        getShippingAddress
    };
}