/*
import { AuthContextProvider, useAuthSession } from "@/providers/authctx";
import { router, Stack, useSegments } from "expo-router";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { colors } from "@/components/colors";

function AuthGate() {
  const { userNameSession, isLoading } = useAuthSession();
  const segments = useSegments() as string[];

  useEffect(() => {
    if (isLoading) return;

    const inProtected = segments[0] == "(tabs)";
    const onAuthScreen = segments[0] == "brukerregistrering";

    if (!userNameSession && inProtected) {
      router.replace("/brukerregistrering/login");
      return;
    }

    if (userNameSession && onAuthScreen) {
      router.replace("/(tabs)");
    }
  }, [userNameSession, isLoading, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthContextProvider>
        <AuthGate />
      </AuthContextProvider>
    </SafeAreaProvider>
  );
}
*/
