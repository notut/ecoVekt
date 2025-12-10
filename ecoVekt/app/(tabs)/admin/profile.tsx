import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
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
import Svg, { G, Path } from "react-native-svg";
import { colors } from "@/components/colors";

// Firebase-instanser (auth + firestore) 
const auth = getAuth();
const db = getFirestore();

// Type for ett avfalls-element 
type TrashItemType = {
  id: string;
  weight: number;
  createdAt: any;
  type?: string;
};

export default function ProfilePage(): React.ReactElement {
  const { signOut } = useAuthSession(); // logout-funksjon fra context
  const router = useRouter(); // navigator

  // Lokale state-variabler 
  const [trashItems, setTrashItems] = useState<TrashItemType[]>([]); // alle hentede elementer
  const [loading, setLoading] = useState(false); // loader for diagram / data
  const [chartData, setChartData] = useState<
    { name: string; population: number; color: string }[]
  >([]); // data til kake-diagrammet
  const [tooltipText, setTooltipText] = useState<string>(""); // hjelpetekst (kan vises)
  const [selectedWaste, setSelectedWaste] = useState<string[]>([]); // brukervalgt avfallstyper
  const [selectedSlice, setSelectedSlice] = useState<{ name: string; value: number } | null>(null); // valgt slice i diagram
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser); // aktiv bruker

  // Fargepalett for diagrammet 
  const hexPalette = [
    "#6B8F71",
    "#FFD400",
    "#3B82F6",
    "#10B981",
    "#D97706",
    "#9CA3AF",
    "#7C3AED",
    "#A0AEC0",
    "#E11D48",
    "#F59E0B",
    "#84CC16",
    "#06B6D4",
    "#8B5CF6",
    "#EF4444",
    "#F97316",
    "#34D399",
    "#60A5FA",
    "#F472B6",
    "#A78BFA",
    "#FDE68A",
  ];

  // Genererer n farger ved å sykle gjennom paletten 
  const generateColorsHex = (n: number) => {
    const out: string[] = [];
    for (let i = 0; i < n; i++) out.push(hexPalette[i % hexPalette.length]);
    return out;
  };

  // Lager SVG path for en sekt (arc) i et kakedigram 
  const createArcPath = (radius: number, startAngle: number, endAngle: number) => {
    const polar = (angle: number) => ({
      x: radius * Math.cos((angle * Math.PI) / 180),
      y: radius * Math.sin((angle * Math.PI) / 180),
    });
    const start = polar(startAngle);
    const end = polar(endAngle);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    return `M 0 0 L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
  };

  // Henter alle 'waste' dokumenter for gitt bruker og bygger chart-data 
  const getAllData = async (uid: string | null) => {
    setLoading(true); // vis loader
    try {
      if (!uid) {
        // hvis ingen bruker: nullstill states
        setTrashItems([]);
        setChartData([]);
        setTooltipText("");
        return;
      }

      // hent dokumenter fra 'waste' hvor userId === uid
      const wasteCol = collection(db, "waste");
      const q = query(wasteCol, where("userId", "==", uid));
      const snap = await getDocs(q);

      const results: TrashItemType[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data() as any;
        results.push({
          id: docSnap.id,
          weight: Number(d.amountKg ?? d.amount ?? d.weight ?? 0),
          createdAt: d.createdAt ?? d.savedAt ?? d.timestamp ?? null,
          type: typeof d.wasteTitle === "string"
            ? d.wasteTitle
            : typeof d.type === "string"
            ? d.type
            : typeof d.wasteName === "string"
            ? d.wasteName
            : "Ukjent",
        });
      });

      setTrashItems(results); // lagre alle elementer

      // summer vekt per type
      const totals: Record<string, number> = {};
      results.forEach((r) => {
        const t = r.type ?? "Ukjent";
        totals[t] = (totals[t] || 0) + (Number(r.weight) || 0);
      });

      // bygg chart-data fra totals
      const types = Object.keys(totals).filter((k) => totals[k] > 0);
      if (types.length > 0) {
        const colorsArr = generateColorsHex(types.length);
        const arr = types.map((t, i) => ({
          name: t,
          population: totals[t],
          color: colorsArr[i],
        }));
        setChartData(arr);
        // velg default slice (prøver "Restavfall" hvis tilgjengelig)
        const defaultPick = types.includes("Restavfall") ? "Restavfall" : types[0];
        const total = totals[defaultPick] ?? 0;
        setTooltipText(`Du har de tre siste månedene kastet ${total} kg ${defaultPick.toLowerCase()}.`);
      } else {
        // ingen data
        setChartData([]);
        setTooltipText("");
      }
    } catch (e) {
      console.error("Feil ved henting av waste:", e);
      // på feil: nullstill
      setTrashItems([]);
      setChartData([]);
      setTooltipText("");
    } finally {
      setLoading(false); // skjul loader
    }
  };

  // Henter brukerens valgte avfallstyper fra users/{uid}.selectedWaste 
  const fetchSelectedWaste = async () => {
    if (!currentUser) return setSelectedWaste([]); // hvis ingen bruker
    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const arr = userSnap.data().selectedWaste || [];
        setSelectedWaste(Array.isArray(arr) ? arr : []);
      } else {
        setSelectedWaste([]);
      }
    } catch (e) {
      console.error("Kunne ikke hente selectedWaste:", e);
    }
  };

  // Lytter på auth-staten og henter data når bruker endres 
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
      getAllData(u ? u.uid : null);
    });
    return () => unsub();
  }, []);

  // useFocusEffect hentes når screen får fokus (navigasjon) 
  useFocusEffect(
    useCallback(() => {
      fetchSelectedWaste();
      getAllData(currentUser?.uid ?? null);
    }, [currentUser?.uid])
  );

  // skjermbredde og radiuser for diagram 
  const screenWidth = Dimensions.get("window").width - 48;
  const radius = 90;

  // logout-funksjon som også navigerer til auth-side 
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      router.replace("/brukerregistrering/autentication");
    }
  };

  return (
    <View style={styles.container}>

      {/* EGEN HEADER - back-knapp navigerer til chooseWaste */}
      <View style={styles.header}>
        <Pressable style={styles.headerLeft} onPress={() => router.push("/(tabs)/chooseWaste")}>
           <Text style={styles.backText}>‹</Text>
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Administrator</Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      {/* Hoved-innhold i ScrollView */}
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Profil-boks */}
        <View style={styles.box}>
          <Text style={styles.boxTitle}>Profil</Text>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Bedrift:</Text>
            <Text style={styles.label}>Ansattnummer:</Text>
            <Text style={styles.label}>Email:</Text>
          </View>
        </View>

        {/* Valgt avfall */}
        <Text style={styles.sectionTitle}>Valgt avfall</Text>
        <View style={styles.chipRow}>
          {selectedWaste.length === 0 ? (
            <Text style={styles.hintText}>Ingen valgte avfallstyper</Text>
          ) : (
            selectedWaste.map((t) => (
              <View key={t} style={styles.chip}>
                <Text style={styles.chipText}>{t}</Text>
              </View>
            ))
          )}
        </View>

        {/* Link for å legge til flere avfallstyper */}
        <Pressable onPress={() => router.push("./addWaste")} style={styles.linkButton}>
          <Text style={styles.linkText}>Legg til mer</Text>
        </Pressable>

        {/* Diagramseksjon */}
        <Text style={styles.sectionTitle}>Total mengde avfall</Text>
        <Text style={styles.subText}>Siste 4 uker</Text>

        <View style={{ alignItems: "center", marginBottom: 20 }}>
          {loading ? (
            // loader mens vi venter på data
            <ActivityIndicator color={colors.mainGreen} />
          ) : chartData.length ? (
            // vis kakedigrammet hvis vi har data
            <View style={{ width: screenWidth, alignItems: "center" }}>
              <Svg width={screenWidth} height={radius * 2 + 20}>
                <G x={screenWidth / 2} y={radius + 10}>
                  {(() => {
                    const total = chartData.reduce((acc, c) => acc + c.population, 0);
                    let startAngle = -90;
                    return chartData.map((slice) => {
                      const angle = (slice.population / total) * 360;
                      const endAngle = startAngle + angle;
                      const d = createArcPath(radius, startAngle, endAngle);
                      const key = slice.name;
                      startAngle = endAngle;
                      return (
                        <Path
                          key={key}
                          d={d}
                          fill={slice.color}
                          stroke="#ffffff"
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

              {/* Tooltip for valgt sekt */}
              {selectedSlice ? (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>
                    Du har kastet {selectedSlice.value} kg {selectedSlice.name.toLowerCase()}.
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            // fallback når ingen data finnes
            <Text style={styles.noData}>Ingen data for diagram</Text>
          )}
        </View>

        {/* Logout-knapp */}
        <View style={styles.logoutWrap}>
          <Pressable
            style={[styles.logoutButton, { backgroundColor: colors.mainGreen }]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logg ut</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background 
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 18,
    paddingBottom: 20,
    paddingHorizontal: 14,
    backgroundColor: colors.mainGreen,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGreen,
  },
  headerLeft: {
    width: 48,
    justifyContent: "center",
  },
  backText: {
    fontSize: 28,
    color: colors.background, 
    fontWeight: "600",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.background, // tittel-farge
  },
  headerRight: {
    width: 48,
  },

  box: {
    backgroundColor: colors.textBox,
    padding: 16,
    margin: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDE7E2",
  },
  boxTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2F3E36",
    marginBottom: 8,
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
    marginHorizontal: 14,
    marginTop: 4,
  },
  subText: {
    color: "#6B7A75",
    marginHorizontal: 14,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginHorizontal: 14,
    marginBottom: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.mainGreen,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 22,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: "#2F3E36",
  },
  linkButton: {
    marginHorizontal: 14,
    marginBottom: 18,
  },
  linkText: {
    color: colors.darkGreen,
    textDecorationLine: "underline",
    fontSize: 15,
    fontWeight: "500",
  },
  tooltip: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  tooltipText: {
    color: "#2F3E36",
    textAlign: "center",
  },
  noData: {
    color: "#6B7A75",
  },
  logoutWrap: {
    marginTop: 8,
    marginBottom: 30,
    alignItems: "center",
  },
  logoutButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    width: "70%",
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  hintText: {
    color: "#64748b",
  },
});
