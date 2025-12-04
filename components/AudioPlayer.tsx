import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";

interface AudioPlayerProps {
  readonly soundUri: string;
  readonly soundType?: "system" | "custom";
  readonly volume?: number;
  readonly fileUri?: string;
  readonly localSoundAsset?: any;
}

export function AudioPlayer({
  soundUri,
  soundType,
  volume = 1.0,
  fileUri,
  localSoundAsset,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      stop();
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const stop = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setIsPlaying(false);
      setProgress(0);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } catch (error) {
      console.error("Error stopping audio:", error);
    }
  };

  const play = async () => {
    try {
      if (isPlaying) {
        await stop();
        return;
      }

      setIsLoading(true);

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      let soundSource: any;
      if (localSoundAsset) {
        soundSource = localSoundAsset;
      } else if (fileUri && fileUri.startsWith("file://")) {
        soundSource = { uri: fileUri };
      } else if (soundUri.startsWith("content://") || soundUri.startsWith("file://")) {
        soundSource = { uri: soundUri };
      } else {
        soundSource = { uri: soundUri };
      }

      const { sound } = await Audio.Sound.createAsync(soundSource, {
        shouldPlay: true,
        volume: Math.max(0, Math.min(1, volume)),
        isLooping: false,
      });

      soundRef.current = sound;
      setIsPlaying(true);
      setIsLoading(false);

      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          if (status.durationMillis) {
            setDuration(status.durationMillis);
          }
          if (status.positionMillis !== undefined) {
            const progressValue = status.durationMillis
              ? status.positionMillis / status.durationMillis
              : 0;
            setProgress(progressValue);
          }
          if (status.didJustFinish) {
            setIsPlaying(false);
            setProgress(0);
            if (progressIntervalRef.current) {
              clearInterval(progressIntervalRef.current);
              progressIntervalRef.current = null;
            }
          }
        }
      });

      progressIntervalRef.current = setInterval(async () => {
        if (soundRef.current) {
          try {
            const status = await soundRef.current.getStatusAsync();
            if (status.isLoaded && status.positionMillis !== undefined) {
              const progressValue = status.durationMillis
                ? status.positionMillis / status.durationMillis
                : 0;
              setProgress(progressValue);
            }
          } catch (error) {
            console.error("Error getting playback status:", error);
          }
        }
      }, 100);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.playButton}
        onPress={play}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.dark.primary} />
        ) : (
          <MaterialIcons
            name={isPlaying ? "pause" : "play-arrow"}
            size={24}
            color={colors.dark.primary}
          />
        )}
      </TouchableOpacity>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progress * 100}%`,
              },
            ]}
          />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {formatTime(progress * duration)}
          </Text>
          <Text style={styles.timeText}>
            {formatTime(duration)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.dark.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
  },
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.sm,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.dark.primary,
    borderRadius: borderRadius.sm,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    ...typography.caption,
    color: colors.dark.textSecondary,
  },
});

