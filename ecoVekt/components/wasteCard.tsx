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

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type WasteCardProps = {
  item: {
    title: string;
    description?: string;
    imageUrl?: string | null;
  };
  onSelect?: (item: any) => void;
  /**
   * compact = true:
   *  - ingen pil
   *  - ingen expand/collapse
   *  - description vises rett under tittelen (brukes f.eks. på YourTrash)
   */
  compact?: boolean;
};

export default function WasteCard({
  item,
  onSelect,
  compact = false,
}: WasteCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handlePress = () => {
    onSelect?.(item);

    if (!compact) {
      LayoutAnimation.easeInEaseOut();
      setExpanded((prev) => !prev);
    }
  };

  return (
    <View style={styles.card}>
      {/* TOPP RAD: IKON + TITTEL + (EVT. PIL) */}
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.85}
        onPress={handlePress}
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

          {/* I COMPACT-MODUS viser vi beskrivelse (vekt) rett under */}
          {compact && item.description && (
            <Text style={styles.compactDescription}>{item.description}</Text>
          )}
        </View>

        {/* PIL KUN I NORMALMODUS */}
        {!compact && (
          <TouchableOpacity
            onPress={() => {
              LayoutAnimation.easeInEaseOut();
              setExpanded((prev) => !prev);
            }}
          >
            <MaterialIcons
              name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={28}
              color="#6B7A75"
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* BESKRIVELSE — KUN NÅR ÅPNET (NORMALMODUS) */}
      {!compact && expanded && item.description && (
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
  // beskrivelse i “accordion”-modus
  descriptionContainer: {
    marginTop: 10,
    paddingLeft: 70,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7A75",
  },
  // beskrivelse i compact-modus (vekt-linje)
  compactDescription: {
    marginTop: 4,
    fontSize: 15,
    color: "#6B7A75",
  },
});
