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
import { auth, db } from "@/firebaseConfig";
import { useAuthSession } from "@/providers/authctx";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useLocalSearchParams } from "expo-router";
import LoginScreen from "./login";
import { BottomLeaves } from "@/components/Bottom_leaves";
import { TopLeaf } from "@/components/top_leaf";
import { colors } from "@/components/colors";
import { PasswordInput } from "@/components/passwordInput";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // registrer en ny bruker
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
      setPasswordError("Passordene er ikke like.");
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

  // SIGNUP-VISNING
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.leaves}>
          <BottomLeaves />
        </View>
        <TopLeaf />
        <Image
          source={require("../../assets/images/ecovekt_logo.png")}
          style={styles.logo}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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
            <View style={styles.inputContainer}>
              <TextInput
                value={userEmail}
                onChangeText={setUserEmail}
                placeholder="Epost"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                autoComplete="off"
                textContentType="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <PasswordInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (repeatPassword && text !== repeatPassword) {
                    setPasswordError("Passordene er ikke like.");
                  } else {
                    setPasswordError(null);
                  }
                }}
                placeholder="Passord"
              />
            </View>
            <View style={styles.inputContainer}>
              <PasswordInput
                value={repeatPassword}
                onChangeText={(text) => {
                  setRepeatPassword(text);
                  if (password && text !== password) {
                    setPasswordError("Passordene er ikke like.");
                  } else {
                    setPasswordError(null);
                  }
                }}
                placeholder="Gjenta passord"
              />
              {passwordError && (
                <Text style={styles.errorText}>{passwordError}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={registerNewUser}
            >
              <Text style={styles.primaryButtonText}>Registrer</Text>
            </TouchableOpacity>
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Allerede bruker? </Text>
              <TouchableOpacity onPress={() => setIsSignUp(false)}>
                <Text style={styles.registerLink}>Logg inn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: "relative",
  },
  leaves: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    opacity: 0.6,
  },
  scrollContent: {
    flexGrow: 1,
  },
  logo: {
    position: "absolute",
    width: 190.51,
    height: 190.51,
    top: -10,
    left: 98,
    resizeMode: "contain",
  },
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
    zIndex: 2,
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
    color: colors.darkGreen,
    fontWeight: "600",
    zIndex: 5,
  },

  errorText: {
    color: "#D32F2F",
    marginTop: 6,
    fontSize: 13,
  },
});
