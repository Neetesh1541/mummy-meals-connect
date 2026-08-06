
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "comfort";

type ThemeProviderContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(undefined);

const STORAGE_KEY = "mummy-meals-theme";
const isTheme = (v: unknown): v is Theme => v === "light" || v === "dark" || v === "comfort";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Read synchronously so the very first render already matches the stored
  // theme (the pre-paint script in index.html applies the same class).
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return isTheme(stored) ? stored : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark", "comfort");
    root.classList.add(theme);
    root.style.colorScheme = theme === "dark" ? "dark" : "light";
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }, [theme]);

  // Keep tabs/sessions in sync when the theme changes elsewhere.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && isTheme(e.newValue)) setTheme(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);


  return (
    <ThemeProviderContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
