import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Step = {
  id: number;
  label?: string; // label er valgfri nå, men du bruker den ikke
};

type Props = {
  steps: Step[];
  currentStep: number;
};

export const StepProgress: React.FC<Props> = ({ steps, currentStep }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCurrent = step.id === currentStep;
        const isActiveOrCompleted = step.id <= currentStep;

        return (
          <View key={step.id} style={styles.stepWrapper}>
            {/* Sirkel */}
            <View
              style={[
                styles.circle,
                isCurrent && styles.circleCurrent,
                isActiveOrCompleted && styles.circleFilled,
              ]}
            >
              <Text
                style={[
                  styles.circleText,
                  isActiveOrCompleted && styles.circleTextActive,
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
                  isActiveOrCompleted && styles.lineActive,
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
};

const CIRCLE_SIZE = 32;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: "#5B8F74",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  circleCurrent: {
    // aktuell sirkel – litt ekstra markeringsfølelse
    borderWidth: 2,
  },
  circleFilled: {
    backgroundColor: "#5B8F74",
  },
  circleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5B8F74",
  },
  circleTextActive: {
    color: "#FFFFFF",
  },
  line: {
    width: 48,
    height: 2,
    left: 6,
    backgroundColor: "#D0D0D0",
    marginHorizontal: 4,
  },
  lineActive: {
    backgroundColor: "#5B8F74",
  },
});