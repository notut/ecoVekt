import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthSession } from "@/providers/authctx";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";

//Farger tatt fra designet
const main_green = "#5F9D84";
const light_green = "#7EAC99";
const text_box_color = "#F8F7F5";
const text_color = "#525252";

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

  return (
    <SafeAreaView
      style={styles.safe}
      edges={["left", "right", "bottom"]}
    >
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

          <View style={styles.inputContainer}>

            {/* Passordboks */}
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Passord"
                secureTextEntry={!showPassword}
                style={[styles.input, styles.passwordInput]}
              />

              {/* øyeikon */}
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

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.primaryButtonText}>Logg inn</Text>
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Ikke bruker? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Registrer deg</Text>
            </TouchableOpacity>
          </View>
        </View>

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
};

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
    paddingTop: 250,
    paddingBottom: 120,
  },

  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: text_color,
    marginBottom: 4,
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

  /* Øyeikonet */
  eyeButton: {
    position: "absolute",
    right: 18,
    top: "50%",
    marginTop: -11,            // halv ikon-høyde (22/2)
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

export default LoginScreen;

