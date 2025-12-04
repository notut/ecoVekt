import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthSession } from "@/providers/authctx";
import { router } from "expo-router";

const main_green = "#5F9D84";
const light_green = "#7EAC99";
const dark_green = "#507C6D";
const background_color = "#FFFFFF";
const text_box_color = "#F8F7F5";
const text_color = "#525252";

export const LoginScreen: React.FC = () => {
  const { signIn, isLoading } = useAuthSession();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // kobler opp signIn fra authentication
  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      alert("Skriv inn korrekt e-post og passord");
      return;
    }
    await signIn(trimmedEmail, password);
  };

  const handleRegister = () => {
    router.push("/brukerregistrering/autentication?signup=true");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* TOPP-FORM / HEADER */}
        <View style={styles.topShape}>
          <View style={styles.logoCircle}>
            {/* Bytt ut med SVG/logo-image om du har */}
            <Text style={styles.logoIcon}>🍃</Text>
          </View>
        </View>
        {/* INNHOLD */}
        <View style={styles.content}>
          {/* E-post */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Epost</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Skriv inn epost"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>

          {/* Passord */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Passord</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Skriv inn passord"
                secureTextEntry={!showPassword}
                style={[styles.input, styles.passwordInput]}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                {/* Her kan du bruke f.eks. react-native-vector-icons */}
                <Text style={styles.eyeText}>{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Logg inn knapp */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>Logg inn</Text>
          </TouchableOpacity>

          {/* Registrer deg tekst */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Ikke bruker? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Registrer deg</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* 👈 LUKKER content */}
        {/* BUNN-FORM – enklest som dekor-view eller bilde */}
        <View style={styles.bottomShape} />
      </View>
      {/* 👈 LUKKER container */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  /* TOPP-DEL */
  topShape: {
    height: 220,
    backgroundColor: main_green,
    borderBottomRightRadius: 220,
    justifyContent: "flex-end",
    paddingBottom: 32,
    paddingLeft: 24,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  logoIcon: {
    fontSize: 32,
    color: "#FFFFFF",
  },

  /* INNHOLD */
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },

  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: text_color,
    marginBottom: 4,
  },
  input: {
    backgroundColor: text_box_color,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: main_green,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },

  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
  },
  eyeText: {
    fontSize: 18,
  },

  primaryButton: {
    marginTop: 16,
    backgroundColor: main_green,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    // enkel skygge/elevation
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  primaryButtonText: {
    color: "text_color",
    fontSize: 16,
    fontWeight: "600",
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 16,
  },
  registerText: {
    fontSize: 14,
    color: "text_color",
  },
  registerLink: {
    fontSize: 14,
    color: main_green,
    fontWeight: "600",
  },

  secondaryButton: {
    backgroundColor: light_green,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "text_color",
    fontSize: 16,
    fontWeight: "600",
  },

  /* BUNN-DEL */
  bottomShape: {
    position: "absolute",
    bottom: -80,
    right: -80,
    width: 220,
    height: 220,
    backgroundColor: light_green,
    borderTopLeftRadius: 220,
  },
});

export default LoginScreen;
