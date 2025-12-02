import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Step = {
    id: number;
    label: string;
};

type Props = { 
    steps: Step[];
    currentStep: number;
};

export const stepProgress: React.FC<Props> = ({ steps, currentStep }) => {
    return (
        <View style={styles.container}>
            {steps.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;
                const isLast = index === steps.length - 1;

                return (
                    <View key={step.id} style={styles.stepWrapper}>
                        {/*Sirkel med nummer */}
                        <View
                            style={[
                                styles.circleBase,
                                isCompleted && styles.circleCompleted,
                                isCurrent && styles.circleCurrent,
                            ]}
                        >
                            <Text 
                                style={[
                                    styles.circleText,
                                    (isCompleted || isCurrent) && styles.circleTextActive,
                                ]}
                            >
                                {step.id.toString().padStart(2, "0")}
                            </Text>
                        </View>

                        {/* Linje til neste steg */}
                        {!isLast && (
                            <View
                                style={[
                                    styles.line,
                                    (isCompleted || isCurrent) && styles.lineActive,
                                ]}
                            />
                        )}

                        {/* Label under sirkelen */}
                        <View style={styles.labelContainer}>
                            <Text
                                style={[
                                    styles.label,
                                    (isCompleted || isCurrent) && styles.labelActive,
                                ]}
                            >
                                {step.label}
                            </Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const CIRCLE_SIZE = 48;

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
      },
      stepWrapper: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
      },
      circleBase: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: CIRCLE_SIZE / 2,
        borderWidth: 2,
        borderColor: "#5B8F74", // grønn kant
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
      },
      circleCompleted: {
        backgroundColor: "#5B8F74", // fylt grønn
      },
      circleCurrent: {
        backgroundColor: "#5B8F74",
        borderWidth: 4, // litt tykkere kant = "dobbel ring"-følelse
      },
      circleText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#5B8F74",
      },
      circleTextActive: {
        color: "white",
      },
      line: {
        flex: 1,
        height: 3,
        backgroundColor: "#D0D0D0",
        marginHorizontal: 4,
      },
      lineActive: {
        backgroundColor: "#5B8F74",
      },
      labelContainer: {
        position: "absolute",
        top: CIRCLE_SIZE + 8,
        left: 0,
        right: 0,
        alignItems: "center",
      },
      label: {
        fontSize: 16,
        color: "#B0B0B0",
      },
      labelActive: {
        color: "#4A4A4A",
        fontWeight: "500",
      },
});