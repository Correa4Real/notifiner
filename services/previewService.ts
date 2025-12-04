import { Audio } from "expo-av";
import { Vibration, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import AudioPlayerModule from "@/modules/AudioPlayerModule";

class PreviewService {
  private static soundInstance: Audio.Sound | null = null;
  private static isPlaying = false;
  private static audioModeConfigured = false;

  static getSoundInstance(): Audio.Sound | null {
    return this.soundInstance;
  }

  static async isCurrentlyPlaying(): Promise<boolean> {
    if (!this.soundInstance) return false;
    try {
      const status = await this.soundInstance.getStatusAsync();
      return status.isLoaded && (status.isPlaying || this.isPlaying);
    } catch {
      return this.isPlaying;
    }
  }

  static async setVolume(volume: number): Promise<void> {
    if (this.soundInstance) {
      try {
        const status = await this.soundInstance.getStatusAsync();
        if (status.isLoaded) {
          const clampedVolume = Math.max(0, Math.min(1, volume));
          await this.soundInstance.setVolumeAsync(clampedVolume);
        }
      } catch (error) {
        // Ignore errors
      }
    }
  }

  private static async ensureAudioMode(): Promise<void> {
    if (this.audioModeConfigured) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.audioModeConfigured = true;
    } catch (error) {
      // Ignore keep awake errors
      if (error && typeof error === "object" && "message" in error) {
        const errorMessage = String(error.message);
        if (
          errorMessage.includes("keep awake") ||
          errorMessage.includes("KeepAwake")
        ) {
          // This is expected and can be ignored
          this.audioModeConfigured = true;
          return;
        }
      }
      // Only log non-keep-awake errors
      console.error("Error setting audio mode:", error);
    }
  }

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
      await this.stopPreview();

      await this.ensureAudioMode();

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
      this.soundInstance = null;
      throw error;
    }
  }

  static async previewLocalSound(
    soundAsset: any,
    volume: number,
    vibrate: boolean,
    vibrationIntensity: number = 1.0
  ): Promise<void> {
    try {
      await this.stopPreview();

      await this.ensureAudioMode();

      if (vibrate) {
        this.previewVibration(vibrationIntensity);
      }

      if (!soundAsset) {
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
      this.soundInstance = null;
    }
  }

  static previewVibration(intensity: number): void {
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
        try {
          const status = await this.soundInstance.getStatusAsync();
          if (status.isLoaded) {
            try {
              await this.soundInstance.stopAsync();
            } catch (error) {
              // Ignore errors if already stopped
            }
            try {
              await this.soundInstance.unloadAsync();
            } catch (error) {
              // Ignore errors if already unloaded
            }
          }
        } catch (error) {
          // Ignore errors if sound is not loaded
        }
        this.soundInstance = null;
      }
      this.isPlaying = false;
      Vibration.cancel();
    } catch (error) {
      // Ignore all errors in stopPreview
    }
  }

  static async previewWithSettings(
    sound: string,
    soundType: "system" | "custom" | undefined,
    soundUri: string | undefined,
    volume: number,
    vibrate: boolean,
    fileUri?: string,
    localSoundAsset?: any,
    vibrationIntensity: number = 1.0
  ): Promise<void> {
    try {
      if (this.soundInstance) {
        await this.setVolume(volume);
        return;
      }

      await this.stopPreview();

      if (vibrate) {
        this.previewVibration(vibrationIntensity);
      }

      if (volume > 0) {
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
              vibrate,
              vibrationIntensity
            );
            return;
          } else {
            console.warn(`Som local não encontrado: ${localSoundId}`);
          }
        }

        if (soundType === "custom" && soundUri) {
          const uriToUse = soundUri.startsWith("content://")
            ? soundUri
            : fileUri || soundUri;
          await this.playSound(uriToUse, "custom", volume);
        } else {
          await this.playSystemNotificationSound(
            volume,
            vibrate,
            vibrationIntensity
          );
        }
      }
    } catch (error) {
      console.error("Error previewing with settings:", error);
    }
  }

  private static async playSystemNotificationSound(
    volume: number,
    vibrate: boolean,
    vibrationIntensity: number = 1.0
  ): Promise<void> {
    try {
      await this.ensureAudioMode();

      if (vibrate) {
        this.previewVibration(vibrationIntensity);
      }

      // Try to play a system notification sound using Audio
      // On Android, we can use a default notification sound URI
      const defaultSoundUri = "content://settings/system/notification_sound";

      try {
        if (this.soundInstance) {
          try {
            await this.soundInstance.unloadAsync();
          } catch (error) {
            console.warn("Error unloading previous sound:", error);
          }
          this.soundInstance = null;
        }

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
          if (status.isLoaded) {
            if (status.didJustFinish) {
              this.isPlaying = false;
            } else if (status.isPlaying) {
              this.isPlaying = true;
            }
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
            this.previewVibration(vibrationIntensity);
          }
        }
      }
    } catch (error) {
      console.error("Error playing system notification sound:", error);
      this.soundInstance = null;
      if (vibrate) {
        this.previewVibration(vibrationIntensity);
      }
    }
  }
}

export { PreviewService };
