import { colors } from "@/components/colors";
import { Header } from "@/components/header";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { router } from "expo-router";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TagsList from "../../components/TagsList";
import { auth, db } from "../../firebaseConfig";

interface TrashType {
  id: string;
  title: string;
}

export default function SetupBusiness() {
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [trashTypes, setTrashTypes] = useState<TrashType[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTrashTypes = async () => {
      try {
        const snapshot = await getDocs(collection(db, "trash"));
        const list: TrashType[] = [];

        snapshot.forEach((d) => {
          const data = d.data() as any;
          const title = data.title ?? data.name ?? String(d.id);

          list.push({ id: d.id, title: title });
        });

        list.sort((a, b) => a.title.localeCompare(b.title));

        setTrashTypes(list);
      } catch (error) {
        console.error("Error fetching trash types:", error);
        Alert.alert("Error", "Could not load trash types.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrashTypes();
  }, []);

  const toggleSelection = (title: string) => {
    setSelected((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const handleContinue = async () => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Feil", "Du må være logget inn for å lagre valget ditt.");
      return;
    }

    if (selected.length === 0) {
      Alert.alert("Info", "Vennligst velg minst én type avfall.");
      return;
    }

    setIsSaving(true);
    try {
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          selectedWaste: selected,
        },
        { merge: true }
      );

      router.replace("/(tabs)/chooseWaste");
    } catch (error) {
      console.error("Error saving selected waste types:", error);
      Alert.alert(
        "Feil",
        "Klarte ikke å lagre valget ditt. Vennligst prøv igjen."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    router.replace("/welcome");
  };

  if (!fontsLoaded || loading || isSaving) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.darkGreen} />
        <Text style={{ marginTop: 10, color: colors.darkGreen }}>
          {isSaving ? "Lagrer..." : "Laster inn..."}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Sett opp din bedrift"
        onBackPress={handleBack}
        containerStyle={{
          height: 80,
          overflow: "hidden",
          paddingLeft: 10,
          backgroundColor: colors.mainGreen,
        }}

        titleStyle={{
          fontSize: 20,
          color: colors.background,
          fontWeight: "600",
          fontFamily: "Poppins_600SemiBold",
        }}
      />

      <View style={styles.content}>
        <Text style={styles.title}>
          Velg hvilke typer avfall du bruker i din bedrift:
        </Text>

        <TagsList
          items={trashTypes}
          selectedItems={selected}
          onToggle={toggleSelection}
        />

        <Text style={styles.promptText}>Klar til å sette i gang?</Text>

        <TouchableOpacity style={styles.button} onPress={handleContinue}>
          <Text style={styles.buttonText}>Fortsett</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 25,
    marginBottom: 20,
    fontFamily: "Poppins_700Bold",
    textAlign: "left",
    color: colors.darkGreen,
  },
  promptText: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    color: colors.darkGreen,
    textAlign: "center",
    position: "absolute",
    bottom: 150,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  button: {
    position: "absolute",
    bottom: 90,
    alignSelf: "center",
    backgroundColor: colors.darkGreen,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
  },
});
