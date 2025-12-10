import { Pressable, StyleSheet, Text, View } from "react-native";

interface TrashType {
  id: string; 
  title: string; 
}

interface TagsListProps {
  items: TrashType[];
  selectedItems: string[];
  onToggle: (title: string) => void; 
}

export default function TagsList({ items, selectedItems, onToggle }: TagsListProps) {
  return (
    <View style={styles.tagsContainer}> 
      {items.map((item) => {
        const isSelected = selectedItems.includes(item.title);
        return (
          <Pressable
            key={item.id}
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
  },
  tagTextSelected: {
    color: "#fff",
  },
});