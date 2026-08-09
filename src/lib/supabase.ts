import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase optionnel. Tant que VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
 * ne sont pas renseignées (voir .env.example), l'app reste 100% fonctionnelle
 * en mode local — c'est le choix de scaffolding retenu pour cette première
 * génération. Le reste du code doit toujours vérifier `isSupabaseConfigured`
 * avant d'appeler `supabase`.
 */

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;

if (!isSupabaseConfigured && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info(
    "[BoardScore AI] Supabase non configuré — mode local uniquement. " +
      "Renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY pour activer le cloud."
  );
}
