// app/(tabs)/yourTrash.tsx

import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { auth, db } from "../../firebaseConfig";
import WasteCard from "@/components/wasteCard";
import { Header } from "@/components/header";
import { StepProgress } from "@/components/stepProgress";

const PRIMARY = "#6C8C76";
const TEXT_DARK = "#486258";
const BG = "#FFFFFF";

type LocalEntry = {
  wasteId?: string | null;
  wasteTitle?: string;
  amountKg: number;
  userId?: string | null;
  savedAt?: string;
};

type AggregatedEntry = {
  key: string;
  wasteId?: string | null;
  wasteTitle: string;
  totalKg: number;
  count: number;
};

export default function YourTrash() {
  const router = useRouter();
  const [entries, setEntries] = useState<LocalEntry[]>([]);
  const [aggregated, setAggregated] = useState<AggregatedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const steps = [{ id: 1 }, { id: 2 }, { id: 3 }];

  // Hent og aggreger lokale registreringer hver gang skjermen får fokus
  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);

      const raw = await AsyncStorage.getItem("pendingWasteEntries");
      const list: LocalEntry[] = raw ? JSON.parse(raw) : [];

      setEntries(list);

      // Aggreger per avfallstype (bruk id + tittel som nøkkel)
      const map: Record<string, AggregatedEntry> = {};
      list.forEach((e) => {
        const title = e.wasteTitle ?? "Ukjent avfallstype";
        const idPart = e.wasteId ?? "no-id";
        const key = `${idPart}__${title}`;

        if (!map[key]) {
          map[key] = {
            key,
            wasteId: e.wasteId ?? null,
            wasteTitle: title,
            totalKg: 0,
            count: 0,
          };
        }

        map[key].totalKg += e.amountKg;
        map[key].count += 1;
      });

      setAggregated(Object.values(map));
    } catch (err) {
      console.error("Feil ved lesing av pendingWasteEntries:", err);
      setEntries([]);
      setAggregated([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPending();
    }, [fetchPending])
  );

  // Fullfør: send alle summerte registreringer til Firestore, tøm localstorage og state
  const handleFullfor = async () => {
    if (aggregated.length === 0) {
      Alert.alert("Ingen avfall", "Det er ingen registreringer å lagre.");
      return;
    }

    const user = auth.currentUser;

    try {
      setSaving(true);

      for (const item of aggregated) {
        await addDoc(collection(db, "waste"), {
          wasteId: item.wasteId ?? null,
          wasteTitle: item.wasteTitle,
          amountKg: item.totalKg,
          timestamp: serverTimestamp(),
          userId: user?.uid ?? null,
          savedAt: new Date().toISOString(),
        });
      }

      // Tøm localstorage og state etter at alt er sendt inn
      await AsyncStorage.removeItem("pendingWasteEntries");
      setEntries([]);
      setAggregated([]);

      router.push("/(tabs)/successfullyRegistered");
    } catch (err) {
      console.error("Feil ved lagring til Firestore:", err);
      Alert.alert(
        "Lagring feilet",
        "Kunne ikke lagre til server. Prøv igjen senere."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Laster registrert avfall...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Header
        title="Ditt avfall"
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

      {/* Steg 3/3 */}
      <View style={styles.stepWrapper}>
        <StepProgress steps={steps} currentStep={3} />
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {aggregated.length === 0 ? (
          <Text style={styles.empty}>
            Ingen avfall registrert enda. Gå tilbake og registrer noe ♻️
          </Text>
        ) : (
          aggregated.map((item) => (
            <WasteCard
              key={item.key}
              item={{
                title: item.wasteTitle,
                description:
                  item.count > 1
                    ? `Totalt: ${item.totalKg} kg (${item.count} registreringer)`
                    : `Registrert vekt: ${item.totalKg} kg`,
                imageUrl: null,
              }}
              onSelect={() => {}}
            />
          ))
        )}

        {/* Mer avfall – beholder localstorage, går tilbake til valg av avfall */}
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => router.push("/(tabs)/chooseWaste")}
        >
          <Text style={styles.moreButtonText}>Mer avfall</Text>
        </TouchableOpacity>

        {/* Fullfør – sender til Firestore og tømmer localstorage */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleFullfor}
          disabled={saving || aggregated.length === 0}
        >
          <Text style={styles.nextButtonText}>
            {saving ? "Lagrer..." : "Fullfør"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  center: {
    flex: 1,
    justifyContent: "center",
  },
  stepWrapper: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  empty: {
    fontSize: 16,
    fontWeight: "500",
    color: TEXT_DARK,
    textAlign: "center",
    marginTop: 20,
  },
  loadingText: {
    fontSize: 18,
    color: PRIMARY,
    marginTop: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  moreButton: {
    backgroundColor: "#FFFFFF",
    borderColor: PRIMARY,
    borderWidth: 2,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 10,
  },
  moreButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: PRIMARY,
  },
  nextButton: {
    backgroundColor: PRIMARY,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    marginHorizontal: 20,
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
});