//importerer react og react native komponenter
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
//import { SafeAreaView } from "react-native-safe-area-context";

//importer auth context
import { useAuthSession } from "@/providers/authctx";
import { router } from "expo-router";

//Komponenter
import { BottomLeaves } from "@/components/Bottom_leaves";
import { TopLeaf } from "@/components/top_leaf";
import { colors } from "@/components/colors";
import { PasswordInput } from "@/components/passwordInput";
import { SafeAreaView } from "react-native-safe-area-context";

//Login funksjon
export const LoginScreen: React.FC = () => {
  const { signIn, isLoading } = useAuthSession();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      alert("Skriv inn korrekt e-post og passord");
      return;
    }
    await signIn(email.trim(), password);
  };

  const handleRegister = () => {
    router.push("/brukerregistrering/autentication?signup=true");
  };

  //JSX returnerer komponentene på skjermen
  return (
    <SafeAreaView>
      <View style={styles.container}>
        {/* TOPP BLAD */}
        <TopLeaf />

        {/* LOGO */}
        <Image
          source={require("../../assets/images/ecovekt_logo.png")}
          style={styles.logo}
        />

        {/* INNHOLD */}
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Epost"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          {/* PASSORD */}
          <View style={styles.inputContainer}>
            <PasswordInput
              value={password}
              onChangeText={setPassword}
              placeholder="Passord"
            />
          </View>

          {/* LOGIN KNAPP */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>Logg inn</Text>
          </TouchableOpacity>

          {/* REGISTRER BRUKER */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Ikke bruker? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Registrer deg</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* NEDERSTE BLADER */}
        <BottomLeaves />
      </View>
    </SafeAreaView>
  );
};

// Stiler
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
    paddingTop: 250,
    paddingBottom: 120,
  },

  inputContainer: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
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
  },
});

export default LoginScreen;
