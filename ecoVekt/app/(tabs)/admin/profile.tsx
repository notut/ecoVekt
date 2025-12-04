// app/(tabs)/admin/profile.tsx
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useAuthSession } from "@/providers/authctx";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { PieChart } from "react-native-chart-kit";

const auth = getAuth();
const db = getFirestore();

type TrashItemType = {
  id: string;
  weight: number;
  createdAt: any;
  type?: string;
};

export default function ProfilePage(): React.ReactElement {
  const { signOut } = useAuthSession();
  const router = useRouter();

  const [trashItems, setTrashItems] = useState<TrashItemType[]>([]);
  const [loading, setLoading] = useState(false);

  // chart data state PieChart
  const [chartData, setChartData] = useState<
    { name: string; population: number; color: string; legendFontColor: string; legendFontSize: number }[]
  >([]);

  // total for tooltip (for eks. restavfall)
  const [tooltipText, setTooltipText] = useState<string>("");

  // Valgt avfallstyper
  const [selectedWaste, setSelectedWaste] = useState<string[]>([]);

  // auth user
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  const generateColors = (n: number) => {
    const colors: string[] = [];
    const hueStep = Math.floor(360 / Math.max(1, n));
    for (let i = 0; i < n; i++) {
      const hue = (i * hueStep) % 360;
      colors.push(`hsl(${hue}deg 65% 45%)`);
    }
    return colors;
  };

  // Hent alle trash-items fra Firestore
  const getAllData = async (uid: string | null) => {
    setLoading(true);
    try {
      // hent yourTrash
      const yourTrashCol = collection(db, "yourTrash");
      let q;
      if (uid) {
        q = query(yourTrashCol, where("uid", "==", uid));
      } else {
        q = query(yourTrashCol);
      }
      const snap = await getDocs(q);

      const results: TrashItemType[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data() as any;
        results.push({
          id: docSnap.id,
          weight: Number(data.weight) || 0,
          createdAt: data.createdAt ?? null,
          type: typeof data.type === "string" ? data.type : undefined,
        });
      });

      setTrashItems(results);

      // Forbered data for PieChart
      const totals: Record<string, number> = {};
      results.forEach((r) => {
        const t = r.type ?? "Ukjent";
        totals[t] = (totals[t] || 0) + (r.weight || 0);
      });

      const types = Object.keys(totals).filter((k) => totals[k] > 0);
      if (types.length > 0) {
        const colors = generateColors(types.length);
        const arr = types.map((t, idx) => ({
          name: t,
          population: Number(totals[t]),
          color: colors[idx],
          legendFontColor: "#ffffff",
          legendFontSize: 12,
        }));
        setChartData(arr);

        // Sett tooltip-tekst for mest vanlige avfallstype
        const prefered = ["Restavfall", "Restavfall ", "restavfall", "Rest"];
        let chosen = types[0];
        for (const p of prefered) {
          if (types.includes(p)) {
            chosen = p;
            break;
          }
        }
        const totalChosen = totals[chosen] ?? 0;
        setTooltipText(`Du har de tre siste månedene kastet ${totalChosen} kg ${chosen.toLowerCase()}.`);
      } else {
        setChartData([]);
        setTooltipText("");
      }
    } catch (err) {
      console.error("Feil ved henting fra yourTrash:", err);
      setTrashItems([]);
      setChartData([]);
      setTooltipText("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
      getAllData(u ? u.uid : null);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hent selectedWaste fra users/{uid} når screen får fokus
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const fetchSelectedWaste = async () => {
        try {
          const user = currentUser;
          if (!user) {
            if (mounted) setSelectedWaste([]);
            return;
          }

          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);

          if (!mounted) return;
          if (userSnap.exists()) {
            const data = userSnap.data() as any;
            const arr = Array.isArray(data.selectedWaste) ? data.selectedWaste : [];
            setSelectedWaste(arr);
          } else {
            setSelectedWaste([]);
          }
        } catch (e) {
          console.error("Feil ved henting av selectedWaste ved fokus:", e);
        }
      };

      // kall både selectedWaste-henting og yourTrash-henting
      fetchSelectedWaste();
      getAllData(currentUser ? currentUser.uid : null);

      return () => {
        mounted = false;
      };
    }, [currentUser?.uid])
  );

  // Render hvert element
  const renderTrashItem = ({ item }: { item: TrashItemType }) => {
    const shortId = item.id ? item.id.slice(0, 8) : item.id;
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ID: {shortId}</Text>
        <Text style={styles.cardSub}>Vekt: {item.weight} kg</Text>
        {item.createdAt ? (
          <Text style={styles.cardDate}>
            Dato:{" "}
            {typeof item.createdAt?.toDate === "function"
              ? item.createdAt.toDate().toLocaleDateString()
              : String(item.createdAt)}
          </Text>
        ) : null}
        {item.type ? <Text style={styles.cardType}>Type: {item.type}</Text> : null}
      </View>
    );
  };

  const ItemSeparator = () => <View style={{ height: 8 }} />;

  // Chart dim
  const screenWidth = Dimensions.get("window").width - 48;

  // Logout handler: venter på signOut fra provider og navigerer til login
  const handleLogout = async () => {
    try {
      await signOut(); // provider gjør fbSignOut
      // send brukeren til login (tilpass sti hvis nødvendig)
      router.replace("/brukerregistrering/autentication");
    } catch (e) {
      console.error("Logout error:", e);
      // fallback: prøv likevel å navigere
      try {
        router.replace("/brukerregistrering/autentication");
      } catch {}
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.adminHeader}>
        <Text style={styles.adminHeaderText}>Administrator</Text>
      </View>

      <View style={styles.profileBox}>
        <Text style={styles.profileTitle}>Profil</Text>
        <View style={styles.profileInner}>
          <Text style={styles.profileText}>Bedrift:</Text>
          <Text style={styles.profileText}>Ansattnummer:</Text>
          <Text style={styles.profileText}>Email:</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Valgt avfall</Text>

      {!currentUser ? (
        <Text style={styles.hintText}>Logg inn for å se dine valgte avfallstyper</Text>
      ) : selectedWaste.length === 0 ? (
        <Text style={styles.hintText}>Ingen valgte avfallstyper. Legg til flere.</Text>
      ) : (
        <View style={styles.chipsWrap}>
          {selectedWaste.map((t) => (
            <View key={t} style={styles.chip}>
              <Text style={styles.chipText}>{t}</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable
        onPress={() => router.push("./addWaste")}
        style={styles.addMoreButton}
      >
        <Text style={styles.addMoreText}>Legg til mer</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>Total mengde avfall</Text>
      <Text style={styles.hintText}>Siste 4 uker</Text>

      <View style={{ alignItems: "center", marginBottom: 12 }}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator />
            <Text style={styles.hintText}>Laster diagram...</Text>
          </View>
        ) : chartData.length > 0 ? (
          <View style={{ width: screenWidth, alignItems: "center", justifyContent: "center" }}>
            <PieChart
              data={chartData}
              width={screenWidth - 40}
              height={220}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              absolute={false}
              chartConfig={{
                color: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0,0,0, ${opacity})`,
              }}
              hasLegend={false}
            />

            {tooltipText ? (
              <View style={styles.tooltipWrap}>
                <View style={styles.tooltipBox}>
                  <Text style={styles.tooltipText}>{tooltipText}</Text>
                </View>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={{ width: screenWidth - 40, height: 220, alignItems: "center", justifyContent: "center", backgroundColor: "#fff", borderRadius: 120 }}>
            <Text style={{ color: "#64748b" }}>{loading ? "Laster..." : "Ingen data for diagram"}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={trashItems}
        renderItem={renderTrashItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>{loading ? "Laster..." : "Ingen innleveringer."}</Text>
        )}
        contentContainerStyle={trashItems.length === 0 ? { flex: 1 } : undefined}
      />

      <View style={styles.logoutWrap}>
        <Pressable style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logg ut</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc", paddingHorizontal: 16, paddingTop: 8 },
  adminHeader: { backgroundColor: "#dbe7df", paddingVertical: 18, paddingHorizontal: 12, borderRadius: 6, marginBottom: 12 },
  adminHeaderText: { fontSize: 20, color: "#2f6f5b", fontWeight: "700" },

  profileBox: { backgroundColor: "white", padding: 14, borderRadius: 8, borderWidth: 1, borderColor: "#d1e4da", marginBottom: 14 },
  profileTitle: { color: "#0f172a", fontWeight: "700", marginBottom: 8 },
  profileInner: { borderWidth: 1, borderColor: "#c7e0d4", padding: 10, borderRadius: 8 },
  profileText: { color: "#334155", marginTop: 6 },

  sectionTitle: { color: "#0f172a", fontWeight: "700", marginBottom: 8, marginTop: 6 },
  hintText: { color: "#64748b", marginBottom: 12 },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", marginBottom: 18 },
  chip: { borderRadius: 20, borderWidth: 1, borderColor: "#2f6f5b", paddingVertical: 8, paddingHorizontal: 14, marginRight: 8, marginBottom: 8 },
  chipText: { color: "#14332a" },
  addMoreButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2f6f5b",
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  addMoreText: { color: "#2f6f5b", fontWeight: "600" },

  tooltipWrap: {
    position: "absolute",
    bottom: 48,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  tooltipBox: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  tooltipText: { color: "#0f172a", textAlign: "center" },

  card: { backgroundColor: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 12, marginBottom: 8 },
  cardTitle: { color: "#0f172a", fontWeight: "600" },
  cardSub: { color: "#334155", marginTop: 6 },
  cardDate: { color: "#64748b", fontSize: 12, marginTop: 6 },
  cardType: { color: "#334155", marginTop: 6 },

  emptyText: { color: "#cbd5e1", textAlign: "center", marginTop: 16 },

  logoutWrap: { marginTop: 12, alignItems: "center", marginBottom: 24 },
  button: { backgroundColor: "#ef4444", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 6 },
  buttonText: { color: "white", fontWeight: "600" },
  center: { alignItems: "center", justifyContent: "center" },
});
