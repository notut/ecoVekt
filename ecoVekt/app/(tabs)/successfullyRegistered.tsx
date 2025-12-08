import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";
import { Header } from "@/components/header";
import TopLeaf from "@/components/top_leaf";
import BottomLeaves from "@/components/Bottom_leaves";


//farge
const TEXT_DARK = "#507C6D";
const BG = "#FFFFFF";


//  Props-type for gjenbruk
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

  //  Auto-redirect etter 3 sek
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/chooseWaste" as any);
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

 
 return (
    <View style={styles.root}>
       {/* øverste bleder */}
    <TopLeaf />

    {/* nederste balder */}
    <BottomLeaves />
    
      <View style={styles.content}>

        {/*overskriften */}
        <Text style={styles.header}>Registrering vellykket!</Text>

        {/* sjekk bilde SOM ASSET (må bytte det til et transparrent bilde) */}
        <Image
          source={require("../../assets/images/success-icon-19.png")} //BYTT BILDE TIL NOE ANNENT SOM ER TRANSPARENT
          style={styles.successIcon}
        />
          {/* Underskriften  */}
        <Text style={styles.text}>Takk for at du tar vare på miljøet.</Text>

      </View>
    </View>
  );
}

// STYLING
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
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
    color: TEXT_DARK,
    textAlign: "center",
   
    },
  text: {
    fontSize: 16,
    color: TEXT_DARK,
    textAlign: "center",
  },
});
