import { createClient } from '@supabase/supabase-js';

// Llamamos a las variables seguras que estarán en tu archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificamos que las variables existan para evitar que la página se caiga sin avisar
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Faltan las credenciales de Supabase. Revisa tu archivo .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);