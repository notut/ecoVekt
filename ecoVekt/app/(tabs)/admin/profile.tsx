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
  const [trashItems, setTrashItems] = useState<TrashItemType[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<
    { name: string; population: number; color: string }[]
  >([]);
  const [tooltipText, setTooltipText] = useState<string>("");
  const [selectedWaste, setSelectedWaste] = useState<string[]>([]);
  const [selectedSlice, setSelectedSlice] = useState<{ name: string; value: number } | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [profile, setProfile] = useState<{
    fullName?: string;
    companyName?: string;
    employeeNumber?: string;
    email?: string;
  } | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // basert på norske sorteringsfarger 
  const wasteColorMap: Record<string, string> = {
    mat: "#01A04C",            
    plast: "#921E80",        
    papir: "#0082BE",         
    glass: "#01C3A7",         
    metall: "#5A6E77",       
    farlig: "#E11D48",       
    rest: "#2E2E2E",          

    tekstil: "#A78BFA",        
    trevirke: "#A0703A",     
    porselen: "#8B8F90",       
    gips: "#6B7A75",
    isolasjon: "#6B8F71",
    glassMetall: "#01C3A7",
    isopor: "#921E80",
    elektronikk: "#fba910",
    batteri: "#E11D48",
    lyspærer: "#E11D48",
    medisinsk: "#ede900",
    radioaktivt: "#f7ff04",
    gummi: "#6B7A75",
    hageavfall: "#01A04C",
    matavfall: "#01A04C",
    restavfall: "#2E2E2E",

    default: colors.mainGreen,
  };

  const colorForWasteType = (type?: string | null): string => {
    if (!type) return wasteColorMap["rest"];
    const t = type.toLowerCase().trim();

    switch (t) {
      case "batteri": return wasteColorMap["batteri"];
      case "elektronikk": return wasteColorMap["elektronikk"];
      case "farlig avfall": return wasteColorMap["farlig"];
      case "gips": return wasteColorMap["gips"];
      case "glass og metall": return wasteColorMap["glassMetall"];
      case "gummi": return wasteColorMap["gummi"];
      case "hageavfall": return wasteColorMap["hageavfall"];
      case "isolasjon": return wasteColorMap["isolasjon"];
      case "isopor": return wasteColorMap["isopor"];
      case "klær og tekstil": return wasteColorMap["tekstil"];
      case "lyspærer og lysrør": return wasteColorMap["lyspærer"];
      case "matavfall": return wasteColorMap["matavfall"];
      case "medisinsk avfall": return wasteColorMap["medisinsk"];
      case "papp og papir": return wasteColorMap["papir"];
      case "plastemballasje": return wasteColorMap["plast"];
      case "porselen og keramikk": return wasteColorMap["porselen"];
      case "radioaktivt avfall": return wasteColorMap["radioaktivt"];
      case "restavfall": return wasteColorMap["restavfall"];
      case "trevirke": return wasteColorMap["trevirke"];
    }

    if (t.includes("mat") || t.includes("bio") || t.includes("organisk")) return wasteColorMap["mat"];
    if (t.includes("plast") || t.includes("isopor")) return wasteColorMap["plast"];
    if (t.includes("papir") || t.includes("papp") || t.includes("kartong")) return wasteColorMap["papir"];
    if (t.includes("glass")) return wasteColorMap["glass"];
    if (t.includes("metall") || t.includes("metal")) return wasteColorMap["metall"];
    if (
      t.includes("farlig") ||
      t.includes("kjemisk") ||
      t.includes("batteri") ||
      t.includes("elektronikk") ||
      t.includes("lyspære")
    ) return wasteColorMap["farlig"];
    if (t.includes("tekstil") || t.includes("klær")) return wasteColorMap["tekstil"];
    if (t.includes("tre") || t.includes("virke")) return wasteColorMap["trevirke"];
    if (t.includes("porsel") || t.includes("keramikk")) return wasteColorMap["porselen"];
    if (t.includes("hage")) return wasteColorMap["hageavfall"];
    if (t.includes("medisinsk")) return wasteColorMap["medisinsk"];
    if (t.includes("radio")) return wasteColorMap["radioaktivt"];

    return wasteColorMap["default"];
  };

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

  const getAllData = async (uid: string | null) => {
    setLoading(true);
    try {
      if (!uid) {
        setTrashItems([]);
        setChartData([]);
        setTooltipText("");
        return;
      }

      const wasteCol = collection(db, "waste");
      const q = query(wasteCol, where("userId", "==", uid));
      const snap = await getDocs(q);

      const results: TrashItemType[] = [];
      snap.forEach((docSnap) => {
        const d = docSnap.data() as any;
        const weight = Number(d.amountKg ?? d.amount ?? d.weight ?? 0);

        let createdAt: any = null;
        if (d.timestamp && typeof d.timestamp.toDate === "function") {
          createdAt = d.timestamp.toDate();
        } else if (d.savedAt && typeof d.savedAt === "string") {
          createdAt = new Date(d.savedAt);
        } else {
          createdAt = d.createdAt ?? null;
        }

        const type =
          typeof d.wasteTitle === "string"
            ? d.wasteTitle
            : typeof d.type === "string"
            ? d.type
            : typeof d.wasteName === "string"
            ? d.wasteName
            : "Ukjent";

        results.push({
          id: docSnap.id,
          weight,
          createdAt,
          type,
        });
      });

      setTrashItems(results);

      const totals: Record<string, number> = {};
      results.forEach((r) => {
        const t = r.type ?? "Ukjent";
        totals[t] = (totals[t] || 0) + (Number(r.weight) || 0);
      });

      const types = Object.keys(totals).filter((k) => totals[k] > 0);
      if (types.length > 0) {
        const arr = types.map((t) => ({
          name: t,
          population: totals[t],
          color: colorForWasteType(t),
        }));
        setChartData(arr);

        const defaultPick = types.includes("Restavfall") ? "Restavfall" : types[0];
        const total = totals[defaultPick] ?? 0;
        setTooltipText(
          `Du har de tre siste månedene kastet ${total} kg ${defaultPick.toLowerCase()}.`
        );
      } else {
        setChartData([]);
        setTooltipText("");
      }
    } catch (e) {
      console.error("Feil ved henting av waste:", e);
      setTrashItems([]);
      setChartData([]);
      setTooltipText("");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (uid?: string | null) => {
    if (!uid) {
      setProfile(null);
      setProfileError("Ingen bruker logget inn.");
      return;
    }

    setProfileLoading(true);
    setProfileError(null);

    try {
      const userDocRef = doc(db, "users", uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const data = userSnap.data() as any;
        setProfile({
          fullName: data.name ?? data.fullName ?? "",
          companyName: data.companyName ?? data.company ?? "",
          employeeNumber: data.employeeNumber ?? data.employeeNr ?? "",
          email: data.email ?? auth.currentUser?.email ?? "",
        });
      } else {
        setProfile({
          fullName: "",
          companyName: "",
          employeeNumber: "",
          email: auth.currentUser?.email ?? "",
        });
      }
    } catch (e) {
      console.error("Kunne ikke hente brukerprofil:", e);
      setProfileError("Feil ved henting av profil.");
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchSelectedWaste = async () => {
    if (!currentUser) return setSelectedWaste([]);
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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
      getAllData(u ? u.uid : null);
      fetchUserProfile(u ? u.uid : null);
    });
    return () => unsub();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSelectedWaste();
      getAllData(currentUser?.uid ?? null);
      fetchUserProfile(currentUser?.uid ?? null);
    }, [currentUser?.uid])
  );

  const screenWidth = Dimensions.get("window").width - 48;
  const radius = 90;

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
      {/* Header */}
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
        <View style={[styles.box, { borderColor: colors.textBox, backgroundColor: colors.background }]}>
          <Text style={styles.boxTitle}>Din profil</Text>

          <View style={[styles.infoBox, { borderColor: colors.darkGreen, backgroundColor: colors.background }]}>
            {profileLoading ? (
              <ActivityIndicator color={colors.mainGreen} />
            ) : profileError ? (
              <Text style={{ color: "red" }}>{profileError}</Text>
            ) : profile ? (
              <>
                <View style={styles.row}>
                  <Text style={styles.labelBold}>Navn: </Text>
                  <Text style={styles.valueText}>{profile.fullName || "Ikke satt"}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.labelBold}>Firma: </Text>
                  <Text style={styles.valueText}>{profile.companyName || "Ikke satt"}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.labelBold}>Ansatt-ID: </Text>
                  <Text style={styles.valueText}>{profile.employeeNumber || "Ikke satt"}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.labelBold}>E-post: </Text>
                  <Text style={styles.valueText}>{profile.email || "Ikke satt"}</Text>
                </View>
              </>
            ) : (
              <Text>Ingen profildata tilgjengelig.</Text>
            )}
          </View>
        </View>

        {/* Valgt avfall */}
        <Text style={styles.sectionTitle}>Valgt avfall</Text>
        <View style={styles.chipRow}>
          {selectedWaste.length === 0 ? (
            <Text style={styles.hintText}>Ingen valgte avfallstyper</Text>
          ) : (
            selectedWaste.map((t) => (
              <View key={t} style={[styles.chip, { borderColor: colors.mainGreen }]}>
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
            <ActivityIndicator color={colors.mainGreen} />
          ) : chartData.length ? (
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

              {selectedSlice ? (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>
                    Du har kastet {selectedSlice.value} kg {selectedSlice.name.toLowerCase()}.
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
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
    fontSize: 35,
    fontWeight: "700",
    color: colors.background, 
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
    marginBottom: 10,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: "#DDE7E2",
    padding: 12,
    borderRadius: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  labelBold: {
    fontWeight: "700",
    color: colors.text,
  },
  valueText: {
    fontWeight: "400",
    color: colors.text,
  },

  label: {
    color: colors.text,
    paddingVertical: 4,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 16,
    color: "#2F3E36",
    marginHorizontal: 35,
    marginTop: 4,
    marginBottom: 12,
  },
  subText: {
    color: "#6B7A75",
    marginHorizontal: 35,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginHorizontal: 35,
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
    marginHorizontal: 35,
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
