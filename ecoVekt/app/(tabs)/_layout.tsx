// app/(tabs)/_layout.tsx
import { Stack } from "expo-router";
import React from "react";

export default function TabsLayout() {
  // Ingen Tab-navigator, bare en vanlig Stack.
  // Alle sidene i (tabs)-mappa (welcome, chooseWaste, logWeight, yourTrash, profile, osv.)
  // pushes med router.push() / router.back().
  return (
    <Stack
      screenOptions={{
        headerShown: false, // vi bruker egne headere i skjermene
      }}
    />
  );
}
