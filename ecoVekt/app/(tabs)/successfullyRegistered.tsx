import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated } from "react-native";
import { useRouter } from "expo-router";
import TopLeaf from "@/components/top_leaf";
import BottomLeaves from "@/components/Bottom_leaves";
import { colors } from "@/components/colors";
import { useFocusEffect } from "@react-navigation/native";

export default function SuccessMessage() {
  const router = useRouter();
  const redirectTo = "/(tabs)/chooseWaste";
  const title = "Registrering vellykket!";
  const message = "Takk for at du tar vare på miljøet.";
  const delay = 3000;
  const topLeafY = useRef(new Animated.Value(-140)).current;
  const bottomLeavesY = useRef(new Animated.Value(140)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      // RESET verdier
      topLeafY.setValue(-140);
      bottomLeavesY.setValue(140);
      contentOpacity.setValue(0);

      // START animasjon på nytt
      Animated.parallel([
        Animated.spring(topLeafY, {
          toValue: 0,
          tension: 45,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(bottomLeavesY, {
          toValue: 0,
          tension: 42,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();
      const timer = setTimeout(() => {
        router.replace("/(tabs)/chooseWaste" as any);
      }, 3000);

      // Cleanup når skjermen mister fokus
      return () => clearTimeout(timer);
    }, [])
  );
  return (
    <View style={styles.root}>
      <Animated.View style={{ transform: [{ translateY: topLeafY }] }}>
        <TopLeaf />
      </Animated.View>

      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          transform: [{ translateY: bottomLeavesY }],
        }}
      >
        <BottomLeaves />
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: contentOpacity }]}>
        <Text style={styles.header}>{title}</Text>

        <Image
          source={require("../../assets/images/success-icon-19.png")}
          style={styles.successIcon}
        />

        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  successIcon: {
    width: 70,
    height: 130,
    resizeMode: "contain",
    marginVertical: 16,
  },
  header: {
    fontSize: 20,
    color: colors.darkGreen,
    textAlign: "center",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    textAlign: "center",
  },
});
