import React, { useState, useCallback, useEffect } from "react";
import { View, Text, Pressable, FlatList, Dimensions } from "react-native";
import { Link, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
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

// Pie Chart
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

  // Local auth state 
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [userNameSession, setUserNameSession] = useState<string | null>(
    user ? user.displayName || user.email : null
  );

  const [trashItems, setTrashItems] = useState<TrashItemType[]>([]);
  const [loading, setLoading] = useState(false);

  // Chart data state PieChart
  const [chartData, setChartData] = useState<
    {
      name: string;
      population: number;
      color: string;
      legendFontColor: string;
      legendFontSize: number;
    }[]
  >([]);

  // Lytt på auth state endringer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setUserNameSession(u ? u.displayName || u.email : null);
    });
    return () => unsubscribe();
  }, []);

  // Farger generator for pie chart
  const generateColors = (n: number) => {
    const colors: string[] = [];
    const hueStep = Math.floor(360 / Math.max(1, n));
    for (let i = 0; i < n; i++) {
      const hue = (i * hueStep) % 360;
      colors.push(`hsl(${hue}deg 70% 55%)`);
    }
    return colors;
  };

  //hent brukerens kastede elementer fra Firestore
  const getMyTrash = async () => {
    if (!user) {
      setTrashItems([]);
      setChartData([]);
      return;
    }

    setLoading(true);
    try {
      const yourTrashCol = collection(db, "yourTrash");

      // Hent alle dokumenter hvor uid == innlogget bruker
      const q = query(yourTrashCol, where("uid", "==", user.uid));
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

      // Sett liste i state
      setTrashItems(results);

      // Lag chart data hvis noen elementer har `type`
      // Beregn totalsum per type
      const totals: Record<string, number> = {};
      let anyType = false;
      results.forEach((r) => {
        if (r.type) {
          anyType = true;
          totals[r.type] = (totals[r.type] || 0) + (r.weight || 0);
        }
      });

      if (anyType) {
        const types = Object.keys(totals).filter((k) => totals[k] > 0);
        const colors = generateColors(types.length);
        const arr = types.map((t, idx) => ({
          name: t,
          population: Number(totals[t]),
          color: colors[idx],
          legendFontColor: "#ffffff",
          legendFontSize: 12,
        }));
        setChartData(arr);
      } else {
        // Hvis ingen type-data finnes, tøm chartData 
        setChartData([]);
      }
    } catch (err) {
      console.error("Feil ved henting fra yourTrash:", err);
      setTrashItems([]);
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  // Kjører når screen får fokus og når user endres
  useFocusEffect(
    useCallback(() => {
      getMyTrash();
    }, [user?.uid])
  );

  // Render-funksjon for hvert element,  viser id, weight og dato
  const renderTrashItem = ({ item }: { item: TrashItemType }) => {
  
    const shortId = item.id ? item.id.slice(0, 8) : item.id;
    return (
      <View className="bg-white/5 p-4 rounded-xl">
        <Text className="text-white font-semibold">ID: {shortId}</Text>
        <Text className="text-gray-300 mt-1">Vekt: {item.weight} kg</Text>
        {item.createdAt ? (
          <Text className="text-gray-400 text-xs mt-1">
            Dato:{" "}
            {typeof item.createdAt.toDate === "function"
              ? item.createdAt.toDate().toLocaleString()
              : String(item.createdAt)}
          </Text>
        ) : null}
        {item.type ? (
          <Text className="text-gray-300 text-sm mt-1">Type: {item.type}</Text>
        ) : null}
      </View>
    );
  };

  const ItemSeparator = () => <View style={{ height: 8 }} />;

  // Chart dimensions
  const screenWidth = Dimensions.get("window").width - 48; // padding px-6 begge sider

  return (
    <View className="flex-1 bg-slate-700 px-6 py-4">
      <Text className="text-white text-2xl font-semibold mb-4">
        Hei {userNameSession ?? "gjest"}!
      </Text>

      // henter pie-chart for vektfordeling per type
      <View style={{ marginBottom: 16 }}>
        <Text className="text-white text-lg font-semibold mb-2">
          Vektfordeling per type
        </Text>

        {loading ? (
          <Text className="text-gray-300">Laster diagram...</Text>
        ) : chartData.length > 0 ? (
          <PieChart
            data={chartData}
            width={screenWidth}
            height={220}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute={false}
            chartConfig={{
              color: (opacity = 1) => `rgba(255,255,255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255,255,255, ${opacity})`,
            }}
            hasLegend={true}
          />
        ) : (
          <Text className="text-gray-300">
            {trashItems.length === 0
              ? loading
                ? "Laster..."
                : "Ingen innleveringer funnet."
              : "Ingen type-data tilgjengelig for pie-chart."}
          </Text>
        )}
      </View>

        // liste over innleveringer
        
      <Text className="text-white text-lg font-semibold mb-2">Dine innleveringer</Text>

      <FlatList
        data={trashItems}
        renderItem={renderTrashItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={ItemSeparator}
        ListEmptyComponent={() => (
          <Text className="text-gray-300 text-center mt-4">
            {loading ? "Laster..." : "Du har ingen innleveringer."}
          </Text>
        )}
        contentContainerStyle={trashItems.length === 0 ? { flex: 1 } : undefined}
      />

      // logg ut
      {user ? (
        <Pressable
          onPress={async () => {
            await auth.signOut();
        
            router.replace("/logIn");
          }}
          className="bg-red-500 px-6 py-3 rounded-xl shadow-md mt-4"
        >
          <Text className="text-white text-lg font-semibold">Logg ut</Text>
        </Pressable>
      ) : (
        <Link href="/logIn" asChild>
          <Pressable className="bg-blue-600 px-6 py-3 rounded-xl shadow-md mt-4">
            <Text className="text-white text-lg font-semibold">Logg inn</Text>
          </Pressable>
        </Link>
      )}
    </View>
  );
}
