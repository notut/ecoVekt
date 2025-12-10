import { Tabs, router, useSegments } from "expo-router";
import React, { useEffect } from "react";
import AuthContextProviderm, { useAuthSession } from "@/providers/authctx";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function TabLayout() {
  const { userNameSession, isLoading } = useAuthSession();
  const segments = useSegments() as string[];

  useEffect(() => {
    if (isLoading) return;
    const inProtected = segments[0] === "(protected)";

    if (!userNameSession && inProtected) {
      router.replace("/brukerregistrering/autentication");
      return;
    }

    if (userNameSession && segments[0] === "brukerregistrering") {
      router.replace("/(tabs)");
    }
  }, [useAuthSession, isLoading, segments]);

  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="welcome"
        options={{
          title: "Welcome",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthContextProviderm>
          <TabLayout />
        </AuthContextProviderm>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
