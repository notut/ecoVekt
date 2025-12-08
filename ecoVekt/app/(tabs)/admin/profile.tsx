import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
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
  const [chartData, setChartData] = useState<any[]>([]);
  const [tooltipText, setTooltipText] = useState<string>("");
  const [selectedWaste, setSelectedWaste] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  const generateColors = (n: number) => {
    const colors: string[] = [];
    const hueStep = Math.floor(360 / Math.max(1, n));
    for (let i = 0; i < n; i++) {
      const hue = (i * hueStep) % 360;
      colors.push(`hsl(${hue}deg 60% 45%)`);
    }
    return colors;
  };

  const getAllData = async (uid: string | null) => {
    setLoading(true);
    try {
      const yourTrashCol = collection(db, "yourTrash");
      const q = uid ? query(yourTrashCol, where("uid", "==", uid)) : query(yourTrashCol);
      const snap = await getDocs(q);

      const results: TrashItemType[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data() as any;
        results.push({
          id: docSnap.id,
          weight: d.weight || 0,
          createdAt: d.createdAt ?? null,
          type: d.type,
        });
      });

      setTrashItems(results);

      const totals: Record<string, number> = {};
      results.forEach((r) => {
        const t = r.type ?? "Ukjent";
        totals[t] = (totals[t] || 0) + r.weight;
      });

      const types = Object.keys(totals);
      if (types.length) {
        const colors = generateColors(types.length);
        const arr = types.map((t, i) => ({
          name: t,
          population: totals[t],
          color: colors[i],
          legendFontColor: "#ffffff",
          legendFontSize: 12,
        }));
        setChartData(arr);

        const defaultPick = types.includes("Restavfall") ? "Restavfall" : types[0];
        const total = totals[defaultPick] ?? 0;
        setTooltipText(`Du har de tre siste månedene kastet ${total} kg ${defaultPick.toLowerCase()}.`);
      } else {
        setChartData([]);
        setTooltipText("");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectedWaste = async () => {
    if (!currentUser) return setSelectedWaste([]);

    const userDocRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userDocRef);
    if (userSnap.exists()) {
      const arr = userSnap.data().selectedWaste || [];
      setSelectedWaste(arr);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
      getAllData(u ? u.uid : null);
    });
    return () => unsub();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSelectedWaste();
      getAllData(currentUser?.uid ?? null);
    }, [currentUser?.uid])
  );

  const screenWidth = Dimensions.get("window").width - 48;

  const handleLogout = async () => {
    await signOut();
    router.replace("/brukerregistrering/autentication");
  };

 
  return (
    <FlatList
      data={trashItems}
      keyExtractor={(i) => i.id}
      // ListHeaderComponent viser alt innholdet over listen (profil, chips, pie osv.)
      ListHeaderComponent={() => (
        <View style={{ paddingBottom: 16 }}>
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Administrator</Text>
          </View>

          {/* PROFILE BOX */}
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Profil</Text>
            <View style={styles.infoBox}>
              <Text style={styles.label}>Bedrift:</Text>
              <Text style={styles.label}>Ansattnummer:</Text>
              <Text style={styles.label}>Email:</Text>
            </View>
          </View>

          {/* SELECTED WASTE */}
          <Text style={styles.sectionTitle}>Valgt avfall</Text>
          <View style={styles.chipContainer}>
            {selectedWaste.map((t) => (
              <View key={t} style={styles.chip}>
                <Text style={styles.chipText}>{t}</Text>
              </View>
            ))}
          </View>

          <Pressable onPress={() => router.push("./addWaste")} style={styles.linkButton}>
            <Text style={styles.linkText}>Legg til mer</Text>
          </Pressable>

          {/* CHART */}
          <Text style={styles.sectionTitle}>Total mengde avfall</Text>
          <Text style={styles.subText}>Siste 4 uker</Text>

          <View style={{ alignItems: "center", marginBottom: 20 }}>
            {loading ? (
              <ActivityIndicator color="#6B8F71" />
            ) : chartData.length ? (
              <View style={{ width: screenWidth, alignItems: "center" }}>
                <PieChart
                  data={chartData}
                  width={screenWidth - 30}
                  height={230}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft={"20"}
                  hasLegend={false}
                  absolute={false}
                  chartConfig={{
                    color: () => `#000`,
                    labelColor: () => `#000`,
                  }}
                />

                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>{tooltipText}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noData}>Ingen data for diagram</Text>
            )}
          </View>

          {/* Litt padding mellom header og liste */}
          <View style={{ height: 8 }} />
        </View>
      )}

      // renderItem viser hvert trash-element (samme som før)
      renderItem={({ item }) => (
        <View style={styles.listCard}>
          <Text style={styles.listTitle}>ID: {item.id.slice(0, 8)}</Text>
          <Text style={styles.listText}>Vekt: {item.weight} kg</Text>
          {item.type && <Text style={styles.listText}>Type: {item.type}</Text>}
        </View>
      )}

      ListFooterComponent={() => (
        <View style={{ paddingTop: 20 }}>
          <Pressable onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logg ut</Text>
          </Pressable>
        </View>
      )}
      contentContainerStyle={{ paddingBottom: 80 }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F5",
    paddingHorizontal: 14,
  },

  header: {
    backgroundColor: "#7EA08F",
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 18,
  },
  headerTitle: {
    color: "#2F3E36",
    fontSize: 22,
    fontWeight: "700",
  },

  box: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDE7E2",
    marginBottom: 20,
  },
  boxTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2F3E36",
    marginBottom: 12,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: "#DDE7E2",
    padding: 12,
    borderRadius: 10,
  },
  label: {
    color: "#4A5C54",
    paddingVertical: 4,
  },

  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#2F3E36",
    marginBottom: 10,
  },
  subText: {
    color: "#6B7A75",
    marginBottom: 16,
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },

  chip: {
    borderWidth: 1,
    borderColor: "#5E7C6B",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 22,
  },
  chipText: {
    color: "#2F3E36",
  },

  linkButton: {
    marginBottom: 26,
  },
  linkText: {
    color: "#5E7C6B",
    textDecorationLine: "underline",
    fontSize: 15,
    fontWeight: "500",
  },

  tooltip: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    marginTop: -50,
  },
  tooltipText: {
    color: "#2F3E36",
    textAlign: "center",
    fontSize: 14,
    width: 230,
  },

  noData: {
    color: "#6B7A75",
  },

  listCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    borderColor: "#E5ECE9",
    borderWidth: 1,
    marginBottom: 12,
  },
  listTitle: {
    fontWeight: "600",
    color: "#2F3E36",
  },
  listText: {
    marginTop: 6,
    color: "#4A5C54",
  },

  logoutButton: {
    backgroundColor: "#6B8F71",
    paddingVertical: 14,
    marginTop: 20,
    borderRadius: 50,
    marginBottom: 40,
  },
  logoutText: {
    textAlign: "center",
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
