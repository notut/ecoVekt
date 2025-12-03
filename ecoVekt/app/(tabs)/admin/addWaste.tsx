import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

type WasteType = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
};

export default function AddWasteScreen(): React.ReactElement {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [userUid, setUserUid] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUserUid(u.uid);
        loadUserSelected(u.uid);
      } else {
        setUserUid(null);
      }
    });
    fetchWasteTypes();
    return () => unsub();
    
  }, []);

  const fetchWasteTypes = async () => {
    setLoading(true);
    try {
      const colRef = collection(db, "trash"); 
      const snap = await getDocs(colRef);
      const arr: WasteType[] = [];
      snap.forEach((d) => {
        const data = d.data() as any;
        arr.push({
          id: d.id,
          title: data.title ?? data.name ?? String(d.id),
          description: data.description ?? "",
          imageUrl: data.imageUrl ?? undefined,
        });
      });
      arr.sort((a, b) => a.title.localeCompare(b.title));
      setWasteTypes(arr);
    } catch (e) {
      console.error("Feil ved henting av waste types:", e);
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

  const toggle = (title: string) => {
    setSelected((prev) =>
      prev.includes(title) ? prev.filter((x) => x !== title) : [...prev, title]
    );
  };

  const handleSave = async () => {
    if (!userUid) {
      // send til login
      router.replace("/(tabs)/admin/profile");
      return;
    }

    setSaving(true);
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
      // gå tilbake til profil 
      router.replace("/(tabs)/admin/profile");
    } catch (e) {
      console.error("Feil ved lagring av selectedWaste:", e);
      alert("Kunne ikke lagre — prøv igjen.");
    } finally {
      setSaving(false);
    }
  };

  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>Tilbake</Text>
        </Pressable>
        <Text style={styles.title}>Legg til avfallstyper</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.container}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={styles.hint}>Laster avfallstyper…</Text>
          </View>
        ) : (
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
                    onPress={() => toggle(w.title)}
                    style={[
                      styles.chip,
                      isSelected ? styles.chipActive : undefined,
                    ]}
                    android_ripple={{ color: "rgba(0,0,0,0.08)" }}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected ? styles.chipTextActive : undefined,
                      ]}
                    >
                      {w.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ height: 36 }} />

            <Pressable
              onPress={handleSave}
              style={[styles.saveButton, saving ? styles.saveButtonDisabled : null]}
              disabled={saving}
            >
              <Text style={styles.saveText}>
                {saving ? "Lagrer..." : `Lagre (${selected.length})`}
              </Text>
            </Pressable>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: { paddingVertical: 8, paddingHorizontal: 6 },
  backText: { color: "#2f6f5b", fontWeight: "600" },
  title: { fontSize: 18, fontWeight: "700", color: "#2f6f5b" },

  container: { flex: 1, padding: 16 },
  center: { alignItems: "center", justifyContent: "center", marginTop: 40 },
  hint: { color: "#64748b", marginTop: 8 },

  scrollContent: { paddingBottom: 24 },

  instructions: { color: "#334155", marginBottom: 12 },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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
  chipActive: {
    backgroundColor: "#2f6f5b",
  },
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
