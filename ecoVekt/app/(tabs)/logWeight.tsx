// skjermen som skal registrere vekt
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert, // beholdes, nå brukt til feilmeldinger
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Header } from "@/components/header";
import { StepProgress } from "@/components/stepProgress";
import { auth, db } from "../../firebaseConfig";

// Design - gjenbruk fra prosjektet
const PRIMARY = "#5F9D84";
const TEXT_DARK = "#486258";
const BG = "#FFFFFF";

type RouteParams = {
  trashId?: string;
  trashTitle?: string;
  imageUrl?: string;
};


export default function RegistrerVekt() {
  const router = useRouter();
  const { trashId, trashTitle, imageUrl } = useLocalSearchParams<RouteParams>();
  const [weight, setWeight] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const steps = [{ id: 1 }, { id: 2 }, { id: 3 }];

  // funksjon for lagring og fullføring
  const handleFullfor = async () => {
  if (!trashTitle) {
    Alert.alert("Feil", "Avfallstype mangler.");
    return;
  }

  const numericWeight = Number(weight);

  if (weight.trim() === "" || Number.isNaN(numericWeight) || numericWeight <= 0) {
    Alert.alert("Ugyldig input", "Du må skrive inn et gyldig tall i kg (større enn 0).");
    return;
  }

  if (numericWeight > 500) {
    Alert.alert("Urealistisk verdi", "Maks tillatt vekt er 500 kg per registrering.");
    return;
  }

  const user = auth.currentUser;

  const entry = {
  wasteId: trashId ?? null,
  wasteTitle: trashTitle,
  amountKg: numericWeight,
  userId: user?.uid ?? null,
  savedAt: new Date().toISOString(),
  imageUrl: imageUrl ?? null,     // 👈 NYTT
};

  try {
    setSaving(true);

    // 🔹 1. Hent eksisterende lokale registreringer
    const raw = await AsyncStorage.getItem("pendingWasteEntries");
    const list = raw ? (JSON.parse(raw) as typeof entry[]) : [];

    // 🔹 2. Legg til den nye
    list.push(entry);

    // 🔹 3. Lagre tilbake i localStorage
    await AsyncStorage.setItem("pendingWasteEntries", JSON.stringify(list));

    // 🔹 4. Gå til YourTrash (steg 3)
    router.push("/(tabs)/yourTrash");
  } catch (err) {
    console.error("Lokal lagring feilet:", err);
    Alert.alert("Feil", "Klarte ikke å lagre lokalt. Prøv igjen.");
  } finally {
    setSaving(false);
  }
};

  return (
    <View style={styles.root}>
      {/* Header komponent som vises øverst i UI */}
      <Header
        title="Registrer vekt"
        onBackPress={() => router.back()}
        onProfilePress={() => {}}
        containerStyle={{
          height: 80,
          justifyContent: "flex-start",
          overflow: "hidden",
          paddingLeft: 10,
        }}
        titleStyle={{
          fontSize: 20,
          marginTop: 40,
          textAlign: "left",
          alignSelf: "flex-start",
          color: "#FFFFFF",
          fontWeight: "600",
        }}
      />

      <View style={styles.container}>
        {/* steg prosessen */}
        <View style={styles.stepWrapper}>
          <StepProgress steps={steps} currentStep={2} />
        </View>

        {/* Informasjonen av valgt avfalstype */}
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Valgt avfallstype</Text>
          <Text style={styles.infoTitle}>{trashTitle}</Text>
        </View>

        {/* Input for vekten */}
        <Text style={styles.label}>Vekt (kg)</Text>
        <View style={styles.weightRow}>
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

          <TextInput
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="0.25"
            value={weight}
            onChangeText={(val) => setWeight(val.replace(",", "."))}
          />

          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() =>
              setWeight((prev) => (Number(prev || "0") + 0.1).toFixed(2))
            }
          >
            <Text style={styles.adjustText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Fullfør knapp */}
        <TouchableOpacity
          style={styles.fullforButton}
          onPress={handleFullfor}
          disabled={saving}
        >
          <Text style={styles.fullforText}>
            {saving ? "Lagrer..." : "Fullfør"}
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
    justifyContent: "center",
    alignItems: "center",
  },
  adjustText: {
    color: "#FFF",
    fontSize: 30,
    fontWeight: "bold",
  },
  infoBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT_DARK,
    marginBottom: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_DARK,
  },
  label: {
    fontSize: 16,
    color: TEXT_DARK,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: PRIMARY,
    borderRadius: 12,
    marginHorizontal: 12,
    paddingHorizontal: 12,
    fontSize: 18,
  },

  fullforButton: {
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
  },
  fullforText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
});
