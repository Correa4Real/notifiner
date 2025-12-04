import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
} from "@/constants/theme";
import { AppNotification } from "@/types";
import { NotificationService } from "@/services/notificationService";
import { VolumeSlider } from "@/components/VolumeSlider";
import { SoundSelector } from "@/components/SoundSelector";
import { PreviewService } from "@/services/previewService";
import { AudioPickerService } from "@/services/audioPickerService";

export default function AppDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const appId = params.id as string;

  const [app, setApp] = useState<AppNotification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppDetails();
  }, [appId]);

  const loadAppDetails = async () => {
    try {
      setLoading(true);
      const appData = await NotificationService.getAppById(appId);
      setApp(appData);
    } catch (error) {
      console.error("Error loading app details:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateApp = async (updates: Partial<AppNotification>) => {
    if (!app) return;

    try {
      const validatedUpdates = { ...updates };
      if (typeof validatedUpdates.volume === "number") {
        validatedUpdates.volume = Math.max(
          0,
          Math.min(1, validatedUpdates.volume)
        );
      }

      const updatedApps = await NotificationService.updateAppSettings(
        app.id,
        validatedUpdates
      );
      const updatedApp = updatedApps.find((a) => a.id === app.id);
      if (updatedApp) {
        setApp(updatedApp);

        if (
          updatedApp.enabled &&
          (updates.volume !== undefined || updates.vibrate !== undefined)
        ) {
          const audioFile = await getAudioFileForApp(updatedApp);
          await PreviewService.previewWithSettings(
            updatedApp.sound || "default",
            updatedApp.soundType,
            updatedApp.soundUri,
            updatedApp.volume,
            updatedApp.vibrate,
            audioFile?.fileUri
          );
        }
      }
    } catch (error) {
      console.error("Error updating app:", error);
    }
  };

  const handleVolumePreview = async (volume: number) => {
    if (!app || !app.enabled) return;

    const audioFile = await getAudioFileForApp(app);
    await PreviewService.previewWithSettings(
      app.sound || "default",
      app.soundType,
      app.soundUri,
      volume,
      app.vibrate,
      audioFile?.fileUri
    );
  };

  const getAudioFileForApp = async (
    appData: AppNotification
  ): Promise<{ fileUri?: string } | null> => {
    if (appData.soundType === "custom" && appData.soundUri) {
      try {
        const audioFiles = await AudioPickerService.getAudioFiles();
        const audioFile = audioFiles.find(
          (file) => file.uri === appData.soundUri
        );
        return audioFile || null;
      } catch (error) {
        console.error("Error getting audio file:", error);
        return null;
      }
    }
    return null;
  };

  if (loading || !app) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {app.iconUri ? (
            <Image
              source={{ uri: app.iconUri }}
              style={styles.iconImage}
              resizeMode="contain"
            />
          ) : app.icon ? (
            <Text style={styles.iconText}>{app.icon}</Text>
          ) : (
            <MaterialIcons name="apps" size={48} color={colors.dark.primary} />
          )}
        </View>
        <Text style={styles.appName}>{app.appName}</Text>
        <Text style={styles.packageName}>{app.packageName}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons
            name="notifications"
            size={24}
            color={colors.dark.primary}
          />
          <Text style={styles.sectionTitle}>Notificações</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Ativar Notificações</Text>
          <Switch
            value={app.enabled}
            onValueChange={(value) => updateApp({ enabled: value })}
            trackColor={{
              false: colors.dark.surfaceVariant,
              true: colors.dark.primary,
            }}
            thumbColor={colors.dark.text}
          />
        </View>
      </View>

      {app.enabled && (
        <>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="volume-up"
                size={24}
                color={colors.dark.secondary}
              />
              <Text style={styles.sectionTitle}>Volume</Text>
            </View>
            <VolumeSlider
              value={app.volume}
              onValueChange={(value) => updateApp({ volume: value })}
              onPreview={handleVolumePreview}
              previewEnabled={true}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="library-music"
                size={24}
                color={colors.dark.accent}
              />
              <Text style={styles.sectionTitle}>Som de Notificação</Text>
            </View>
            <SoundSelector
              selectedSound={app.sound || "default"}
              selectedSoundUri={app.soundUri}
              volume={app.volume}
              vibrate={app.vibrate}
              onSoundSelect={(sound, soundType, soundUri) => {
                updateApp({
                  sound,
                  soundType,
                  soundUri,
                });
              }}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="vibration"
                size={24}
                color={colors.dark.warning}
              />
              <Text style={styles.sectionTitle}>Vibração</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Ativar Vibração</Text>
              <Switch
                value={app.vibrate}
                onValueChange={async (value) => {
                  await updateApp({ vibrate: value });
                  if (app.enabled && value) {
                    await PreviewService.previewWithSettings(
                      app.sound || "default",
                      app.soundType,
                      app.soundUri,
                      app.volume,
                      true
                    );
                  }
                }}
                trackColor={{
                  false: colors.dark.surfaceVariant,
                  true: colors.dark.primary,
                }}
                thumbColor={colors.dark.text}
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons
                name="priority-high"
                size={24}
                color={colors.dark.notification}
              />
              <Text style={styles.sectionTitle}>Prioridade</Text>
            </View>
            <View style={styles.priorityContainer}>
              {(["low", "normal", "high"] as const).map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.priorityButton,
                    app.priority === priority && styles.priorityButtonActive,
                  ]}
                  onPress={() => updateApp({ priority })}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      app.priority === priority && styles.priorityTextActive,
                    ]}
                  >
                    {priority === "low"
                      ? "Baixa"
                      : priority === "normal"
                      ? "Normal"
                      : "Alta"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  content: {
    padding: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.dark.textSecondary,
    textAlign: "center",
    marginTop: spacing.xxl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.dark.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
    ...shadows.md,
  },
  iconText: {
    fontSize: 40,
  },
  iconImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
  },
  appName: {
    ...typography.h2,
    color: colors.dark.text,
    marginBottom: spacing.xs,
  },
  packageName: {
    ...typography.caption,
    color: colors.dark.textSecondary,
  },
  section: {
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.dark.text,
    marginLeft: spacing.sm,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  settingLabel: {
    ...typography.body,
    color: colors.dark.text,
  },
  priorityContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  priorityButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.dark.surfaceVariant,
    alignItems: "center",
  },
  priorityButtonActive: {
    backgroundColor: colors.dark.primary,
  },
  priorityText: {
    ...typography.bodySmall,
    color: colors.dark.textSecondary,
    fontWeight: "600",
  },
  priorityTextActive: {
    color: colors.dark.text,
  },
});
