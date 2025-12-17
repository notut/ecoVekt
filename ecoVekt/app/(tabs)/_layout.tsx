// app/(tabs)/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
