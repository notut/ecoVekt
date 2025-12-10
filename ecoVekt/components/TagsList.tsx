// 🔑 CHANGE: Removed ScrollView from imports
import { Pressable, StyleSheet, Text, View } from "react-native";

interface TrashType {
  id: string; // The Firebase Document ID (not used for selection state anymore)
  title: string; // The human-readable waste name (used for selection state)
}

interface TagsListProps {
  items: TrashType[];
  // selectedItems now holds titles (strings like "Trevirke"), not IDs
  selectedItems: string[];
  // onToggle now expects a TITLE (string), not an ID
  onToggle: (title: string) => void; 
}

export default function TagsList({ items, selectedItems, onToggle }: TagsListProps) {
  return (
    // 🔑 CHANGE: Replaced ScrollView with View
    <View style={styles.tagsContainer}> 
      {items.map((item) => {
        // 🔑 CHANGE 1: Check if the item's title is present in the selectedItems array
        const isSelected = selectedItems.includes(item.title);
        return (
          <Pressable
            key={item.id}
            // 🔑 CHANGE 2: Pass the item's TITLE to the toggle function
            onPress={() => onToggle(item.title)}
            style={[styles.tag, isSelected && styles.tagSelected]}
          >
            <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
              {item.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tagsContainer: {
    // 🔑 NOTE: These properties already handle wrapping correctly for a View
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingTop: 10,
    // Add maxHeight if you want to explicitly limit the height when using View
    // maxHeight: '80%', 
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
    // fontFamily: "Poppins_400regular",
  },
  tagTextSelected: {
    color: "#fff",
    // fontFamily: "Poppins_400regular",
  },
});