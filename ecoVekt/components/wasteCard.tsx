import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function WasteCard({ item, onSelect }: any) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.easeInEaseOut();
    setExpanded(!expanded);
  };

  return (
    <View style={styles.card}>
      {/* TOPP RAD: IKON + TITTEL + PIL */}
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={() => onSelect(item)}
      >
        {/* STORT IKON */}
        {item.imageUrl && (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.icon}
            resizeMode="contain"
          />
        )}

        {/* TEKST */}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
        </View>

        {/* PIL */}
        <TouchableOpacity onPress={toggle}>
          <MaterialIcons
            name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={28}
            color="#6B7A75"
          />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* BESKRIVELSE — KUN NÅR ÅPNET */}
      {expanded && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  // 👇 STØRRE IKON – matcher prototypen 
  icon: {
    width: 54,
    height: 54,
    borderRadius: 10,
    marginRight: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "500",
    color: "#486258",
  },
  descriptionContainer: {
    marginTop: 10,
    paddingLeft: 70, // får teksten til å starte under tittel, justert for ikon
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7A75",
  },
});