import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { auth } from "@/firebaseConfig";
import { useAuthSession } from "@/providers/authctx";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useLocalSearchParams } from "expo-router";
import LoginScreen from "./login";

//Komponenter
import { BottomLeaves } from "@/components/Bottom_leaves";
import { TopLeaf } from "@/components/top_leaf";
import { colors } from "@/components/colors";

export default function AuthenticationScreen() {
  const { signIn } = useAuthSession();
  const params = useLocalSearchParams();
  const startInSignUp = params.signup === "true";

  const [isSignUp, setIsSignUp] = useState<boolean>(startInSignUp);

  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const registerNewUser = async () => {
    const email = userEmail.trim();
    if (!email || !password || !repeatPassword) {
      Alert.alert("Feil", "Fyll inn alle feltene.");
      return;
    }
    if (password !== repeatPassword) {
      Alert.alert("Feil", "Passordene er ikke like.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Bruker opprettet", "Brukeren ble registrert.");
      setIsSignUp(false);
    } catch (e: any) {
      console.log("Registrering feilet:", e?.code ?? e);
      switch (e?.code) {
        case "auth/email-already-in-use":
          Alert.alert("Feil", "E-post er allerede i bruk.");
          break;
        case "auth/invalid-email":
          Alert.alert("Feil", "Ugyldig e-postadresse.");
          break;
        case "auth/weak-password":
          Alert.alert("Feil", "Passordet er for svakt.");
          break;
        default:
          Alert.alert("Feil", "Registrering feilet. Kontakt kundeservice.");
      }
    }
  };

  // Når vi ikke er i signup-modus brukes LoginScreen 
  if (!isSignUp) {
    return <LoginScreen />;
  }

  // SIGNUP-VISNING MED SAMME STIL SOM LOGIN
  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "bottom"]}>
      <View style={styles.container}>
        {/* TOPP-BLAD */}
        <TopLeaf />

        {/* LOGO */}
        <Image
          source={require("../../assets/images/ecovekt_logo.png")}
          style={styles.logo}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* INNHOLD */}
          <View style={styles.content}>
            {/* Epost */}
            <View style={styles.inputContainer}>
              <TextInput
                value={userEmail}
                onChangeText={setUserEmail}
                placeholder="Epost"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            {/* Passord */}
            <View style={styles.inputContainer}>
              <View style={styles.passwordRow}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Passord"
                  secureTextEntry={!showPassword}
                  style={[styles.input, styles.passwordInput]}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={22}
                    color={"#989797ff"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Gjenta passord */}
            <View style={styles.inputContainer}>
              <View style={styles.passwordRow}>
                <TextInput
                  value={repeatPassword}
                  onChangeText={setRepeatPassword}
                  placeholder="Gjenta passord"
                  secureTextEntry={!showRepeatPassword}
                  style={[styles.input, styles.passwordInput]}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowRepeatPassword(!showRepeatPassword)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather
                    name={showRepeatPassword ? "eye-off" : "eye"}
                    size={22}
                    color={"#989797ff"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Registrer-knapp */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={registerNewUser}
            >
              <Text style={styles.primaryButtonText}>Registrer</Text>
            </TouchableOpacity>

            {/* Allerede bruker? Logg inn */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Allerede bruker? </Text>
              <TouchableOpacity onPress={() => setIsSignUp(false)}>
                <Text style={styles.registerLink}>Logg inn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* NEDERSTE BLADER */}
        <BottomLeaves />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    position: "relative",
  },
  scrollContent: {
    flexGrow: 1,
  },

  /* LOGO */
  logo: {
    position: "absolute",
    width: 190.51,
    height: 190.51,
    top: -10,
    left: 98,
    resizeMode: "contain",
  },

  /* INNHOLD */
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 210,
    paddingBottom: 120,
  },

  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.textBox,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.mainGreen,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
  },

  /* Passordfelt */
  passwordRow: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 46,
  },

  /* Øyeikon */
  eyeButton: {
    position: "absolute",
    right: 18,
    top: "50%",
    marginTop: -11,
    justifyContent: "center",
    alignItems: "center",
  },

  primaryButton: {
    marginTop: 20,
    backgroundColor: colors.mainGreen,
    borderRadius: 12,
    paddingVertical: 17,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },
  registerText: {
    color: colors.text,
  },
  registerLink: {
    color: colors.mainGreen,
    fontWeight: "600",
  }
});
