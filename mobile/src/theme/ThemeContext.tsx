import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ColorSchemeName, useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";

import { AppTheme, darkTheme, lightTheme } from "./colors";

export type ThemeMode = "system" | "light" | "dark";

type ThemeContextValue = {
  theme: AppTheme;
  mode: ThemeMode;
  resolvedMode: "light" | "dark";
  setMode: (mode: ThemeMode) => Promise<void>;
  loading: boolean;
};

const THEME_MODE_KEY = "safeher_theme_mode";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function resolveMode(mode: ThemeMode, systemScheme: ColorSchemeName): "light" | "dark" {
  if (mode === "system") {
    return systemScheme === "dark" ? "dark" : "light";
  }
  return mode;
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPreference = async () => {
      const savedMode = await SecureStore.getItemAsync(THEME_MODE_KEY);
      if (isThemeMode(savedMode)) {
        setModeState(savedMode);
      }
      setLoading(false);
    };

    loadPreference().catch(() => setLoading(false));
  }, []);

  const setMode = useCallback(async (nextMode: ThemeMode) => {
    setModeState(nextMode);
    await SecureStore.setItemAsync(THEME_MODE_KEY, nextMode);
  }, []);

  const resolvedMode = resolveMode(mode, systemScheme);
  const theme = resolvedMode === "dark" ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({
      theme,
      mode,
      resolvedMode,
      setMode,
      loading,
    }),
    [theme, mode, resolvedMode, setMode, loading]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
