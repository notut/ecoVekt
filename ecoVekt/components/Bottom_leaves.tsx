import React from "react";
import { Image, StyleSheet } from "react-native";

export const BottomLeaves: React.FC = () => {
  return (
    <>
      <Image
        source={require("../assets/bottom_dark_leaf.png")}
        style={styles.bottomDark}
      />
      <Image
        source={require("../assets/bottom_light_leaf.png")}
        style={styles.bottomLight}
      />
    </>
  );
};

const styles = StyleSheet.create({
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

export default BottomLeaves;
