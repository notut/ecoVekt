//log weight siden som skal registrere avfall og vekt i firestore og localstorage

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

//picker komponent for nedtrekksmeny //
import { Picker } from "@react-native-picker/picker";

//local storage lagring
import AsyncStorage from "@react-native-async-storage/async-storage";

//firebase
import { db } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

//navigasjon
import { useRouter } from "expo-router";

// typeScript-type for hvilke avfallstyper som er lov 
type WasteType = "rest" | "paper" | "plastic" | "food" | "";

// komponenten
export default function LogWeight() {
  const router = useRouter();

  //Avfallstype som er valgt av bruker
  const [wasteType, setWasteType] = useState<WasteType>("");

  //vekten brukeren taster inn
  const [weight, setWeight] = useState<string>("");

  // Ikoner for hver avfalstype (SKAL BRUKES SENERE I APPEN)
  const iconMap: Record<WasteType, string> = {
    rest: "trash",
    paper: "paper",
    plastic: "bottle",
    food: "food",
    "": "",
  };

 //tekst som vises for brukeren
  const labelMap: Record<WasteType, string> = {
    rest: "Restavfall",
    paper: "Papp og papir",
    plastic: "Plastemballasje",
    food: "Mat",
    "": "",
  };

  // LAGRER registrering i firestore og localstore
  const handleSave = async () => {

    //validering
    if (!wasteType || !weight) {
      Alert.alert("Feil", "Du må fylle inn begge feltene.");
      return;
    }

    try {
      // Lagre til Firestore
      await addDoc(collection(db, "waste"), {
        type: labelMap[wasteType],
        icon: iconMap[wasteType],
        amount: Number(weight),
        timestamp: serverTimestamp(),
      });

      // Lagre til lokal storage
      await AsyncStorage.setItem(
        "lastWasteEntry",
        JSON.stringify({
          type: labelMap[wasteType],
          weight: weight,
          icon: iconMap[wasteType],
          savedAt: new Date().toISOString(),
        })
      );

      // Navigerr tl skuksess siden
      router.push("/successfullyRegistered");

    } catch (err) {
      console.log("🔥 Firestore error:", err);
      Alert.alert("Feil", "Kunne ikke lagre avfallet.");
    }
  };

  //her starter UI
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Registrer vekt</Text>

      {/* ---------------- STEPPER ---------------- */}
      <View style={styles.progressContainer}>
        <View style={styles.activeStep}><Text style={styles.stepNum}>01</Text></View>
        <Text style={styles.stepLabel}>Velg avfall</Text>
        <View style={styles.activeStep}><Text style={styles.stepNum}>02</Text></View>
        <Text style={styles.stepLabel}>Fyll inn vekt</Text>
        <View style={styles.inactiveStep}><Text style={styles.stepNum}>03</Text></View>
        <Text style={styles.stepLabel}>Registrer avfall</Text>
      </View>

      {/*avfalstype, her skal jeg senere hente avfallstyper fra setup siden */}
      <Text style={styles.label}>Avfallstype</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={wasteType}
          onValueChange={(value: WasteType) => setWasteType(value)}
          style={styles.picker}
        >
          <Picker.Item label="Velg type..." value="" />
          <Picker.Item label="Restavfall" value="rest" />
          <Picker.Item label="Papp og papir" value="paper" />
          <Picker.Item label="Plastemballasje" value="plastic" />
          <Picker.Item label="Mat" value="food" />
        </Picker>
      </View>

      {/* Her lagres Vektinputten */}
      <Text style={styles.label}>Vekt (kg)</Text>
      <View style={styles.weightRow}>

        {/* minus knapp/ justering */}
        <TouchableOpacity
          style={styles.adjustBtn}
          onPress={() =>
            setWeight((prev) =>
              (Math.max(0, Number(prev || "0") - 0.1)).toFixed(2)
            )
          }
        >
          <Text style={styles.adjustText}>–</Text>
        </TouchableOpacity>

       {/* Bruker skriver inn et tall selv */}
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="0.25"
          placeholderTextColor="#999"
          value={weight}
          onChangeText={(val) => setWeight(val.replace(",", "."))}
        />

        {/*Pluss knappen */}
        <TouchableOpacity
          style={styles.adjustBtn}
          onPress={() =>
            setWeight((prev) =>
              (Number(prev || "0") + 0.1).toFixed(2)
            )
          }
        >
          <Text style={styles.adjustText}>+</Text>
        </TouchableOpacity>
      </View>

      {/*  LAGRE  */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Lagre</Text>
      </TouchableOpacity>
    </View>
  );
}

// her styles siden //

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF" },

  header: {
    fontSize: 30,
    fontFamily: "Poppins-Bold",
    color: "#507C6D",
    marginTop: 40,
    marginBottom: 20,
  },

  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 30,
  },

  activeStep: {
    backgroundColor: "#5F9D84",
    padding: 6,
    borderRadius: 30,
    minWidth: 34,
    alignItems: "center",
  },

  inactiveStep: {
    backgroundColor: "#9CBBAF",
    padding: 6,
    borderRadius: 30,
    minWidth: 34,
    alignItems: "center",
  },

  stepNum: { fontFamily: "Poppins-SemiBold", color: "#FFF" },

  stepLabel: { fontFamily: "Inter-Regular", fontSize: 14, color: "#525252" },

  label: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#525252",
    marginBottom: 6,
  },

  pickerWrapper: {
    borderWidth: 2,
    borderColor: "#507C6D",
    borderRadius: 12,
    backgroundColor: "#FFF",
    overflow: "hidden",
    height: 55,
    justifyContent: "center",
    marginBottom: 20,
  },

  picker: { width: "100%", height: "100%" },

  weightRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  adjustBtn: {
    width: 50,
    height: 50,
    backgroundColor: "#507C6D",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  adjustText: {
    color: "#FFF",
    fontSize: 30,
    fontWeight: "bold",
  },

  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#507C6D",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    fontSize: 18,
    backgroundColor: "#FFF",
    fontFamily: "Inter-Regular",
  },

  saveButton: {
    backgroundColor: "#507C6D",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  saveButtonText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#FFF",
  },
});
