
//IMPORT - henter inn komponenter og verktøy
import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import { Header } from "@/components/header";
import { StepProgress } from "@/components/stepProgress";
import AsyncStorage from "@react-native-async-storage/async-storage";

//DESIGN - gjenbruk av farger fra prosjektet
const PRIMARY = "#6C8C76";
const TEXT_DARK = "#486258";
const BG = "#F5F5F5";

// Skjerm komponenten for registrering er vellykket. 
export default function SuccessfullyRegistered() {

// State håntering og navigasjon med steps.
  const router = useRouter();
  const [lastEntry, setLastEntry] = React.useState<any>(null);
  const steps = [{ id: 1 }, { id: 2 }, { id: 3 }];

  // Dataflyt fra local store til UI
  useEffect(() => {
    const loadLast = async () => {
      const raw = await AsyncStorage.getItem("lastWasteEntry");
      if (raw) setLastEntry(JSON.parse(raw));
    };
    loadLast();
  }, []);

   // renedering av UI for skjermen. 
  return (
    <View style={styles.root}>
 
 {/* Header komponent som vises øverst i UI */} 
<Header
  title="Registrering vellykket"
  onBackPress={() => {}}
  onProfilePress={() => {}}
  containerStyle={{ height: 80, justifyContent: "flex-start", overflow: "hidden", paddingLeft: 10,
}}

  titleStyle={{ 
    fontSize: 20,
    marginTop: 40,     
    textAlign: "left",  
    alignSelf: "flex-start", 
    color: "#FFFFFF",
    fontWeight: "600",
  }}
/>


 {/* Steg indikator 1, 2, og 3
      <View style={styles.stepWrapper}>
        <StepProgress steps={steps} currentStep={3} />
      </View>
*/}

{/* suksess meldin til bruker */}
      <View style={styles.content}>
        <Text style={styles.header}> Ditt avfallet er registrert!</Text>
        <Text style={styles.text}> Du kan gå til «Ditt avfall» for å se oversikten. </Text>

{/* sist registrerte avfalsboks, hentes fra localstore og vises i UI om data finnes */}
        {lastEntry && (
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}> Registrert avfall:</Text>
            <Text style={styles.infoTitle}>
              {lastEntry.wasteTitle} - {lastEntry.weightKg} kg
            </Text>
          </View>
        )}

{/* Navigasjons knapper */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/(tabs)/yourTrash")}
        >
          <Text style={styles.buttonText}> Ditt avfall</Text>
        </TouchableOpacity>

{/* Registrer mer avfall knapp */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#E8EEE9", borderWidth: 2, borderColor: PRIMARY }]}
          onPress={() => router.replace("/(tabs)/chooseWaste")}
        >
          <Text style={[styles.buttonText, { color: PRIMARY }]}> Registrer mer avfall</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/* Styling */
    const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    fontSize: 30,
    fontWeight: "700",
    color: TEXT_DARK,
    textAlign: "center",
    marginBottom: 200,
  },

  //BILDE AV LOGO I MIDTEN KANSKJE ? //

  text: {
    fontSize: 16,
    color: TEXT_DARK,
    textAlign: "center",
    marginBottom: 30,
  },
  infoBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    elevation: 2,
    width: "100%",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7A75",
    marginBottom: 2,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: TEXT_DARK,
  },
  button: {
    width: "70%",
    backgroundColor: PRIMARY,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFF",
    textAlign: "center",
  },
  stepWrapper: {
    alignItems: "center",
    marginTop: 12,
    marginBottom: 20,
  },
});
