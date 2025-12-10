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
//import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/components/colors";

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
    const colorsArr: string[] = [];
    const hueStep = Math.floor(360 / Math.max(1, n));
    for (let i = 0; i < n; i++) {
      const hue = (i * hueStep) % 360;
      colorsArr.push(`hsl(${hue}deg 60% 45%)`);
    }
    return colorsArr;
  };

  const getAllData = async (uid: string | null) => {
    setLoading(true);
    try {
      const yourTrashCol = collection(db, "yourTrash");
      const q = uid
        ? query(yourTrashCol, where("uid", "==", uid))
        : query(yourTrashCol);
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
        const generated = generateColors(types.length);
        const arr = types.map((t, i) => ({
          name: t,
          population: totals[t],
          color: generated[i],
          legendFontColor: "#ffffff",
          legendFontSize: 12,
        }));
        setChartData(arr);

        const defaultPick = types.includes("Restavfall")
          ? "Restavfall"
          : types[0];
        const total = totals[defaultPick] ?? 0;
        setTooltipText(
          `Du har de tre siste månedene kastet ${total} kg ${defaultPick.toLowerCase()}.`
        );
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
          {/* HEADER — erstattet med SafeAreaView for å dekke hele toppen */}
          <View style={styles.headerFull}>
            <View style={styles.headerInner}>
              {/* valgfri back-knapp (fjern hvis du ikke ønsker den) */}
              <Pressable
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Text style={styles.backIcon}>‹</Text>
              </Pressable>

              <Text style={styles.headerTitle}>Administrator</Text>

              {/* høyre side er tom (ingen profil-ikon) */}
              <View style={styles.headerRight} />
            </View>
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

          <Pressable
            onPress={() => router.push("./addWaste")}
            style={styles.linkButton}
          >
            <Text style={styles.linkText}>Legg til mer</Text>
          </Pressable>

          {/* CHART */}
          <Text style={styles.sectionTitle}>Total mengde avfall</Text>
          <Text style={styles.subText}>Siste 4 uker</Text>

          <View style={{ alignItems: "center", marginBottom: 20 }}>
            {loading ? (
              <ActivityIndicator color={colors.mainGreen} />
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
      // renderItem viser hvert trash-element
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
    backgroundColor: colors.background,
    paddingHorizontal: 14,
  },
  headerFull: {
    width: "100%",
    backgroundColor: colors.mainGreen,
  },
  headerInner: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  backButton: {
    position: "absolute",
    left: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  backIcon: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "600",
  },
  headerRight: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    width: 28,
  },

  header: {
    backgroundColor: colors.lightGreen,
    paddingVertical: 22,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 18,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },

  box: {
    backgroundColor: colors.textBox,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDE7E2",
    marginBottom: 20,
  },
  boxTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: "#DDE7E2",
    padding: 12,
    borderRadius: 10,
  },
  label: {
    color: colors.text,
    paddingVertical: 4,
  },

  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#2F3E36",
    marginBottom: 10,
    marginLeft: "3%",
  },
  subText: {
    color: "#6B7A75",
    marginBottom: 16,
    marginLeft: "3%",
  },

  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
    marginLeft: "3%",
  },

  chip: {
    borderWidth: 1,
    borderColor: colors.mainGreen,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 22,
  },
  chipText: {
    color: "#2F3E36",
  },

  linkButton: {
    marginBottom: 26,
    marginLeft: "3%",
  },
  linkText: {
    color: colors.darkGreen,
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
    marginTop: -60,
  },
  tooltipText: {
    color: "#2F3E36",
    textAlign: "center",
    fontSize: 14,
    width: 250,
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
    color: colors.text,
  },

  logoutButton: {
    backgroundColor: colors.mainGreen,
    paddingVertical: 17,
    marginTop: 20,
    borderRadius: 20,
    marginBottom: 40,
    alignSelf: "center",
    width: "70%",
  },
  logoutText: {
    textAlign: "center",
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
