import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if(!supabaseUrl || !supabaseAnonkey){
    throw new Error(
        'Faltan las variables de entorno de Supabase. ' +
        'Revisa que tu archivo .env tenga REACT_APP_SUPABASE_URL y ' +
        'REACT_APP_SUPABASE_ANON_KEY, y reinicia el servidor (npm start).'
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);