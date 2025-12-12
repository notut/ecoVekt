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
import { Header } from "@/components/header";
import AsyncStorage from "@react-native-async-storage/async-storage";

type TrashType = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
};

const PRIMARY = "#5F9D84";
const BG = "#FFFFFF";

export default function ChooseWaste() {
  const [trashTypes, setTrashTypes] = useState<TrashType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const steps = [{ id: 1 }, { id: 2 }, { id: 3 }];

  useFocusEffect(
    useCallback(() => {
      const fetchTrashTypes = async () => {
        setLoading(true);
        setError(null);

        try {
          const user = auth.currentUser;
          let allowedTitles: string[] | null = null;

          if (user) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const data = userSnap.data() as { selectedWaste?: string[] };
              allowedTitles = data.selectedWaste ?? null;
            }
          }

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

          types.sort((a, b) => a.title.localeCompare(b.title));

          if (allowedTitles && allowedTitles.length > 0) {
            types = types.filter((t) => allowedTitles!.includes(t.title));
          }

          setTrashTypes(types);
        } catch (err) {
          console.error("Error fetching trash types:", err);
          setError(
            "Kunne ikke hente avfallstyper. Sjekk Firestore eller nettverk."
          );
        } finally {
          setLoading(false);
        }
      };

      fetchTrashTypes();

      return () => {};
    }, [])
  );

  const handleSelect = async (item: TrashType) => {
    await AsyncStorage.setItem(
      "lastSelectedWaste",
      JSON.stringify({
        id: item.id,
        title: item.title,
        imageUrl: item.imageUrl ?? "",
      })
    );

    router.push({
      pathname: "/(tabs)/logWeight",
      params: {
        trashId: item.id,
        trashTitle: item.title,
        imageUrl: item.imageUrl ?? "",
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

  return (
    <View style={styles.container}>
      <Header
        title="Velg avfall"
        onProfilePress={() => router.push("/(tabs)/admin/profile")}
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

      <View style={styles.stepWrapper}>
        <StepProgress steps={steps} currentStep={1} />
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {trashTypes.map((item) => (
          <WasteCard
            key={item.id}
            item={item}
            onSelect={() => handleSelect(item)}
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
  list: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  stepWrapper: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
