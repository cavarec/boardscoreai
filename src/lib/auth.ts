import { supabase, isSupabaseConfigured } from "@/lib/supabase";

/**
 * Authentification par lien de connexion envoyé par email : pas de mot de
 * passe à gérer. Le modèle d'email par défaut de Supabase (sans SMTP
 * personnalisé, non modifiable) ne contient qu'un lien cliquable — pas de
 * code à 6 chiffres affiché — donc l'app s'appuie sur le lien plutôt que sur
 * une saisie de code. `emailRedirectTo` ramène l'utilisateur sur l'app une
 * fois le lien cliqué ; supabase-js détecte alors la session automatiquement
 * (`detectSessionInUrl`, activé par défaut), sans code supplémentaire ici.
 */
export async function sendLoginLink(email: string): Promise<{ error?: string }> {
  if (!supabase) return { error: "Supabase non configuré." };
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/settings` },
  });
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
