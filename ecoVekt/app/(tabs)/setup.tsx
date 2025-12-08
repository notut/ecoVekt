import { router } from "expo-router";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import TagsList from "../../components/TagsList";
import { auth, db } from "../../firebaseConfig";

// TrashType interface remains the same, but we will use 'title' for selection
interface TrashType {
  id: string; // Firebase Document ID (e.g., "1", "2", or a random string)
  title: string; // The waste name (e.g., "Trevirke", "Glass og metall")
}

export default function SetupBusiness() {
  const [trashTypes, setTrashTypes] = useState<TrashType[]>([]);
  // selected now holds an array of TITLES (strings like "Trevirke") instead of IDs
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTrashTypes = async () => {
      try {
        const snapshot = await getDocs(collection(db, "trash"));
        const list: TrashType[] = [];

        snapshot.forEach((d) => {
          const data = d.data() as any;
          // We must ensure we get the title/name, just like the admin page does
          const title = data.title ?? data.name ?? String(d.id);

          list.push({ id: d.id, title: title });
        });

        // The admin page sorts by title name, so we will do the same for consistency
        list.sort((a, b) => a.title.localeCompare(b.title));

        setTrashTypes(list);
      } catch (error) {
          console.error("Error fetching trash types:", error);
          Alert.alert("Error", "Could not load trash types.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrashTypes();
  }, []);

  // 🔑 CHANGE: toggleSelection now takes the TITLE (string)
  const toggleSelection = (title: string) => {
    setSelected((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleContinue = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Feil", "Du må være logget inn for å lagre valget ditt.");
      return;
    }

    if (selected.length === 0) {
        Alert.alert("Info", "Vennligst velg minst én type avfall.");
        return;
    }

    setIsSaving(true);
    try {
      const userDocRef = doc(db, "users", user.uid); 
      
      // 🔑 CRITICAL CHANGE: selected already holds the array of titles/names.
      // This array is saved to the 'selectedWaste' field, compatible with the admin page.
      await setDoc(userDocRef, {
        selectedWaste: selected, // This array now contains titles (e.g., ["Trevirke", "Glass og metall"])
      }, { merge: true });

      // Navigate to the next screen using the corrected Expo Router path
      router.replace("/(tabs)/chooseWaste"); 
      
    } catch (error) {
      console.error("Error saving selected waste types:", error);
      Alert.alert("Feil", "Klarte ikke å lagre valget ditt. Vennligst prøv igjen.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isSaving) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#507C6D" />
        <Text style={{ marginTop: 10, color: '#507C6D' }}>
            {isSaving ? "Lagrer..." : "Laster inn..."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Velg hvilke typer avfall du bruker i din bedrift:</Text>
      
      {/* 🔑 CHANGE: TagsList now receives the TITLE for selection checking/toggling */}
      <TagsList
        items={trashTypes}
        selectedItems={selected}
        // TagsList must be updated to pass item.title, not item.id
        onToggle={toggleSelection} 
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>Fortsett</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // 🔑 CORRECTION: Removed marginTop: 120 and ensured paddingTop is sufficient
    paddingTop: 40, // Keeping 40 as a good starting point for padding from the top
    // marginTop: 120, <--- REMOVED THIS LINE
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    marginBottom: 20,
    fontFamily: "Poppins_400Regular",
    textAlign: "left",
    color: "#507C6D",
    // Text automatically wraps unless specifically constrained (e.g., numberOfLines: 1)
  },
  button: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "#507C6D",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins_500Medium",
  },
});