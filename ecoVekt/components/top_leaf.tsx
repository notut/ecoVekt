import React from "react";
import { Image, StyleSheet } from "react-native";

export const TopLeaf: React.FC = () => {
  return (
    <Image
      source={require("../assets/green_leaf.png")}
      style={styles.topLeaf}
    />
  );
};

const styles = StyleSheet.create({
  topLeaf: {
    position: "absolute",
    transform: [{ rotate: "5deg" }],
    width: 400,
    height: 320,
    top: -110,
    left: -40,
    resizeMode: "contain",
  },
});

export default TopLeaf;
