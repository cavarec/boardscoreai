import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Authentification par code à usage unique envoyé par email (OTP) : pas de
 * mot de passe à gérer, pas de redirection de lien magique à faire
 * fonctionner correctement dans le contexte d'une PWA installée. Supabase
 * crée le compte automatiquement à la première validation de code — pas
 * besoin d'un flux d'inscription séparé.
 */

export async function requestLoginCode(email: string): Promise<{ error?: string }> {
  if (!supabase) return { error: "Supabase non configuré." };
  const { error } = await supabase.auth.signInWithOtp({ email });
  return error ? { error: error.message } : {};
}

export async function verifyLoginCode(
  email: string,
  code: string
): Promise<{ error?: string }> {
  if (!supabase) return { error: "Supabase non configuré." };
  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
  return error ? { error: error.message } : {};
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

/** Id de l'utilisateur connecté, ou undefined (mode local/invité). Utilisé
 * à la création d'une partie pour savoir si elle doit se synchroniser. */
export async function getCurrentUserId(): Promise<string | undefined> {
  if (!supabase || !isSupabaseConfigured) return undefined;
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id;
}
