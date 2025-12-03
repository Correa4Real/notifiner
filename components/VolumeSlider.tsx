import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
} from "react-native";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";

interface VolumeSliderProps {
  readonly value: number;
  readonly onValueChange: (value: number) => void;
}

export function VolumeSlider({ value, onValueChange }: VolumeSliderProps) {
  const [sliderWidth, setSliderWidth] = useState(0);
  const percentage = Math.round(value * 100);
  const translateX = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (sliderWidth > 0) {
      Animated.timing(translateX, {
        toValue: value * (sliderWidth - 24),
        duration: 100,
        useNativeDriver: false,
      }).start();
    }
  }, [value, sliderWidth]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const newX = Math.max(
          0,
          Math.min(evt.nativeEvent.locationX - 12, sliderWidth - 24)
        );
        const newValue = Math.max(0, Math.min(1, newX / (sliderWidth - 24)));
        translateX.setValue(newX);
        onValueChange(newValue);
      },
      onPanResponderMove: (evt, gestureState) => {
        const newX = Math.max(
          0,
          Math.min(gestureState.moveX - 12, sliderWidth - 24)
        );
        translateX.setValue(newX);
        const newValue = Math.max(0, Math.min(1, newX / (sliderWidth - 24)));
        onValueChange(newValue);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const handleTrackPress = (evt: any) => {
    const { locationX } = evt.nativeEvent;
    const newX = Math.max(0, Math.min(locationX - 12, sliderWidth - 24));
    const newValue = Math.max(0, Math.min(1, newX / (sliderWidth - 24)));
    Animated.timing(translateX, {
      toValue: newX,
      duration: 100,
      useNativeDriver: false,
    }).start();
    onValueChange(newValue);
  };

  const trackFillWidth = translateX.interpolate({
    inputRange: [0, Math.max(1, sliderWidth - 24)],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });

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
          translateX.setValue(value * (width - 24));
        }}
      >
        <TouchableOpacity
          style={styles.track}
          activeOpacity={1}
          onPress={handleTrackPress}
        >
          <Animated.View
            style={[
              styles.trackFill,
              {
                width: trackFillWidth,
              },
            ]}
          />
        </TouchableOpacity>
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX }],
            },
          ]}
          {...panResponder.panHandlers}
        />
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
  track: {
    height: 4,
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.sm,
    position: "relative",
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
    top: -10,
    left: 0,
    shadowColor: colors.dark.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
