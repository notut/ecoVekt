import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { StepProgress } from "@/components/stepProgress";
import WasteCard from "@/components/wasteCard";
import { useFocusEffect, useRouter } from "expo-router";
import { auth, db } from "../../firebaseConfig";
// 🔑 IMPORT: Importer Header komponentet
import { Header } from "@/components/header";

type TrashType = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
};

const PRIMARY = "#5F9D84";
const TEXT_DARK = "#486258";
const BG = "#FFFFFF";

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

  useFocusEffect(
    useCallback(() => {
      const fetchTrashTypes = async () => {
        setLoading(true); 
        setError(null); 

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
      
      return () => {};
    }, [])
  ); 

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

  // 🔹 HOVED-RENDER 
  return (
    <View style={styles.container}>
      {/* 🔑 FIX: Bruk den delte Header komponenten for å sikre centering og safe area håndtering */}
      <Header
        title="Velg avfall"
        // Vi trenger ikke onBackPress her da dette er steg 1
        // Vi trenger heller ikke onProfilePress her i følge designet
        containerStyle={{
            height: 80, // Sett total høyde
            backgroundColor: PRIMARY, // Sett riktig farge
            paddingHorizontal: 20,
            paddingLeft: 10,
        }}
        titleStyle={{
            fontSize: 20,
            // Fjern alle alignment/margin overrides for å sikre centering
            fontWeight: "600",
            color: "#FFFFFF",
        }}
      />

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
          // inne i ChooseWaste
          <WasteCard
            key={item.id}
            item={item}
            onSelect={(selected: TrashType) => {
              router.push({
                pathname: "/(tabs)/logWeight",
                params: {
                  trashId: selected.id,
                  trashTitle: selected.title,
                  imageUrl: selected.imageUrl ?? "",   
                },
              });
            }}
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
  // FIX: Fjern den gamle, manuelle header stilen
  /*
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
  */
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
  marginBottom: 8, 
},
});