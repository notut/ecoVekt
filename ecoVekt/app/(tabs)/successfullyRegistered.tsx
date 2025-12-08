import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { Header } from "@/components/header";
import TopLeaf from "@/components/top_leaf";
import BottomLeaves from "@/components/Bottom_leaves";
import { colors } from "@/components/colors"; 


type SuccessMessageProps = {
  redirectTo: string;
  title?: string;
  message?: string;
  delay?: number;
};

export default function SuccessMessage({
  redirectTo,
  title = "Registrering vellykket!",
  message = "Takk for at du tar vare på miljøet.",
  delay = 3000,
}: SuccessMessageProps) {
  const router = useRouter();

  // Auto-redirect etter 3 sek
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/chooseWaste" as any);
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (

    //hente bottom leaves komponent, setter overskrift, ikon og underoverskriften.
    <View style={styles.root}>
      <TopLeaf />
      <BottomLeaves />

      <View style={styles.content}>
        <Text style={styles.header}>Registrering vellykket!</Text>

        <Image
          source={require("../../assets/images/success-icon-19.png")}
          style={styles.successIcon}
        />

        <Text style={styles.text}>Takk for at du tar vare på miljøet.</Text>
      </View>
    </View>
  );
}

// styling på siden ved bruk av farger fra komponenter
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background, 
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingTop: 250,
  },
  successIcon: {
    width: 70,
    height: 130,
    resizeMode: "contain",
  },
  header: {
    fontSize: 20,
    color: colors.darkGreen, 
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: colors.text, 
    textAlign: "center",
  },
});
