import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { auth, db } from "../../firebaseConfig";
import WasteCard from "@/components/wasteCard";
import { StepProgress } from "@/components/stepProgress";


type TrashType = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
};

const PRIMARY = "#6C8C76";
const TEXT_DARK = "#486258";
const BG = "#F5F5F5";

export default function ChooseWaste() {
  const [trashTypes, setTrashTypes] = useState<TrashType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 🔹 Stegene i prosessen – denne siden er alltid steg 1
  const steps = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
];

  useEffect(() => {
  const fetchTrashTypes = async () => {
    try {
      const user = auth.currentUser;
      let allowedTitles: string[] | null = null;

      // 1. Hent hvilke typer brukeren har valgt fra users/{uid}.selectedWaste
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data() as { selectedWaste?: string[] };
          allowedTitles = data.selectedWaste ?? null;
        }
      }

      // 2. Hent alle avfallstyper fra "trash"
      const snapshot = await getDocs(collection(db, "trash"));
      let types: TrashType[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as any;
        types.push({
          id: docSnap.id,
          title: data.title ?? data.name ?? String(docSnap.id),
          description: data.description,
          imageUrl: data.imageUrl || data.imageurl || undefined,
        });
      });

      // Sortér (samme som på SetupBusiness-siden)
      types.sort((a, b) => a.title.localeCompare(b.title));

      // 3. Hvis brukeren har valgt typer → filtrer på title
      if (allowedTitles && allowedTitles.length > 0) {
        types = types.filter((t) => allowedTitles!.includes(t.title));
      }

      setTrashTypes(types);
    } catch (err) {
      console.error("Error fetching trash types:", err);
      setError("Kunne ikke hente avfallstyper. Sjekk Firestore eller nettverk.");
    } finally {
      setLoading(false);
    }
  };

  fetchTrashTypes();
}, []);

  const handleSelect = (item: TrashType) => {
    router.push({
      pathname: "/(tabs)/logWeight",
      params: {
        trashId: item.id,
        trashTitle: item.title,
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // 🔹 HOVED-RENDER – KUN ÉN return HER
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Velg avfall</Text>
      </View>

      {/* STEG-INDIKATOR */}
      <View style={styles.stepWrapper}>
        <StepProgress steps={steps} currentStep={1} />
      </View>

      {/* LISTE MED AVFALLSKORT */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {trashTypes.map((item) => (
          <WasteCard
            key={item.id}
            item={item}
            onSelect={(selected: TrashType) => handleSelect(selected)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 40,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  stepWrapper: {
  alignItems: "center",
  marginTop: 12,
  marginBottom: 8, // lite mellomrom under
},
});