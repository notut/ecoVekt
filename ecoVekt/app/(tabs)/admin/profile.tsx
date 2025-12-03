import React, { useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, FlatList, Dimensions } from "react-native";
import { Link, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

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
      // hent selectedWaste hvis uid finnes
      if (uid) {
        try {
          const userDocRef = doc(db, "users", uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as any;
            const arr = Array.isArray(data.selectedWaste) ? data.selectedWaste : [];
            setSelectedWaste(arr);
          } else {
            setSelectedWaste([]);
          }
        } catch (e) {
          console.error("Feil ved henting av selectedWaste:", e);
          setSelectedWaste([]);
        }
      } else {
        setSelectedWaste([]);
      }

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
      setSelectedWaste([]);
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
  }, []);

  // Kjør når screen får fokus
  useFocusEffect(
    useCallback(() => {
      getAllData(currentUser ? currentUser.uid : null);
    }, [currentUser?.uid])
  );

  // Render hvert element
  const renderTrashItem = ({ item }: { item: TrashItemType }) => {
    const shortId = item.id ? item.id.slice(0, 8) : item.id;
    return (
      <View style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: 12, borderRadius: 12 }}>
        <Text style={{ color: "#0f172a", fontWeight: "600" }}>ID: {shortId}</Text>
        <Text style={{ color: "#334155", marginTop: 6 }}>Vekt: {item.weight} kg</Text>
        {item.createdAt ? (
          <Text style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>
            Dato:{" "}
            {typeof item.createdAt?.toDate === "function" ? item.createdAt.toDate().toLocaleDateString() : String(item.createdAt)}
          </Text>
        ) : null}
      </View>
    );
  };

  const ItemSeparator = () => <View style={{ height: 8 }} />;

  // Chart dim
  const screenWidth = Dimensions.get("window").width - 48;

  return (
    <View style={{ flex: 1, backgroundColor: "#f8fafc", paddingHorizontal: 16, paddingTop: 8 }}>
      <View style={{ backgroundColor: "#dbe7df", paddingVertical: 18, paddingHorizontal: 12, borderRadius: 6, marginBottom: 12 }}>
        <Text style={{ fontSize: 20, color: "#2f6f5b", fontWeight: "700" }}>Administrator</Text>
      </View>

   // Profil informasjon
      <View style={{ backgroundColor: "white", padding: 14, borderRadius: 8, borderWidth: 1, borderColor: "#d1e4da", marginBottom: 14 }}>
        <Text style={{ color: "#0f172a", fontWeight: "700", marginBottom: 8 }}>Profil</Text>
        <View style={{ borderWidth: 1, borderColor: "#c7e0d4", padding: 10, borderRadius: 8 }}>
          <Text style={{ color: "#334155" }}>Bedrift:</Text>
          <Text style={{ color: "#334155", marginTop: 6 }}>Ansattnummer:</Text>
          <Text style={{ color: "#334155", marginTop: 6 }}>Email:</Text>
        </View>
      </View>

  // Valgt avfallstyper
      <Text style={{ color: "#0f172a", fontWeight: "700", marginBottom: 8 }}>Valgt avfall</Text>
      {!currentUser ? (
        <Text style={{ color: "#64748b", marginBottom: 12 }}>Logg inn for å se dine valgte avfallstyper</Text>
      ) : selectedWaste.length === 0 ? (
        <Text style={{ color: "#64748b", marginBottom: 12 }}>Ingen valgte avfallstyper. Legg til flere.</Text>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 18 }}>
          {selectedWaste.map((t) => (
            <View
              key={t}
              style={{
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "#2f6f5b",
                paddingVertical: 8,
                paddingHorizontal: 14,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "#14332a" }}>{t}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={{ color: "#0f172a", fontWeight: "700", marginBottom: 8 }}>Total mengde avfall</Text>
      <Text style={{ color: "#64748b", marginBottom: 8 }}>Siste 4 uker</Text>

      <View style={{ alignItems: "center", marginBottom: 12 }}>

        {chartData.length > 0 ? (
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
              <View
                style={{
                  position: "absolute",
                  bottom: 48,
                  left: (screenWidth - (screenWidth - 40)) / 2 + 16,
                  right: (screenWidth - (screenWidth - 40)) / 2 + 16,
                  alignItems: "center",
                }}
              >
                <View style={{ backgroundColor: "rgba(255,255,255,0.95)", padding: 12, borderRadius: 8, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6 }}>
                  <Text style={{ color: "#0f172a", textAlign: "center" }}>{tooltipText}</Text>
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

        // Liste over innleveringer
      <FlatList
        data={trashItems}
        renderItem={renderTrashItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={() => (
          <Text style={{ color: "#cbd5e1", textAlign: "center", marginTop: 16 }}>{loading ? "Laster..." : "Ingen innleveringer."}</Text>
        )}
        contentContainerStyle={trashItems.length === 0 ? { flex: 1 } : undefined}
      />

        // Logg ut knapp
      <View style={{ alignItems: "center", marginTop: 10, marginBottom: 30 }}>
        <Pressable
          onPress={async () => {
            router.replace("/brukerregistrering/login");
          }}
          style={{ backgroundColor: "#2f6f5b", paddingVertical: 10, paddingHorizontal: 30, borderRadius: 20 }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>Logg ut</Text>
        </Pressable>
      </View>
    </View>
  );
}
