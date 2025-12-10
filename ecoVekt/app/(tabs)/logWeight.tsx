// skjermen som skal registrere vekt
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Header } from "@/components/header";
import { StepProgress } from "@/components/stepProgress"; // henter step progres herfra
import { auth } from "../../firebaseConfig";
import { colors } from "@/components/colors"; // henter fargene herfra 
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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
      imageUrl: imageUrl ?? null,
    };

    try {
      setSaving(true);

      const raw = await AsyncStorage.getItem("pendingWasteEntries");
      const list = raw ? (JSON.parse(raw) as typeof entry[]) : [];

      list.push(entry);

      await AsyncStorage.setItem("pendingWasteEntries", JSON.stringify(list));

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
      <Header
        title="Registrer vekt"
        onBackPress={() => router.push("/(tabs)/chooseWaste")}        
        onProfilePress={() => {}}
        containerStyle={{
          height: 80,
          justifyContent: "flex-start",
          overflow: "hidden",
          paddingLeft: 10,
          backgroundColor: colors.mainGreen,
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
        <View style={styles.stepWrapper}>
          <StepProgress steps={steps} currentStep={2} />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Valgt avfallstype</Text>
          <Text style={styles.infoTitle}>{trashTitle}</Text>
        </View>

        <View style={styles.labelRow}>
        <MaterialCommunityIcons
          name="scale-balance"
          size={32}
          color={colors.mainGreen}
          style={{ marginRight: 8 }}
        />
          <Text style={styles.labelTwo}>Vekt</Text>
        </View>

        <View style={styles.weightRow}>
          <TouchableOpacity
            style={styles.adjustBtn}
            onPress={() =>
              setWeight((prev) =>
                Math.max(0, Number(prev || "0") - 0.1).toFixed(2)
              )
            }
          >
            <Text style={styles.adjustText}>-</Text>
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

        <TouchableOpacity
          style={styles.fullforButton}
          onPress={handleFullfor}
          disabled={saving}
        >
          <Text style={styles.fullforText}>
            {saving ? "Lagrer..." : "Lagre"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Stylingen
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  stepWrapper: {
    alignItems: "center",
    marginBottom: 16,
  },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",  // gjør at ikon + tekst står midtstilt som i bildet
    marginBottom: 8,
  },
  
  labelIcon: {
    marginRight: 8,
  },
  
  label: {
    fontSize: 18,
    color: colors.text,
    fontFamily: "Inter_400Regular",
  },

  infoBox: {
    backgroundColor: colors.textBox,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
    fontFamily: "Inter_400Regular",
  },

  infoTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.darkGreen,
    fontFamily: "Poppins_600SemiBold",
  },

  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  labelTwo: {
    fontSize: 24,
    color: colors.text,
    fontFamily: "Inter_400Regular",
  },

  adjustBtn: {
    width: 50,
    height: 50,
    backgroundColor: colors.mainGreen,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  adjustText: {
    color: "#FFF",
    fontSize: 30,
    fontWeight: "bold",
    lineHeight: 42,
  },

  input: {
    flex: 1,
    height: 50,
    backgroundColor: colors.textBox,
    borderWidth: 2,
    borderColor: colors.mainGreen,
    borderRadius: 12,
    marginHorizontal: 8,
    paddingHorizontal: 12,
    fontSize: 18,
    fontFamily: "Inter_400Regular",
  },

  fullforButton: {
    backgroundColor: colors.mainGreen,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 8,
  },

  fullforText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.textBox,
    fontFamily: "Poppins_500Medium",
  },
});
