import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function DittAvfall() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ditt avfall</Text>
      <Text style={styles.text}>
        Her kommer en oversikt over registrert avfall når backend kobles til.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  text: { fontSize: 16, color: "#333" },
});
