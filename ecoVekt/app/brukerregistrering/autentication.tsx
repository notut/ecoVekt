import { auth, db } from "@/firebaseConfig";
import { useAuthSession } from "@/providers/authctx";
import * as WebBrowser from "expo-web-browser";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import LoginScreen from "./login";
import { useLocalSearchParams } from "expo-router";

export default function AuthenticationScreen() {
  const { signIn } = useAuthSession();

  const params = useLocalSearchParams();
  const startInSignUp = params.signup === "true";

  const [isSignUp, setIsSignUp] = useState<boolean>(startInSignUp);

  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerNewUser = async () => {
    const email = userEmail.trim();
    if (!email || !password) {
      alert("Skriv inn e-post og passord.");
      return;
    }
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
    } catch (e: any) {
      console.log("Registrering feilet:", e?.code ?? e);
      switch (e?.code) {
        case "auth/email-already-in-use":
          alert("E-post er allerede i bruk");
          break;
        case "auth/invalid-email":
          alert("Ugyldig e-postadresse");
          break;
        case "auth/weak-password":
          alert("Passordet er for svakt.");
          break;
        default:
          alert("Registrering feilet. Kontakt kundeservice.");
      }
    }
  };

  const signInWithUser = async () => {
    const email = userEmail.trim();
    if (!email || !password) {
      alert("Skriv inn korrekt e-post og passord");
      return;
    }
    await signIn(email, password);
  };

  if (!isSignUp) {
    return <LoginScreen />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.mainContainer}>
        <View style={styles.textFieldContainer}>
          <Text>E-post</Text>
          <TextInput
            value={userEmail}
            onChangeText={setUserEmail}
            style={styles.textField}
            placeholder="E-post"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.textFieldContainer}>
          <Text>Passord</Text>
          <TextInput
            value={password}
            secureTextEntry
            onChangeText={setPassword}
            style={styles.textField}
            placeholder="Passord"
          />
        </View>
        <Pressable
          style={{ paddingTop: 24 }}
          onPress={() => setIsSignUp((v) => !v)}
          hitSlop={8}
        >
          <Text style={{ textDecorationLine: "underline" }}>
            {isSignUp ? "Innlogging" : "Registrer ny bruker"}
          </Text>
        </Pressable>
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.primaryButton}
            onPress={isSignUp ? registerNewUser : signInWithUser}
          >
            <Text style={{ color: "white" }}>
              {isSignUp ? "Lag bruker" : "Logg inn"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainContainer: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    width: "100%",
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  primaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: "#0096C7",
  },
  textFieldContainer: {
    width: "100%",
    paddingTop: 16,
  },
  textField: {
    borderWidth: 1,
    padding: 10,
    marginTop: 2,
    borderColor: "grey",
    borderRadius: 5,
  },
});
