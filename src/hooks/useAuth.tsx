import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { pullUserMatches } from "@/lib/sync";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ session: null, loading: true });

/**
 * Source unique de l'état de connexion, au sommet de l'arbre : sans ça,
 * chaque écran devrait refaire son propre appel à supabase.auth.getSession()
 * et ils se désynchroniseraient après une connexion/déconnexion (même piège
 * que le thème avant l'introduction de ThemeProvider).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Évite de re-tirer les parties à chaque événement (TOKEN_REFRESHED
  // déclenche aussi onAuthStateChange) : seulement quand l'utilisateur
  // connecté change réellement, pas à chaque rafraîchissement de token.
  const pulledForUserId = useRef<string | null>(null);

  function maybePullMatches(newSession: Session | null) {
    const userId = newSession?.user.id ?? null;
    if (userId && pulledForUserId.current !== userId) {
      pulledForUserId.current = userId;
      void pullUserMatches();
    }
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
      maybePullMatches(data.session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      maybePullMatches(newSession);
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
