import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from "react-native";

export default function RegistrerVekt() {
  const [vekt, setVekt] = useState("");
  const [typeAvfall, setTypeAvfall] = useState("");

  const handleSubmit = () => {
    if (!vekt || !typeAvfall) {
      Alert.alert("Feil", "Vennligst fyll inn alle feltene");
      return;
    }

    console.log("Registrert vekt:", vekt);
    console.log("Avfallstype:", typeAvfall);

    Alert.alert("OK", "Vekt registrert!");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Registrer vekt</Text>

      <Text style={styles.label}>Avfallstype</Text>
      <TextInput
        style={styles.input}
        value={typeAvfall}
        onChangeText={setTypeAvfall}
        placeholder="F.eks plast, matavfall…"
      />

      <Text style={styles.label}>Vekt (kg)</Text>
      <TextInput
        style={styles.input}
        value={vekt}
        onChangeText={setVekt}
        keyboardType="numeric"
        placeholder="F.eks 1.3"
      />

      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Registrer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 18 },
});
