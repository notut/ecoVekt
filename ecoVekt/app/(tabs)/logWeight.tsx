// Registrer vekt-siden: bruker valgt avfallstype fra forrige skjerm
// og lar brukeren kun fylle inn vekt.

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router";

import { db, auth } from "../../firebaseConfig";
import { Header } from "@/components/header";
import { StepProgress } from "@/components/stepProgress";

const PRIMARY = "#6C8C76";
const TEXT_DARK = "#486258";
const BG = "#F5F5F5";

type RouteParams = {
  trashId?: string;
  trashTitle?: string;
};

export default function RegistrerVekt() {
  const router = useRouter();
  const { trashId, trashTitle } = useLocalSearchParams<RouteParams>();

  const [weight, setWeight] = useState<string>("");
  const [saving, setSaving] = useState(false);

  const steps = [
    { id: 1 },
    { id: 2 },
    { id: 3 },
  ];

  const handleSave = async () => {
    if (!trashTitle) {
      Alert.alert("Feil", "Fant ikke valgt avfallstype. Gå tilbake og prøv igjen.");
      return;
    }

    if (!weight) {
      Alert.alert("Feil", "Du må fylle inn vekten.");
      return;
    }

    const numericWeight = Number(weight);
    if (Number.isNaN(numericWeight) || numericWeight <= 0) {
      Alert.alert("Feil", "Vekten må være et tall større enn 0.");
      return;
    }

    try {
      setSaving(true);

      const user = auth.currentUser;

      // 🔹 Lagre til Firestore
      await addDoc(collection(db, "waste"), {
        wasteId: trashId ?? null,
        wasteTitle: trashTitle,
        amountKg: numericWeight,
        timestamp: serverTimestamp(),
        userId: user ? user.uid : null,
      });

      // 🔹 Lagre sist registrerte i AsyncStorage (valgfritt, men du hadde det fra før)
      await AsyncStorage.setItem(
        "lastWasteEntry",
        JSON.stringify({
          wasteTitle: trashTitle,
          weight: numericWeight,
          savedAt: new Date().toISOString(),
        })
      );

      // 🔹 Naviger til suksess-siden
      router.push("/successfullyRegistered");
    } catch (err) {
      console.log("🔥 Firestore error:", err);
      Alert.alert("Feil", "Kunne ikke lagre avfallet. Prøv igjen.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* HEADER */}
      <Header
        title="Fyll inn vekt"
        onBackPress={() => router.back()}
        // onProfilePress={...} kan kobles senere
      />

      <View style={styles.container}>
        {/* STEG 2 AV 3 */}
        <View style={styles.stepWrapper}>
          <StepProgress steps={steps} currentStep={2} />
        </View>

        {/* INFO OM VALGT AVFALLSTYPE */}
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Valgt avfallstype</Text>
          <Text style={styles.infoTitle}>
            {trashTitle ?? "Ukjent avfallstype"}
          </Text>
        </View>

        {/* INPUT FOR VEKT */}
        <Text style={styles.label}>Vekt (kg)</Text>
        <View style={styles.weightRow}>
          {/* minus-knapp */}
          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() =>
              setWeight((prev) =>
                Math.max(0, Number(prev || "0") - 0.1).toFixed(2)
              )
            }
          >
            <Text style={styles.adjustText}>–</Text>
          </TouchableOpacity>

          {/* direkte input */}
          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="0.25"
            placeholderTextColor="#999"
            value={weight}
            onChangeText={(val) => setWeight(val.replace(",", "."))}
          />

          {/* pluss-knapp */}
          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() =>
              setWeight((prev) =>
                (Number(prev || "0") + 0.1).toFixed(2)
              )
            }
          >
            <Text style={styles.adjustText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* LAGRE-KNAPP */}
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Lagrer..." : "Lagre"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  stepWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  infoLabel: {
    fontSize: 13,
    color: "#6B7A75",
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 18,
    color: TEXT_DARK,
    fontWeight: "600",
  },
  label: {
    fontSize: 16,
    color: TEXT_DARK,
    marginBottom: 8,
  },
  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  adjustBtn: {
    width: 50,
    height: 50,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  adjustText: {
    color: "#FFF",
    fontSize: 30,
    fontWeight: "bold",
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    fontSize: 18,
    backgroundColor: "#FFF",
  },
  saveButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
  },
});