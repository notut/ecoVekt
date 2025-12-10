// app/(tabs)/yourTrash.tsx

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { Header } from "@/components/header";
import { StepProgress } from "@/components/stepProgress";
import WasteCard from "@/components/wasteCard";
import { MaterialIcons } from "@expo/vector-icons";
import { auth, db } from "../../firebaseConfig";

const PRIMARY = "#6C8C76";
const TEXT_DARK = "#486258";
const BG = "#FFFFFF";

type LocalEntry = {
  wasteId?: string | null;
  wasteTitle?: string;
  amountKg: number;
  userId?: string | null;
  savedAt?: string;
  imageUrl?: string | null;
};

type AggregatedEntry = {
  key: string;
  wasteId?: string | null;
  wasteTitle: string;
  totalKg: number;
  count: number;
  imageUrl?: string | null;
};

export default function YourTrash() {
  const router = useRouter();
  const [entries, setEntries] = useState<LocalEntry[]>([]);
  const [aggregated, setAggregated] = useState<AggregatedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const steps = [{ id: 1 }, { id: 2 }, { id: 3 }];

  // Bygger samme nøkkel som i aggregasjonen
  const buildKey = (e: LocalEntry) => {
    const title = e.wasteTitle ?? "Ukjent avfallstype";
    const idPart = e.wasteId ?? "no-id";
    return `${idPart}__${title}`;
  };

  const recomputeAggregated = (list: LocalEntry[]) => {
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
          imageUrl: e.imageUrl ?? null,
        };
      }

      map[key].totalKg += e.amountKg;
      map[key].count += 1;
    });

    return Object.values(map);
  };

  // Hent og aggreger lokale registreringer hver gang skjermen får fokus
  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);

      const raw = await AsyncStorage.getItem("pendingWasteEntries");
      const list: LocalEntry[] = raw ? JSON.parse(raw) : [];

      setEntries(list);
      setAggregated(recomputeAggregated(list));
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

  // Slett én aggregert type (alle registreringer for den typen)
  const handleDelete = async (key: string) => {
    // Filtrer bort alle entries som matcher denne aggregated-keyen
    const newEntries = entries.filter((e) => buildKey(e) !== key);
    const newAggregated = recomputeAggregated(newEntries);

    setEntries(newEntries);
    setAggregated(newAggregated);

    if (newEntries.length === 0) {
      await AsyncStorage.removeItem("pendingWasteEntries");
    } else {
      await AsyncStorage.setItem(
        "pendingWasteEntries",
        JSON.stringify(newEntries)
      );
    }
  };

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
        onBackPress={() => router.push("/(tabs)/logWeight")}        
        onProfilePress={() => {}}
        containerStyle={{
          height: 80,
          // FIX: Removed justifyContent: "flex-start"
          overflow: "hidden",
          paddingLeft: 10,
        }}
        titleStyle={{
          fontSize: 20,
          // FIX: Removed marginTop: 40 (for vertical centering)
          // FIX: Removed textAlign: "left" (for horizontal centering)
          // FIX: Removed alignSelf: "flex-start" (for vertical/horizontal centering)
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
            <Swipeable
              key={item.key}
              renderRightActions={() => (
                <View style={styles.deleteContainer}>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(item.key)}
                  >
                        <MaterialIcons name="delete" size={32} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            >
              <WasteCard
                item={{
                  title: item.wasteTitle,
                  description:
                    item.count > 1
                      ? `${item.totalKg} kg ( ${item.count} registreringer )`
                      : `${item.totalKg} kg`,
                  imageUrl: item.imageUrl ?? null,
                }}
                onSelect={() => {}}
                compact
              />
            </Swipeable>
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
  deleteContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  deleteButton: {
    backgroundColor: "#D9534F",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    height: 75,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    marginLeft: 8,
    paddingHorizontal: 8,
  },
  deleteText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});