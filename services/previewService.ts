import { Audio } from "expo-av";
import { Vibration, Platform } from "react-native";
import * as Notifications from "expo-notifications";

class PreviewService {
  private static soundInstance: Audio.Sound | null = null;
  private static isPlaying = false;

  static async previewSound(
    soundUri: string | null,
    soundType: "system" | "custom" | undefined,
    volume: number,
    vibrate: boolean,
    vibrationIntensity: number = 1.0
  ): Promise<void> {
    try {
      if (this.isPlaying) {
        await this.stopPreview();
      }

      if (vibrate) {
        this.previewVibration(vibrationIntensity);
      }

      if (volume > 0 && soundUri) {
        await this.playSound(soundUri, soundType, volume);
      }
    } catch (error) {
      console.error("Error previewing sound:", error);
    }
  }

  private static async playSound(
    soundUri: string,
    soundType: "system" | "custom" | undefined,
    volume: number
  ): Promise<void> {
    try {
      if (this.soundInstance) {
        await this.soundInstance.unloadAsync();
      }

      let uriToUse = soundUri;

      if (soundUri.startsWith("file://")) {
        uriToUse = soundUri;
      } else if (soundUri.startsWith("content://")) {
        uriToUse = soundUri;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: uriToUse },
        {
          shouldPlay: true,
          volume: Math.max(0, Math.min(1, volume)),
          isLooping: false,
        }
      );

      this.soundInstance = sound;
      this.isPlaying = true;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.isPlaying = false;
        }
      });
    } catch (error) {
      console.error("Error playing sound:", error);
      this.isPlaying = false;
      throw error;
    }
  }

  static async previewLocalSound(
    soundAsset: any,
    volume: number,
    vibrate: boolean
  ): Promise<void> {
    try {
      if (this.isPlaying) {
        await this.stopPreview();
      }

      if (vibrate) {
        this.previewVibration(1.0);
      }

      if (this.soundInstance) {
        await this.soundInstance.unloadAsync();
      }

      // Check if soundAsset is valid
      if (!soundAsset) {
        console.warn("Sound asset is null or undefined");
        return;
      }

      const { sound } = await Audio.Sound.createAsync(soundAsset, {
        shouldPlay: true,
        volume: Math.max(0, Math.min(1, volume)),
        isLooping: false,
      });

      this.soundInstance = sound;
      this.isPlaying = true;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.isPlaying = false;
        }
      });
    } catch (error) {
      console.error("Error playing local sound:", error);
      this.isPlaying = false;
    }
  }

  private static previewVibration(intensity: number): void {
    if (Platform.OS !== "android" && Platform.OS !== "ios") {
      return;
    }

    const basePattern = [0, 250, 250, 250];
    const adjustedPattern = basePattern.map((value, index) => {
      if (index === 0) return value;
      return Math.round(value * intensity);
    });

    Vibration.vibrate(adjustedPattern);
  }

  static async stopPreview(): Promise<void> {
    try {
      if (this.soundInstance) {
        await this.soundInstance.stopAsync();
        await this.soundInstance.unloadAsync();
        this.soundInstance = null;
      }
      this.isPlaying = false;
      Vibration.cancel();
    } catch (error) {
      console.error("Error stopping preview:", error);
    }
  }

  static async previewWithSettings(
    sound: string,
    soundType: "system" | "custom" | undefined,
    soundUri: string | undefined,
    volume: number,
    vibrate: boolean,
    fileUri?: string
  ): Promise<void> {
    try {
      if (this.isPlaying) {
        await this.stopPreview();
      }

      if (vibrate) {
        this.previewVibration(1.0);
      }

      if (volume > 0) {
        // Check if it's a local sound (starts with "local:")
        if (soundUri && soundUri.startsWith("local:")) {
          const localSoundId = soundUri.replace("local:", "");
          let localSounds: Record<string, any> = {};

          try {
            localSounds = {
              swiftly: require("@/assets/sounds/swiftly.ogg"),
              succeeded: require("@/assets/sounds/succeeded-message-tone.ogg"),
              newNotification: require("@/assets/sounds/new-notification.ogg"),
              noProblem: require("@/assets/sounds/no-problem.ogg"),
              hey: require("@/assets/sounds/hey.ogg"),
              thatWasQuick: require("@/assets/sounds/that-was-quick.ogg"),
              rapaiz: require("@/assets/sounds/rapaiz.mp3"),
              bentivi: require("@/assets/sounds/bentivi.mp3"),
              steamSound: require("@/assets/sounds/SteamSound.mp3"),
            };
          } catch (error) {
            console.warn("Sons locais não encontrados:", error);
            return;
          }

          if (localSounds[localSoundId]) {
            await this.previewLocalSound(
              localSounds[localSoundId],
              volume,
              vibrate
            );
            return;
          } else {
            console.warn(`Som local não encontrado: ${localSoundId}`);
          }
        }

        if (soundType === "custom" && soundUri) {
          let uriToUse: string | null = null;

          if (fileUri && fileUri.startsWith("file://")) {
            uriToUse = fileUri;
          } else if (soundUri.startsWith("content://")) {
            uriToUse = soundUri;
          }

          if (uriToUse) {
            try {
              await this.playSound(uriToUse, "custom", volume);
            } catch (error) {
              console.error("Failed to play sound:", error);
              if (
                fileUri &&
                fileUri.startsWith("file://") &&
                uriToUse !== fileUri
              ) {
                try {
                  await this.playSound(fileUri, "custom", volume);
                } catch (fallbackError) {
                  console.error("Failed to play with file URI:", fallbackError);
                }
              }
            }
          }
        } else {
          await this.playSystemNotificationSound(volume, false);
        }
      }
    } catch (error) {
      console.error("Error previewing with settings:", error);
    }
  }

  private static async playSystemNotificationSound(
    volume: number,
    vibrate: boolean
  ): Promise<void> {
    try {
      if (vibrate) {
        this.previewVibration(1.0);
      }

      // Try to play a system notification sound using Audio
      // On Android, we can use a default notification sound URI
      const defaultSoundUri = "content://settings/system/notification_sound";

      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: defaultSoundUri },
          {
            shouldPlay: true,
            volume: Math.max(0, Math.min(1, volume)),
            isLooping: false,
          }
        );

        this.soundInstance = sound;
        this.isPlaying = true;

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            this.isPlaying = false;
          }
        });
      } catch (audioError) {
        console.warn(
          "Failed to play default sound URI, trying notification:",
          audioError
        );

        // Fallback: use expo-notifications
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "Preview",
              body: "Teste de notificação",
              sound: true,
            },
            trigger: null,
          });
        } catch (notifError) {
          console.error("Failed to play notification sound:", notifError);
          // Last resort: just vibrate
          if (vibrate) {
            this.previewVibration(1.0);
          }
        }
      }
    } catch (error) {
      console.error("Error playing system notification sound:", error);
      if (vibrate) {
        this.previewVibration(1.0);
      }
    }
  }
}

export { PreviewService };
