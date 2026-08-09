import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getMeta, setMeta } from "@/lib/db";

export type ThemeChoice = "system" | "light" | "dark";
const META_KEY = "theme";

interface ThemeContextValue {
  theme: ThemeChoice;
  setTheme: (value: ThemeChoice) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Applique le thème au <html> pour toute l'app (pas seulement l'écran
 * Réglages) : sans ce Provider au sommet de l'arbre, la préférence
 * enregistrée ne s'appliquerait que pendant que l'écran Réglages est monté.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>("system");

  useEffect(() => {
    getMeta<ThemeChoice>(META_KEY, "system").then(setThemeState);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const setTheme = useCallback((value: ThemeChoice) => {
    setThemeState(value);
    void setMeta(META_KEY, value);
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme doit être utilisé sous <ThemeProvider>");
  return ctx;
}
