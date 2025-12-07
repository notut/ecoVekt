import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebaseConfig";
import WasteCard from "@/components/wasteCard";
import { Header } from "@/components/header";
import { StepProgress } from "@/components/stepProgress";

const PRIMARY = "#6C8C76";
const TEXT_DARK = "#486258";
const BG = "#F5F5F5";

export default function YourTrash() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const steps = [{ id: 1 }, { id: 2 }, { id: 3 }];

  useEffect(() => {
    const fetchWasteEntries = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          setLoading(false);
          return;
        }

        // Hent alt avfall registrert i Firestore for denne brukeren
        const qRef = query(
          collection(db, "waste"),
          where("userId", "==", user.uid)
        );

        const snapshot = await getDocs(qRef);
        const list: any[] = [];

        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });

        list.sort((a, b) => b.savedAt?.localeCompare(a.savedAt));

        setLogs(list);

        // Lagre hele oversikten i AsyncStorage for senere bruk
        await AsyncStorage.setItem("wasteOverview", JSON.stringify(list));
      } catch (err) {
        console.error("Feil ved henting av avfall:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStored();
    fetchWasteEntries();
  }, []);

  // Henter sist lagrede waste entry 
  const [lastEntry, setLastEntry] = useState<any | null>(null);

  const fetchStored = async () => {
    const raw = await AsyncStorage.getItem("lastWasteEntry");
    if (raw) {
      setLastEntry(JSON.parse(raw));
    }
  };

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Laster avfall...</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>

      {/* Header komponent som vises øverst i UI */} 
     <Header
       title="Ditt Avfall"
       onBackPress={() => {}}
       onProfilePress={() => {}}
       containerStyle={{ height: 80, justifyContent: "flex-start", overflow: "hidden", paddingLeft: 10,
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
      {/*  prosess steg. 3 (alle ferdig)  */}
      <View style={styles.stepWrapper}>
        <StepProgress steps={steps} currentStep={4} />
      </View>

      {/*  Liste med alt registrert avfall  */}
      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 30 }}>
        {logs.length === 0 ? (
          <Text style={styles.empty}>Ingen avfall registrert enda ♻️</Text>
        ) : (
          logs.map((item) => (
            <WasteCard
              key={item.id}
              item={{
                title: item.wasteTitle,
                description: `Registrert vekt: ${item.amountKg} kg`,
                imageUrl: null,
              }}
              onSelect={() => {}}
            />
          ))
        )}

        {/*  Neste knapp som sender brukeren videre til ditt avfall oversikt  */}
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push("/(tabs)/successfullyRegistered")}
        >
          <Text style={styles.nextButtonText}>Fullfør</Text>
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
    fontSize: 18,
    fontWeight: "600",
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
  nextButton: {
    backgroundColor: PRIMARY,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    marginHorizontal: 20,
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  }
});
