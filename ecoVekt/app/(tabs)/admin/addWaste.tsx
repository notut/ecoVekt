import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
// 🔑 Importér useFocusEffect
import { auth, db } from "@/firebaseConfig";
import { useFocusEffect, useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc
} from "firebase/firestore";

import { Feather } from "@expo/vector-icons";

type WasteType = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
};

// ... (Resten av funksjonen, fetchWasteTypes, toggle, handleSave forblir de samme)

export default function AddWasteScreen(): React.ReactElement {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [userUid, setUserUid] = useState<string | null>(auth.currentUser?.uid || null);

  const fetchWasteTypes = async () => {
    // ... (Logikk for å hente alle avfallstyper fra "trash")
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


  // 1. Initialisering og Henting av Alle Avfallstyper (KUN VED MONTERING)
  useEffect(() => {
    // Henter kun auth state initialt, setter userUid. loadUserSelected flyttes.
    const unsub = onAuthStateChanged(auth, (u) => {
        setUserUid(u ? u.uid : null);
    });
    fetchWasteTypes();
    return () => unsub();
  }, []);

  // 2. Henting av BRUKERENS VALGTE Avfallstyper (VED FOKUS)
  // 🔑 NYTT: Bruk useFocusEffect for å hente brukerens valgte avfall hver gang siden er synlig
  useFocusEffect(
    useCallback(() => {
      if (userUid) {
        // Henter de valgte kategoriene HVER GANG skjermen er fokusert.
        loadUserSelected(userUid); 
      }
      // cleanup funksjon for useFocusEffect er valgfritt her.
      return () => {};
    }, [userUid]) // Kjører også når userUid endres (dvs. ved innlogging)
  );

  const toggle = (title: string) => {
    setSelected((prev) =>
      prev.includes(title) ? prev.filter((x) => x !== title) : [...prev, title]
    );
  };

  const handleSave = async () => {
    if (!userUid) {
      // send til login
      router.replace("./profile");
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
      router.replace("./profile");
    } catch (e) {
      console.error("Feil ved lagring av selectedWaste:", e);
      alert("Kunne ikke lagre — prøv igjen.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={{ width: 40 }} /> 

        <Text style={styles.title}>Legg til avfallstyper</Text>

        <Pressable onPress={() => router.replace("./profile")} style={styles.backButton}>
          <Feather name="x" size={26} color="#2f6f5b" />
        </Pressable>
      </View>


      <View style={styles.container}>
        {loading || !userUid ? ( // Legger til sjekk på userUid her
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
  // ... (Styles er uendret)
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
  title: { fontSize: 18, fontWeight: "700", color: "#2f6f5b" },

  container: { flex: 1, padding: 16 },
  center: { alignItems: "center", justifyContent: "center", marginTop: 40 },
  hint: { color: "#64748b", marginTop: 8 },

  scrollContent: { paddingBottom: 24 },

  instructions: { color: "#334155", marginBottom: 34 },

  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",   
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