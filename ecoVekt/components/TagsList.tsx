import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

interface TrashType {
  id: string;
  title: string;
}

interface TagsListProps {
  items: TrashType[];
  selectedItems: string[];
  onToggle: (id: string) => void;
}

export default function TagsList({ items, selectedItems, onToggle }: TagsListProps) {
  return (
    <ScrollView contentContainerStyle={styles.tagsContainer}>
      {items.map((item) => {
        const isSelected = selectedItems.includes(item.id);
        return (
          <Pressable
            key={item.id}
            onPress={() => onToggle(item.id)}
            style={[styles.tag, isSelected && styles.tagSelected]}
          >
            <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
              {item.title}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 10,
  },
  tag: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F8F7F5",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#507C6D",
  },
  tagSelected: {
    backgroundColor: "#507C6D",
  },
  tagText: {
    fontSize: 15,
    color: "#525252",
    fontFamily: "Poppins_400Regular",
  },
  tagTextSelected: {
    color: "#fff",
    fontFamily: "Poppins_400Regular",
  },
});
