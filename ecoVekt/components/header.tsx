import { colors } from "@/components/colors";
import { Ionicons } from "@expo/vector-icons";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// 💡 1. Import useRouter from expo-router
import {
    Poppins_600SemiBold,
    useFonts,
} from "@expo-google-fonts/poppins";
import { useRouter } from "expo-router";

type HeaderProps  = {
    title: string;
    onBackPress?: () => void;
    onProfilePress?: () => void; // This prop still takes precedence
    containerStyle?: ViewStyle;
    titleStyle?: TextStyle;
};

const HEADER_BG = colors.mainGreen;
const ICON_COLOR = colors.background;
const FONT_FAMILY_BOLD = "Poppins_600SemiBold";

export const Header: React.FC<HeaderProps> = ({
    title,
    onBackPress,
    onProfilePress,
    containerStyle,
    titleStyle,
}) => {
    const insets = useSafeAreaInsets();
    // 💡 2. Initialize useRouter
    const router = useRouter();

    const [fontsLoaded] = useFonts({
        Poppins_600SemiBold,
    });

    if (!fontsLoaded) {
        return (
            <View style={[styles.root, { backgroundColor: HEADER_BG, height: 80 + insets.top, justifyContent: 'center', alignItems: 'center' }]}>
                <StatusBar
                    translucent
                    backgroundColor="transparent"
                    barStyle="light-content"
                />
                <ActivityIndicator size="small" color={ICON_COLOR} />
            </View>
        );
    }

    // Components for balanced left/right layout
    const BackButton = onBackPress ? (
        <Pressable
            onPress={onBackPress}
            style={styles.iconButton}
            hitSlop={10}
        >
            <Ionicons name="chevron-back" size={24} color={ICON_COLOR} />
        </Pressable>
    ) : (
        <View style={styles.iconPlaceholder} />
    );

    // 💡 3. Updated ProfileIcon handler to use onProfilePress if provided,
    //    or default to navigating to /profile if onProfilePress is missing.
    const handleProfilePress = onProfilePress 
        ? onProfilePress 
        : () => router.push("/(tabs)/admin/profile"); // Default link logic

    const ProfileIcon = (
        <Pressable
            onPress={handleProfilePress} // Use the consolidated handler
            style={styles.profileButton}
            hitSlop={10}
        >
            <View style={styles.profileCircle}>
                <Ionicons name="person" size={20} color={ICON_COLOR} />
            </View>
        </Pressable>
    );
    // Note: Removed the placeholder logic for ProfileIcon to ensure it's always present and linked

    return (
        <View style={[styles.root, { backgroundColor: HEADER_BG }]}>
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
                {/* Venstre: tilbake knapp eller placeholder */}
                {BackButton}

                {/* Midten: tittel (flex: 1 and textAlign: 'center' ensures centering) */}
                <Text
                    style={[
                        styles.title,
                        titleStyle,
                        // Ensure text alignment is center unless explicitly overridden
                        { textAlign: titleStyle?.textAlign === undefined ? 'center' : titleStyle.textAlign }
                    ]}
                    numberOfLines={1}
                >
                    {title}
                </Text>

                {/* Høyre: profil ikon */}
                {ProfileIcon}
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
    // Must match iconButton/profileButton width for centering
    iconPlaceholder: {
        width: 32,
        height: 32,
    },
    title: {
      flex: 1,
      textAlign: "center", // CRITICAL for inner centering
      fontSize: 24,
      // 4. Apply the Poppins font family
      fontFamily: FONT_FAMILY_BOLD,
      // Removed fontWeight: "600" as the font family handles the weight
      color: ICON_COLOR,
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
      borderColor: ICON_COLOR,
      justifyContent: "center",
      alignItems: "center",
    },
  });
