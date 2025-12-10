import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
  ViewStyle,
  TextStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type HeaderProps = {
  title: string;
  onBackPress?: () => void;
  onProfilePress?: () => void;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
};

const HEADER_BG = "#5F9D84"; //endret header farge slik som den matcher som i prototypen

export const Header: React.FC<HeaderProps> = ({
  title,
  onBackPress,
  onProfilePress,
  containerStyle,
  titleStyle,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor: HEADER_BG }]}>
      {/* Gjør statusbaren gjennomsiktig slik at headeren legger seg bak kamera */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View
        style={[
          styles.headerContainer,
          { paddingTop: insets.top },
          containerStyle,
        ]}
      >
        {/* Venstre: tilbake knapp */}
        <Pressable onPress={onBackPress} style={styles.iconButton} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>

        {/* Midten: tittel */}
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>

        {/* Høyre: profil ikon */}
        <Pressable
          onPress={onProfilePress}
          style={styles.profileButton}
          hitSlop={10}
        >
          <View style={styles.profileCircle}>
            <Ionicons name="person" size={20} color="#FFFFFF" />
          </View>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    // Farger og skygge gjelder helt til toppen (bak statusbar/notch)
    width: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  profileButton: {
    width: 32,
    height: 32,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
});
