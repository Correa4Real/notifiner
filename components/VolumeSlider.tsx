import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableWithoutFeedback,
  PanResponder,
} from "react-native";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";

interface VolumeSliderProps {
  readonly value: number;
  readonly onValueChange: (value: number) => void;
  readonly onPreview?: (volume: number) => void;
  readonly previewEnabled?: boolean;
}

export function VolumeSlider({ 
  value, 
  onValueChange, 
  onPreview,
  previewEnabled = false 
}: VolumeSliderProps) {
  const [sliderWidth, setSliderWidth] = useState(0);
  const percentage = Math.round(value * 100);
  const previewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
    };
  }, []);

  const calculateValue = (x: number): number => {
    if (sliderWidth <= 0) return value;
    const clampedX = Math.max(0, Math.min(sliderWidth, x));
    return clampedX / sliderWidth;
  };

  const handleValueChange = (newValue: number) => {
    onValueChange(newValue);
    
    if (previewEnabled && onPreview) {
      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current);
      }
      
      previewTimeoutRef.current = setTimeout(() => {
        onPreview(newValue);
      }, 100);
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      if (sliderWidth <= 0) return;
      const { locationX } = evt.nativeEvent;
      const newValue = calculateValue(locationX);
      handleValueChange(newValue);
    },
    onPanResponderMove: (evt) => {
      if (sliderWidth <= 0) return;
      const { locationX } = evt.nativeEvent;
      const newValue = calculateValue(locationX);
      handleValueChange(newValue);
    },
    onPanResponderRelease: () => {},
  });

  const handlePress = (evt: any) => {
    if (sliderWidth <= 0) return;
    const { locationX } = evt.nativeEvent;
    const newValue = calculateValue(locationX);
    handleValueChange(newValue);
  };

  const thumbPosition = Math.max(0, Math.min(sliderWidth - 12, value * sliderWidth - 12));
  const fillWidth = value * 100;

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>Volume</Text>
        <Text style={styles.percentage}>{percentage}%</Text>
      </View>
      <View
        style={styles.sliderContainer}
        onLayout={(event) => {
          const { width } = event.nativeEvent.layout;
          setSliderWidth(width);
        }}
        {...panResponder.panHandlers}
      >
        <TouchableWithoutFeedback onPress={handlePress}>
          <View style={styles.trackContainer}>
            <View style={styles.track} />
            <View
              style={[
                styles.trackFill,
                {
                  width: `${fillWidth}%`,
                },
              ]}
            />
            <View
              style={[
                styles.thumb,
                {
                  left: thumbPosition,
                },
              ]}
            />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
  },
  labelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    color: colors.dark.text,
  },
  percentage: {
    ...typography.bodySmall,
    color: colors.dark.textSecondary,
    fontWeight: "600",
  },
  sliderContainer: {
    height: 40,
    justifyContent: "center",
    position: "relative",
  },
  trackContainer: {
    height: 40,
    justifyContent: "center",
    position: "relative",
  },
  track: {
    height: 4,
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.sm,
    position: "absolute",
    width: "100%",
  },
  trackFill: {
    height: 4,
    backgroundColor: colors.dark.primary,
    borderRadius: borderRadius.sm,
    position: "absolute",
    left: 0,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.dark.primary,
    position: "absolute",
    top: 8,
    shadowColor: colors.dark.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
