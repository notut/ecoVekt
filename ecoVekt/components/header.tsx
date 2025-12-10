import { colors } from "@/components/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Pressable,
    StatusBar,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type HeaderProps  = {
    title: string;
    onBackPress?: () => void;
    onProfilePress?: () => void;
    containerStyle?: ViewStyle;
    titleStyle?: TextStyle;
};

const HEADER_BG = colors.mainGreen; 
const ICON_COLOR = colors.background; 

export const Header: React.FC<HeaderProps> = ({
    title, 
    onBackPress,
    onProfilePress,
    containerStyle,
    titleStyle,
}) => {
    const insets = useSafeAreaInsets();

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
        // Placeholder to balance the layout if the back button is missing
        <View style={styles.iconPlaceholder} />
    );

    const ProfileIcon = onProfilePress ? (
        <Pressable
            onPress={onProfilePress}
            style={styles.profileButton}
            hitSlop={10}
        >
            <View style={styles.profileCircle}>
                <Ionicons name="person" size={20} color={ICON_COLOR} />
            </View>
        </Pressable>
    ) : (
        // Placeholder to balance the layout if the profile button is missing
        <View style={styles.iconPlaceholder} />
    );

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

                {/* Høyre: profil ikon eller placeholder */}
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
      paddingBottom: 12, // <-- CORRECTED: Removed the syntax error here
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
      fontWeight: "600",
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