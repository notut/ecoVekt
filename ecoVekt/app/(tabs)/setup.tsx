import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { db } from "../../firebaseConfig"; // adjust path if needed

interface TrashType {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
}

export default function SetupBusiness() {
  const [trashTypes, setTrashTypes] = useState<TrashType[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrashTypes = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "trash"));
        const types: TrashType[] = [];
        querySnapshot.forEach(doc => {
          const data = doc.data() as Record<string, any>;
          types.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            // handle both imageUrl and imageurl
            imageUrl: data.imageUrl || data.imageurl || undefined,
          });
        });
        // Sort by numeric ID
        types.sort((a, b) => Number(a.id) - Number(b.id));
        setTrashTypes(types);
      } catch (err) {
        console.error("Error fetching trash types:", err);
        setError("Kunne ikke hente avfallstyper. Sjekk Firestore eller nettverk.");
      } finally {
        setLoading(false);
      }
    };

    fetchTrashTypes();
  }, []);

  const toggleSelection = (typeId: string) => {
    setSelected(prev =>
      prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "red", fontSize: 16, textAlign: "center" }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Velg avfallstyper for din bedrift</Text>
      <FlatList
        data={trashTypes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.id);
          return (
            <Pressable
              style={[styles.item, isSelected && styles.selectedItem]}
              onPress={() => toggleSelection(item.id)}
            >
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
              ) : null}
              <View style={styles.itemTextContainer}>
                <Text style={[styles.itemText, isSelected && styles.selectedText]}>
                  {item.title}
                </Text>
                {item.description ? (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                ) : null}
              </View>
            </Pressable>
          );
        }}
      />
      <Text style={styles.footerText}>
        Valgte typer:{" "}
        {selected
          .map(id => trashTypes.find(t => t.id === id)?.title)
          .filter(Boolean)
          .join(", ") || "Ingen"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  selectedItem: {
    backgroundColor: "#007AFF",
  },
  itemImage: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 6,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemText: {
    fontSize: 18,
    color: "#000",
  },
  selectedText: {
    color: "#fff",
  },
  itemDescription: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  footerText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#555",
  },
});