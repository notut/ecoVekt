import { getData, uploadData } from "@/api/api";
import { Alert, Pressable, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Pressable
        onPress={async () => {
          const response = await uploadData({
            name: "ecoVekt",
            age: 1,
            address: "Bergen",
          });
          if (response) {
            Alert.alert("Error", response);
          }
        }}
      >
        <Text>Upload data</Text>
      </Pressable>

      <Pressable
        onPress={async () => {
          const [data, error] = await getData();
          if (error) {
            Alert.alert("Error", error);
            return;
          }
          console.log(data); // her må jeg bruke dataen til noe, sette den i en state eller noe lignende
        }}
      >
        <Text>Get data</Text>
      </Pressable>
    </View>
  );
}
