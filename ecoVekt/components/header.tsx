import { colors } from "@/components/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, Text, Pressable, StyleSheet, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// 💡 1. Import useRouter from expo-router
import {
    Poppins_600SemiBold,
    useFonts,
} from "@expo-google-fonts/poppins";
import { useRouter } from "expo-router";

type HeaderProps = {
  title: string;
  onBackPress?: () => void;
  onProfilePress?: () => void;
  containerStyle?: any;
  titleStyle?: any;
};

const HEADER_BG = "#5F9D84";

export const Header: React.FC<HeaderProps> = ({
  title,
  onBackPress,
  onProfilePress,
  containerStyle,
  titleStyle,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, backgroundColor: HEADER_BG },
        containerStyle,
      ]}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <View style={styles.headerContainer}>
        {/* Back button */}
        <Pressable onPress={onBackPress} style={styles.iconButton} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>

        {/* Title */}
        <Text style={[styles.title, titleStyle]} numberOfLines={1}>
          {title}
        </Text>

        {/* Profile button */}
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
    width: "100%",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: 10,
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
    justifyContent: "center",
    alignItems: "flex-end",
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
