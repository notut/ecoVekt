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
    backgroundColor: "#F2F2F7",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1D1D6",
  },
  tagSelected: {
    backgroundColor: "#507C6D",
    borderColor: "#507C6D",
  },
  tagText: {
    fontSize: 15,
    color: "#333",
  },
  tagTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
});
