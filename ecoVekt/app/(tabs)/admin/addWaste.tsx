import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  Pressable,
  View,
  ScrollView,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { auth, db } from "@/firebaseConfig";
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

type WasteType = {
  id: string;
  title: string;
};

export default function AddWasteScreen(): React.ReactElement {
  const router = useRouter();

  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [selected, setSelected] = useState<string[]>([]); // TITLES, ikke IDs
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [userUid, setUserUid] = useState<string | null>(auth.currentUser?.uid ?? null);

  const fetchWasteTypes = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "trash"));
      const list: WasteType[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        const title = data.title ?? data.name ?? String(d.id);
        list.push({ id: d.id, title });
      });
      list.sort((a, b) => a.title.localeCompare(b.title));
      setWasteTypes(list);
    } catch (e) {
      console.error("Feil ved henting av waste types:", e);
      Alert.alert("Feil", "Kunne ikke laste inn avfallstyper.");
      setWasteTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSelected = async (uid: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data() as any;
        const arr = Array.isArray(data.selectedWaste) ? data.selectedWaste : [];
        setSelected(arr);
      } else {
        setSelected([]);
      }
    } catch (e) {
      console.error("Feil ved henting av brukerens valgte avfall:", e);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUserUid(u ? u.uid : null);
    });
    fetchWasteTypes();
    return () => unsub();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (userUid) {
        loadUserSelected(userUid);
      } else {
        setSelected([]);
      }
      return () => {};
    }, [userUid])
  );

  const toggleSelection = (title: string) => {
    setSelected((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]));
  };

  const handleSave = async () => {
    if (!userUid) {
      router.replace("./profile");
      return;
    }

    setIsSaving(true);
    try {
      const userRef = doc(db, "users", userUid);
      await setDoc(
        userRef,
        {
          selectedWaste: selected,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      router.replace("./profile");
    } catch (e) {
      console.error("Feil ved lagring av selectedWaste:", e);
      Alert.alert("Feil", "Klarte ikke å lagre valget ditt. Vennligst prøv igjen.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isSaving || !wasteTypes.length) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={styles.hint}>{isSaving ? "Lagrer..." : "Laster avfallstyper…"}</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={styles.title}>Velg avfallstyper</Text>
        <Pressable onPress={() => router.replace("./profile")} style={styles.backButton}>
          <Feather name="x" size={26} color="#2f6f5b" />
        </Pressable>
      </View>

      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.instructions}>
            Trykk på de avfallstypene du vil legge til. Trykk på samme for å fjerne.
          </Text>

          <View style={styles.chipsWrap}>
            {wasteTypes.map((w) => {
              const isSelected = selected.includes(w.title);
              return (
                <Pressable
                  key={w.id}
                  onPress={() => toggleSelection(w.title)}
                  style={[styles.chip, isSelected ? styles.chipActive : undefined]}
                  android_ripple={{ color: "rgba(0,0,0,0.08)" }}
                >
                  <Text style={[styles.chipText, isSelected ? styles.chipTextActive : undefined]}>{w.title}</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={{ height: 36 }} />

          <Pressable onPress={handleSave} style={[styles.saveButton, isSaving ? styles.saveButtonDisabled : null]} disabled={isSaving}>
            <Text style={styles.saveText}>{isSaving ? "Lagrer..." : `Lagre (${selected.length})`}</Text>
          </Pressable>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#ffffff", paddingTop: 80 },
  header: {
    height: 50,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ffffffff",
  },
  backButton: { paddingVertical: 8, paddingHorizontal: 6 },
  title: { fontSize: 18, fontWeight: "700", color: "#2f6f5b" },

  container: { flex: 1, padding: 16, paddingTop: 40 },
  center: { alignItems: "center", justifyContent: "center", flex: 1 },
  hint: { color: "#64748b", marginTop: 8 },

  scrollContent: { paddingBottom: 24 },
  instructions: { color: "#334155", marginBottom: 34 },

  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "flex-start", 
  },

  chip: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2f6f5b",
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "white",
  },
  chipActive: { backgroundColor: "#2f6f5b" },
  chipText: { color: "#14332a" },
  chipTextActive: { color: "white", fontWeight: "700" },

  saveButton: {
    backgroundColor: "#2f6f5b",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 28,
    alignSelf: "center",
    minWidth: 160,
    alignItems: "center",
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveText: { color: "white", fontWeight: "700" },
});
