import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import TagsList from "../../components/TagsList";
import { db } from "../../firebaseConfig";

interface TrashType {
  id: string;
  title: string;
}

export default function SetupBusiness() {
  const [trashTypes, setTrashTypes] = useState<TrashType[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrashTypes = async () => {
      try {
        const snapshot = await getDocs(collection(db, "trash"));
        const list: TrashType[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({ id: doc.id, title: data.title });
        });

        list.sort((a, b) => Number(a.id) - Number(b.id));
        setTrashTypes(list);
      } finally {
        setLoading(false);
      }
    };

    fetchTrashTypes();
  }, []);

  const toggleSelection = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#507C6D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Velg hvilke typer avfall du 
bruker i din bedrift:</Text>
      <TagsList
        items={trashTypes}
        selectedItems={selected}
        onToggle={toggleSelection}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    marginTop: 120,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
});
