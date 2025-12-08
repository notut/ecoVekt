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
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";

import {
  getFirestore,
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  where,
} from "firebase/firestore";
import { useAuthSession } from "@/providers/authctx";


// Egendefinert Pie Chart via SVG
import Svg, { G, Path } from "react-native-svg";

// Firebase referanser
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

  //State-variabler
  const [trashItems, setTrashItems] = useState<TrashItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedWaste, setSelectedWaste] = useState<string[]>([]);
  const [selectedSlice, setSelectedSlice] = useState<{ name: string; value: number } | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  //Funksjon for å konvertere HSL til HEX (for støtte i react-native-svg)
  const hslToHex = (h: number, s: number, l: number) => {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const inner = Math.min(k - 3, 9 - k);
      const bounded = Math.max(-1, Math.min(inner, 1));
      const color = l - a * bounded;
      return Math.round(255 * color);
    };
    const toHex = (v: number) => v.toString(16).padStart(2, "0");
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
  };

  //Genererer unike farger i HEX-format
  const generateColors = (n: number) => {
    const colors: string[] = [];
    const step = Math.floor(360 / Math.max(1, n));
    for (let i = 0; i < n; i++) {
      const hue = (i * step) % 360;
      colors.push(hslToHex(hue, 65, 50));
    }
    return colors;
  };

  //Standard farger per type
  const defaultColors: Record<string, string> = {
    Restavfall: "#6B8F71",
    Plast: "#FFD400",
    Papir: "#3B82F6",
    Glass: "#10B981",
    Mat: "#D97706",
    Metall: "#9CA3AF",
    Elektronikk: "#7C3AED",
    Ukjent: "#A0AEC0",
  };

  const colorMapRef = React.useRef<Record<string, string>>({ ...defaultColors });

  //Henter avfallsdata fra Firestore
  const getAllData = async (uid: string | null) => {
    setLoading(true);
    try {
      //Henter alle dokumenter fra "waste" 
      const wasteCol = collection(db, "waste");
      const q = query(wasteCol, where("userId", "==", uid));
      const snap = await getDocs(q);

      const results: TrashItemType[] = [];

      snap.forEach((docSnap) => {
        const d = docSnap.data() as any;

        //Normaliserer feltnavn 
        const weight = Number(d.amountKg ?? d.amount ?? 0);
        const createdAt = d.createdAt ?? d.timestamp ?? null;
        const type = d.wasteTitle ?? d.type ?? d.wasteName ?? "Ukjent";

        results.push({
          id: docSnap.id,
          weight,
          createdAt,
          type,
        });
      });

      setTrashItems(results);

      //Summerer vekt per avfallstype
      const totals: Record<string, number> = {};
      results.forEach((entry) => {
        const t = entry.type ?? "Ukjent";
        totals[t] = (totals[t] || 0) + entry.weight;
      });

      const types = Object.keys(totals);

      if (types.length > 0) {
        //Tildeler farger til nye typer som ikke finnes fra før
        const missing = types.filter((t) => !colorMapRef.current[t]);

        if (missing.length) {
          const newColors = generateColors(missing.length);
          missing.forEach((t, i) => (colorMapRef.current[t] = newColors[i]));
        }

        //Klargjør chartData for pie-chart
        const arr = types.map((t) => ({
          name: t,
          population: totals[t],
          color: colorMapRef.current[t],
        }));

        setChartData(arr);
      } else {
        setChartData([]);
      }
    } catch (e) {
      console.error("Feil ved henting av data:", e);
    } finally {
      setLoading(false);
    }
  };

  //Henter brukerens valgte avfallstyper
  const fetchSelectedWaste = async () => {
    if (!currentUser) return;
    try {
      const userDoc = doc(db, "users", currentUser.uid);
      const snap = await getDoc(userDoc);
      if (snap.exists()) {
        setSelectedWaste(snap.data().selectedWaste || []);
      }
    } catch (e) {
      console.error("Kunne ikke hente brukerdata:", e);
    }
  };

  //Lytt etter innlogging og last data
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
      getAllData(u ? u.uid : null);
    });
    return () => unsub();
  }, []);

  //Oppdater når siden fokuseres
  useFocusEffect(
    useCallback(() => {
      fetchSelectedWaste();
      getAllData(currentUser?.uid ?? null);
    }, [currentUser?.uid])
  );

  // Bredde for diagram
  const screenWidth = Dimensions.get("window").width - 48;

  //Lager path til en pie-slice
  const createArcPath = (radius: number, start: number, end: number) => {
    const polar = (angle: number) => ({
      x: radius * Math.cos((angle * Math.PI) / 180),
      y: radius * Math.sin((angle * Math.PI) / 180),
    });

    const startP = polar(start);
    const endP = polar(end);
    const largeArc = end - start > 180 ? 1 : 0;

    return `M 0 0 L ${startP.x} ${startP.y} A ${radius} ${radius} 0 ${largeArc} 1 ${endP.x} ${endP.y} Z`;
  };

  //Logg ut
  const handleLogout = async () => {
    await signOut();
    router.replace("/brukerregistrering/autentication");
  };


  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Administrator</Text>
      </View>

      {/* PROFIL */}
      <View style={styles.box}>
        <Text style={styles.boxTitle}>Profil</Text>
        <View style={styles.infoBox}>
          <Text style={styles.label}>Bedrift:</Text>
          <Text style={styles.label}>Ansattnummer:</Text>
          <Text style={styles.label}>Email:</Text>
        </View>
      </View>

      {/* VALGT AVFALL */}
      <Text style={styles.sectionTitle}>Valgt avfall</Text>
      <View style={styles.chipContainer}>
        {selectedWaste.map((t) => (
          <View key={t} style={styles.chip}>
            <Text style={styles.chipText}>{t}</Text>
          </View>
        ))}
      </View>

      {/* LEGG TIL MER */}
      <Pressable onPress={() => router.push("./addWaste")} style={styles.linkButton}>
        <Text style={styles.linkText}>Legg til mer</Text>
      </Pressable>

      {/* DIAGRAM */}
      <Text style={styles.sectionTitle}>Total mengde avfall</Text>
      <Text style={styles.subText}>Siste 4 uker</Text>

      <View style={{ alignItems: "center", marginBottom: 20 }}>
        {loading ? (
          <ActivityIndicator color="#6B8F71" />
        ) : chartData.length ? (
          <View>

            {/* PIE CHART (SVG) */}
            <Svg width={screenWidth} height={230}>
              <G x={screenWidth / 2} y={115}>
                {(() => {
                  const radius = 90;
                  const total = chartData.reduce((acc, c) => acc + c.population, 0);
                  let startAngle = -90;

                  return chartData.map((slice) => {
                    const value = slice.population;
                    const angle = (value / total) * 360;
                    const endAngle = startAngle + angle;

                    const d = createArcPath(radius, startAngle, endAngle);

                    startAngle = endAngle;

                    return (
                      <Path
                        key={slice.name}
                        d={d}
                        fill={slice.color}
                        stroke="#fff"
                        strokeWidth={1}
                        onPress={() =>
                          setSelectedSlice(
                            selectedSlice?.name === slice.name
                              ? null
                              : { name: slice.name, value: slice.population }
                          )
                        }
                      />
                    );
                  });
                })()}
              </G>
            </Svg>

            {/* TOOLTIP - vises kun ved trykk */}
            {selectedSlice && (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>
                  Du har kastet {selectedSlice.value} kg {selectedSlice.name.toLowerCase()}.
                </Text>
              </View>
            )}

          </View>
        ) : (
          <Text style={styles.noData}>Ingen data for diagram</Text>
        )}
      </View>

      {/* LISTE MED ALLE REGISTRERINGER */}
      <FlatList
        data={trashItems}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.listCard}>
            <Text style={styles.listTitle}>ID: {item.id.slice(0, 8)}</Text>
            <Text style={styles.listText}>Vekt: {item.weight} kg</Text>
            <Text style={styles.listText}>Type: {item.type}</Text>
          </View>
        )}
      />

      {/* LOGG UT */}
      <Pressable onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logg ut</Text>
      </Pressable>
    </View>
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
    alignSelf: "center",
    marginTop: -40,
  },

  tooltipText: {
    color: "#2F3E36",
    textAlign: "center",
    fontSize: 14,
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
