import {
  Poppins_400Regular,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Welcome() {
  const router = useRouter();

  // Load the Poppins font
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  // Font Loading
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#507C6D" />
      </View>
    );
  }

  const goToSetup = () => {
    router.push("/setup");
  };

  return (
    <View style={styles.container}>
      <View style={styles.textWrapper}>
        <Text style={styles.titleText}>Velkommen til ecoVekt!</Text>
        <Text style={styles.subtitleText}>
          En app for å enkelt registrere avfall
        </Text>
      </View>

      <TouchableOpacity onPress={goToSetup} style={styles.bottomLink}>
        <Text style={styles.linkText}>Sett opp for din bedrift</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 40,
  },
  textWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 30,
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    color: "#507C6D",
  },
  subtitleText: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginTop: 8,
    color: "#507C6D",
  },
  bottomLink: {
    padding: 10,
  },
  linkText: {
    fontSize: 15,
    color: "#7EAC99",
    textDecorationLine: "none",
    fontFamily: "Poppins_400Regular",
  },
});
