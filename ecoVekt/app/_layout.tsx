import { colors } from "@/components/colors";
import AuthSessionProvider, { useAuthSession } from "@/providers/authctx";
import { router, Stack, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

function AuthGate() {
  const { userNameSession, isLoading } = useAuthSession();
  const segments = useSegments() as string[];

  useEffect(() => {
    if (isLoading) return;

    const inProtected = segments[0] === "(tabs)";
    const onAuthScreen = segments[0] === "brukerregistrering";

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthSessionProvider>
          <AuthGate />
        </AuthSessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
