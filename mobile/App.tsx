import React from "react";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect } from "react";
import { AppState } from "react-native";
import { StatusBar } from "expo-status-bar";

import { AppNavigator } from "./src/navigation/AppNavigator";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { ThemeProvider } from "./src/theme/ThemeContext";
import { useTheme } from "./src/theme/useTheme";
import { registerPushToken } from "./src/services/pushService";
import {
  processPendingCheckInEscalation,
  refreshPendingCheckInFromServer,
} from "./src/services/smartCheckInMonitor";
import { startBatteryFallbackMonitor } from "./src/services/batteryFallback";

const ENABLE_PUSH_REGISTRATION =
  process.env.EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION === "true";

function BootstrapEffects() {
  const { token } = useAuth();

  useEffect(() => {
    if (token && ENABLE_PUSH_REGISTRATION) {
      registerPushToken().catch(() => undefined);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const sync = async () => {
      await refreshPendingCheckInFromServer();
      await processPendingCheckInEscalation();
    };

    sync().catch(() => undefined);
    const timer = setInterval(() => {
      sync().catch(() => undefined);
    }, 20000);

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" || state === "background") {
        sync().catch(() => undefined);
      }
    });

    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    const stop = startBatteryFallbackMonitor();
    return stop;
  }, [token]);

  return null;
}

function ThemedNavigation() {
  const { theme, resolvedMode } = useTheme();
  const navigationTheme = {
    ...(resolvedMode === "dark" ? DarkTheme : DefaultTheme),
    colors: {
      ...(resolvedMode === "dark" ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      notification: theme.danger,
    },
  };

  return (
    <>
      <StatusBar style={resolvedMode === "dark" ? "light" : "dark"} backgroundColor={theme.background} />
      <NavigationContainer theme={navigationTheme}>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <BootstrapEffects />
          <ThemedNavigation />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
