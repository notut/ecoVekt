// skjermen som skal registrere vekt
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "@/components/colors";
import { Header } from "@/components/header";
import { StepProgress } from "@/components/stepProgress";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, usePathname } from "expo-router";
import { auth } from "../../firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomLeaves } from "@/components/Bottom_leaves";

type RouteParams = {
  trashId?: string;
  trashTitle?: string;
  imageUrl?: string;
};

type SavedWaste = {
  id: string;
  title: string;
  imageUrl: string;
};

export default function RegistrerVekt() {
  const router = useRouter();
  const pathname = usePathname();

  const { trashId, trashTitle, imageUrl } = useLocalSearchParams<RouteParams>();
  const [weight, setWeight] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [savedWaste, setSavedWaste] = useState<SavedWaste | null>(null);
  const steps = [{ id: 1 }, { id: 2 }, { id: 3 }];

  useEffect(() => {
    async function loadSaved() {
      const raw = await AsyncStorage.getItem("lastSelectedWaste");
      if (raw) {
        setSavedWaste(JSON.parse(raw));
      }
    }
    loadSaved();
  }, []);

  const handleFullfor = async () => {
    const effectiveWasteId = trashId || savedWaste?.id || null;
    const effectiveWasteTitle = trashTitle || savedWaste?.title || null;
    const effectiveImageUrl = imageUrl || savedWaste?.imageUrl || null;

    if (!effectiveWasteTitle) {
      Alert.alert("Feil", "Avfallstype mangler.");
      return;
    }

    const numericWeight = Number(weight);

    if (
      weight.trim() === "" ||
      Number.isNaN(numericWeight) ||
      numericWeight <= 0
    ) {
      Alert.alert(
        "Ugyldig input",
        "Du må skrive inn et gyldig tall i kg (større enn 0)."
      );
      return;
    }

    if (numericWeight > 500) {
      Alert.alert(
        "Urealistisk verdi",
        "Maks tillatt vekt er 500 kg per registrering."
      );
      return;
    }

    const user = auth.currentUser;

    const entry = {
      wasteId: effectiveWasteId,
      wasteTitle: effectiveWasteTitle,
      amountKg: numericWeight,
      userId: user?.uid ?? null,
      savedAt: new Date().toISOString(),
      imageUrl: effectiveImageUrl,
    };

    try {
      setSaving(true);

      const raw = await AsyncStorage.getItem("pendingWasteEntries");
      const list = raw ? (JSON.parse(raw) as (typeof entry)[]) : [];

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
        //Henter historikk å gå tilbake til
        onProfilePress={() =>
          router.push({
            pathname: "/(tabs)/admin/profile",
            params: { from: pathname },
          })
        }
        containerStyle={{
          height: 80,
          overflow: "hidden",
          paddingLeft: 10,
        }}
        titleStyle={{
          fontSize: 20,
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
          <Text style={styles.infoTitle}>
            {trashTitle || savedWaste?.title || "Ingen avfallstype valgt"}
          </Text>
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

        <Text style={styles.text}>F.e.ks 0,25 kg</Text>

        <TouchableOpacity
          style={styles.fullforButton}
          onPress={handleFullfor}
          disabled={saving}
        >
          <Text style={styles.fullforText}>
            Lagre{saving ? "Lagrer..." : ""}
          </Text>
        </TouchableOpacity>
        <BottomLeaves />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 14,
  },
  contentConteiner: {},
  stepWrapper: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    marginTop: 30,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    fontFamily: "Inter_400Regular",
    marginBottom: 4,
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
    marginBottom: 1,
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
    marginHorizontal: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  fullforButton: {
    backgroundColor: colors.mainGreen,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 120,
    marginTop: 10,
  },
  fullforText: {
    fontSize: 18,
    fontWeight: "500",
    color: colors.textBox,
    fontFamily: "Poppins_500Medium",
  },
  text: {
    textAlign: "center",
    marginBottom: 8,
    color: "#5c5c5cff",
    fontFamily: "Inter_400Regular",
  },
});
