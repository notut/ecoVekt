import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
// Hvis dere bruker ikoner kan dere f.eks. bruke dette:
// import { Feather } from "@expo/vector-icons";

const main_green = "#5F9D84";
const light_green = "#7EAC99";
const dark_green = "#507C6D";
const background_color = "#FFFFFF";
const text_box_color = "#F8F7F5";
const text_color = "#525252";

export const RegisterScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [repeatPassword, setRepeatPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState<boolean>(false);

  const handleRegister = () => {
    // TODO: koble til backend / valider data
    console.log("Register:", { email, password, repeatPassword });
  };

  const handleGoToLogin = () => {
    // TODO: naviger til login-skjerm
    console.log("Gå til login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* TOPP-FORM / HEADER */}
          <View style={styles.topShape}>
            <View style={styles.logoCircle}>
              {/* Bytt ut med SVG/logo-image om dere har */}
              <Text style={styles.logoIcon}>🍃</Text>
            </View>
          </View>

          {/* INNHOLD */}
          <View style={styles.content}>
            {/* Epost */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Epost</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Epost"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                placeholderTextColor="#A0A0A0"
              />
            </View>

            {/* Passord */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Passord</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Passord"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={[styles.input, styles.passwordInput]}
                  placeholderTextColor="#A0A0A0"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  {/* Bytt til ikon om dere vil */}
                  <Text style={styles.eyeText}>
                    {showPassword ? "🙈" : "👁"}
                  </Text>
                  {/* Eksempel med Feather:
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={18}
                    color={text_color}
                  />
                  */}
                </TouchableOpacity>
              </View>
            </View>

            {/* Gjenta passord */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Gjenta Passord</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={repeatPassword}
                  onChangeText={setRepeatPassword}
                  placeholder="Gjenta Passord"
                  secureTextEntry={!showRepeatPassword}
                  autoCapitalize="none"
                  style={[styles.input, styles.passwordInput]}
                  placeholderTextColor="#A0A0A0"
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowRepeatPassword((prev) => !prev)}
                >
                  <Text style={styles.eyeText}>
                    {showRepeatPassword ? "🙈" : "👁"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Registrer-knapp */}
            <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
              <Text style={styles.registerButtonText}>Registrer</Text>
            </TouchableOpacity>

            {/* Allerede bruker? Logg inn */}
            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Allerede bruker? </Text>
              <TouchableOpacity onPress={handleGoToLogin}>
                <Text style={styles.loginLink}>Logg inn</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* BUNN-FORM */}
          <View style={styles.bottomShapeWrapper}>
            <View style={styles.bottomShape} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: background_color,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: background_color,
  },
  topShape: {
    backgroundColor: main_green,
    height: 180,
    borderBottomRightRadius: 120,
    overflow: "hidden",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  logoCircle: {
    marginTop: 60,
    marginLeft: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: background_color,
    justifyContent: "center",
    alignItems: "center",
  },
  logoIcon: {
    fontSize: 26,
    color: background_color,
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    color: text_color,
    marginBottom: 6,
  },
  input: {
    backgroundColor: text_box_color,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: text_color,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    paddingRight: 40,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  eyeText: {
    fontSize: 16,
    color: "#777777",
  },
  registerButton: {
    marginTop: 20,
    backgroundColor: main_green,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonText: {
    color: background_color,
    fontSize: 16,
    fontWeight: "600",
  },
  loginRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 14,
    color: "#8A8A8A",
  },
  loginLink: {
    fontSize: 14,
    color: light_green,
    fontWeight: "500",
  },
  bottomShapeWrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bottomShape: {
    height: 140,
    backgroundColor: "#7EAC99",
    borderTopLeftRadius: 160,
    transform: [{ translateY: 40 }],
  },
});
