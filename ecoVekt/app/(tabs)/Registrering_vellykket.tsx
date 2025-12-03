import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function RegistreringVellykket() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Registrering vellykket! 🎉</Text>
      <Text style={styles.text}>Avfallet ditt er registrert.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  text: { fontSize: 16 },
});
