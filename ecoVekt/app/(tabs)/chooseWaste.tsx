import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { useRouter } from "expo-router";
import { db } from "../../firebaseConfig"; // sti fra app/(tabs)

type TrashType = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
};

const PRIMARY = "#6C8C76";
const TEXT_DARK = "#486258";
const BG = "#F5F5F5";

export default function ChooseWaste() {
  const [trashTypes, setTrashTypes] = useState<TrashType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchTrashTypes = async () => {
      try {
        // 👇 samme collection som SetupBusiness bruker
        const snapshot = await getDocs(collection(db, "trash"));
        const types: TrashType[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as Record<string, any>;
          types.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            imageUrl: data.imageUrl || data.imageurl || undefined,
          });
        });

        // optional: sortert etter numerisk id hvis dere bruker 1,2,3...
        types.sort((a, b) => Number(a.id) - Number(b.id));

        setTrashTypes(types);
      } catch (err) {
        console.error("Error fetching trash types:", err);
        setError("Kunne ikke hente avfallstyper. Sjekk Firestore eller nettverk.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrashTypes();
  }, []);

  const handleSelect = (item: TrashType) => {
    // 👇 Her "husker" vi hvilken avfallstype som er valgt
    // ved å sende den videre som route-param til registerWeight
    router.push({
      pathname: "/(tabs)/Registrer_vekt", // juster path hvis filen ligger et annet sted
      params: {
        trashId: item.id,
        trashTitle: item.title,
      },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Toppfelt – du kan bytte til samme header som i prototypen etterpå */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Velg avfall</Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {trashTypes.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => handleSelect(item)}
          >
            {item.imageUrl && (
              <View style={styles.iconBox}>
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.iconImage}
                  resizeMode="contain"
                />
              </View>
            )}

            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 40, // evt. SafeAreaView rundt hvis du vil være penere
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    // skygge som i prototypen
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: "#E7EFEA",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    overflow: "hidden",
  },
  iconImage: {
    width: "70%",
    height: "70%",
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    color: TEXT_DARK,
    fontWeight: "500",
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: "#6B7A75",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});