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
import { auth, db } from "@/firebaseConfig";
import { useAuthSession } from "@/providers/authctx";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import LoginScreen from "./login";

// Farger tatt fra designet
const main_green = "#5F9D84";
const light_green = "#7EAC99";
const text_box_color = "#F8F7F5";
const text_color = "#525252";

export default function AuthenticationScreen() {
  const { signIn } = useAuthSession();
  const params = useLocalSearchParams();
  const startInSignUp = params.signup === "true";

  const [isSignUp, setIsSignUp] = useState<boolean>(startInSignUp);

  const [fullName, setFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const registerNewUser = async () => {
    const trimmedName = fullName.trim();
    const email = userEmail.trim();
    const trimmedCompany = companyName.trim();
    const trimmedEmployee = employeeNumber.trim();

    if (
      !trimmedName ||
      !email ||
      !password ||
      !repeatPassword ||
      !trimmedCompany ||
      !trimmedEmployee
    ) {
      Alert.alert("Feil", "Fyll inn alle feltene.");
      return;
    }
    if (password !== repeatPassword) {
      Alert.alert("Feil", "Passordene er ikke like.");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCred.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        fullName: trimmedName,
        companyName: trimmedCompany,
        employeeNumber: trimmedEmployee,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Bruker opprettet", "Brukeren ble registrert.");
      setIsSignUp(false);

      setPassword("");
      setRepeatPassword("");
      setCompanyName("");
      setEmployeeNumber("");
      setFullName("");
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

  const signInWithUser = async () => {
    const email = userEmail.trim();
    if (!email || !password) {
      Alert.alert("Feil", "Skriv inn korrekt e-post og passord");
      return;
    }
    await signIn(email, password);
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
        <Image
          source={require("../../assets/images/green_leaf.png")}
          style={styles.topLeaf}
        />

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
            <View style={styles.inputContainer}>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Fullt navn"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="Navn på bedrift"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                value={employeeNumber}
                onChangeText={setEmployeeNumber}
                placeholder="Ansattnummer"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>
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
        <Image
          source={require("../../assets/images/bottom_dark_leaf.png")}
          style={styles.bottomDark}
        />
        <Image
          source={require("../../assets/images/bottom_light_leaf.png")}
          style={styles.bottomLight}
        />
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

  /* TOPP BLAD */
  topLeaf: {
    position: "absolute",
    transform: [{ rotate: "5deg" }],
    width: 400,
    height: 320,
    top: -110,
    left: -40,
    resizeMode: "contain",
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
    backgroundColor: text_box_color,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: main_green,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: text_color,
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
    backgroundColor: main_green,
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
    color: text_color,
  },
  registerLink: {
    color: main_green,
    fontWeight: "600",
  },

  /* NEDRE BLADER */
  bottomLight: {
    position: "absolute",
    width: 190.43,
    height: 299.38,
    bottom: -50,
    right: -40,
    resizeMode: "contain",
    zIndex: 2,
  },
  bottomDark: {
    position: "absolute",
    width: 310,
    height: 209.28,
    bottom: -40,
    right: -40,
    resizeMode: "contain",
    zIndex: 1,
  },
});
