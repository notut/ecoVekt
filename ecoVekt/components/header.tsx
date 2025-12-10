import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors } from "@/components/colors";
import {
  Poppins_600SemiBold,
  useFonts,
} from "@expo-google-fonts/poppins";

type HeaderProps = {
  title: string;
  onBackPress?: () => void;
  onProfilePress?: () => void;
  containerStyle?: ViewStyle;
  titleStyle?: TextStyle;
};

const HEADER_HEIGHT = 50; // 👈 høyere enn før
const HEADER_BG = colors.mainGreen;
const ICON_COLOR = colors.background;

export const Header: React.FC<HeaderProps> = ({
  title,
  onBackPress,
  onProfilePress,
  containerStyle,
  titleStyle,
  title,
  onBackPress,
  onProfilePress,
  containerStyle,
  titleStyle,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={[
          styles.root,
          {
            height: HEADER_HEIGHT + insets.top,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
        <ActivityIndicator color={ICON_COLOR} />
      </View>
    );
  }

  const handleProfilePress =
    onProfilePress ?? (() => router.push("/(tabs)/admin/profile"));

  return (
    <View
      style={[
        styles.root,
        {
          paddingTop: insets.top,
          height: HEADER_HEIGHT + insets.top,
        },
      ]}
    >
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <View style={[styles.inner, containerStyle]}>
        {/* BACK */}
        {onBackPress ? (
          <Pressable style={styles.iconButton} onPress={onBackPress} hitSlop={10}>
            <Ionicons name="chevron-back" size={26} color={ICON_COLOR} />
          </Pressable>
        ) : (
          <View style={styles.iconPlaceholder} />
        )}

        {/* TITLE */}
        <Text
          numberOfLines={1}
          style={[styles.title, titleStyle]}
        >
          {title}
        </Text>

        {/* PROFILE */}
        <Pressable
          style={styles.profileButton}
          onPress={handleProfilePress}
          hitSlop={10}
        >
          <View style={styles.profileCircle}>
            <Ionicons name="person" size={18} color={ICON_COLOR} />
          </View>
        </Pressable>
      </View>
    </View>
  );
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    backgroundColor: HEADER_BG,

    // ✅ Skygge under header
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },

  inner: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end", // 👈 gjør headeren “tyngre”
    paddingHorizontal: 16,
    paddingBottom: 14,
  },

  iconButton: {
    width: 40,
    justifyContent: "center",
  },

  iconPlaceholder: {
    width: 40,
  },

  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    color: ICON_COLOR,
    fontFamily: "Poppins_600SemiBold",
  },

  profileButton: {
    width: 40,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  profileCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: ICON_COLOR,
    alignItems: "center",
    justifyContent: "center",
  },
});