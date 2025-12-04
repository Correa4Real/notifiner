import { Platform, NativeModules } from "react-native";
import { PermissionService } from "./permissionService";

const { AudioPickerModule } = NativeModules;

export interface AudioFile {
  id: string;
  name: string;
  title: string;
  artist: string;
  duration: number;
  uri: string;
  fileUri?: string;
  path: string;
  mimeType?: string;
  extension?: string;
}

class AudioPickerService {
  static async getAudioFiles(): Promise<AudioFile[]> {
    if (Platform.OS !== "android" || !AudioPickerModule) {
      console.warn("AudioPickerModule not available");
      return [];
    }

    try {
      console.log("=== [AudioPickerService] Checking audio permission ===");
      const hasPermission = await PermissionService.requestAudioPermission();
      if (!hasPermission) {
        console.warn("Audio permission not granted");
        return [];
      }

      console.log("=== [AudioPickerService] Requesting audio files ===");
      let audioFiles = await AudioPickerModule.getAudioFiles();
      console.log(
        `=== [AudioPickerService] Received ${
          audioFiles?.length || 0
        } audio files ===`
      );

      if (!audioFiles || audioFiles.length === 0) {
        console.warn("=== [AudioPickerService] NO AUDIO FILES FOUND ===");
        console.warn("Attempting to trigger MediaStore scan...");
        
        try {
          await AudioPickerModule.triggerMediaStoreScan();
          console.log("MediaStore scan triggered, waiting 2 seconds...");
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          console.log("Retrying audio files query...");
          audioFiles = await AudioPickerModule.getAudioFiles();
          console.log(
            `=== [AudioPickerService] After scan: ${audioFiles?.length || 0} audio files ===`
          );
        } catch (scanError) {
          console.error("Failed to trigger MediaStore scan:", scanError);
        }
        
        if (!audioFiles || audioFiles.length === 0) {
          console.warn("Still no files found after scan. Possible reasons:");
          console.warn("1. MediaStore hasn't indexed the files yet (may take time)");
          console.warn("2. Files are in a location MediaStore doesn't scan");
          console.warn("3. Permission issue - check READ_MEDIA_AUDIO permission");
          console.warn("4. Files don't match supported extensions");
          console.warn("5. On emulator, files may need to be in specific folders");
          return [];
        }
      }

      console.log("=== [AudioPickerService] Sample files (first 5) ===");
      audioFiles.slice(0, 5).forEach((f: AudioFile, index: number) => {
        console.log(`File ${index + 1}:`, {
          name: f.name,
          extension: f.extension,
          path: f.path?.substring(0, 80),
          size: f.path?.length,
          hasFileUri: !!f.fileUri,
        });
      });

      const extensions = audioFiles
        .map((f: AudioFile) => f.extension)
        .filter(Boolean);
      const uniqueExtensions = [...new Set(extensions)];
      console.log(
        `=== [AudioPickerService] Extensions found: ${uniqueExtensions.join(
          ", "
        )} ===`
      );

      return audioFiles || [];
    } catch (error) {
      console.error("=== [AudioPickerService] ERROR ===", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      return [];
    }
  }
}

export { AudioPickerService };
