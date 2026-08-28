import { createClient } from "@supabase/supabase-js";

// Cliente do Supabase para uso no navegador (client components).
// Usa a chave publica (anon) — feita para ficar visivel no navegador.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
