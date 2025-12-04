import { Platform, NativeModules, PermissionsAndroid } from "react-native";
import { AppNotification } from "@/types";

interface InstalledAppInfo {
  packageName: string;
  appName: string;
  iconBase64?: string;
}

class InstalledAppsService {
  private static async requestAndroidPermissions(): Promise<boolean> {
    if (Platform.OS !== "android") {
      return true;
    }

    try {
      const apiLevel = Platform.Version;
      
      if (apiLevel >= 30) {
        const permission = "android.permission.QUERY_ALL_PACKAGES";
        const granted = await PermissionsAndroid.request(permission,
          {
            title: "Permissão de Acesso a Apps",
            message:
              "Este app precisa de permissão para listar aplicativos instalados e gerenciar suas notificações.",
            buttonNeutral: "Perguntar Depois",
            buttonNegative: "Cancelar",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      
      return true;
    } catch (error) {
      console.error("Error requesting Android permissions:", error);
      return false;
    }
  }

  private static async getInstalledAppsAndroid(): Promise<InstalledAppInfo[]> {
    try {
      const hasPermission = await this.requestAndroidPermissions();
      if (!hasPermission) {
        console.warn("Permission not granted for accessing installed apps");
        return [];
      }

      if (NativeModules.InstalledAppsModule) {
        console.log("InstalledAppsModule found, calling getInstalledApps...");
        const apps = await NativeModules.InstalledAppsModule.getInstalledApps();
        console.log(`Received ${apps?.length || 0} apps from native module`);
        if (apps && Array.isArray(apps) && apps.length > 0) {
          return apps;
        }
        if (apps && Array.isArray(apps) && apps.length === 0) {
          console.warn("Native module returned empty array");
          return [];
        }
      } else {
        console.warn("InstalledAppsModule not found in NativeModules");
      }
      
      console.warn("Native module not available or returned no apps, using fallback");
      return this.getMockAppsForTesting();
    } catch (error) {
      console.error("Error getting installed apps (Android):", error);
      return this.getMockAppsForTesting();
    }
  }

  private static async getInstalledAppsIOS(): Promise<InstalledAppInfo[]> {
    try {
      if (NativeModules.InstalledAppsModule) {
        const apps = await NativeModules.InstalledAppsModule.getInstalledApps();
        if (apps && Array.isArray(apps) && apps.length > 0) {
          return apps;
        }
      }
      
      console.warn("Native module not available for iOS, using fallback");
      return this.getMockAppsForTesting();
    } catch (error) {
      console.error("Error getting installed apps (iOS):", error);
      return this.getMockAppsForTesting();
    }
  }

  private static getMockAppsForTesting(): InstalledAppInfo[] {
    return [
      {
        packageName: "com.whatsapp",
        appName: "WhatsApp",
      },
      {
        packageName: "com.google.android.gm",
        appName: "Gmail",
      },
      {
        packageName: "com.instagram.android",
        appName: "Instagram",
      },
      {
        packageName: "org.telegram.messenger",
        appName: "Telegram",
      },
      {
        packageName: "com.twitter.android",
        appName: "Twitter",
      },
    ];
  }

  static async getInstalledApps(): Promise<InstalledAppInfo[]> {
    if (Platform.OS === "android") {
      return this.getInstalledAppsAndroid();
    } else if (Platform.OS === "ios") {
      return this.getInstalledAppsIOS();
    }
    return [];
  }

  static convertToAppNotification(
    appInfo: InstalledAppInfo,
    existingSettings?: AppNotification
  ): AppNotification {
    const iconUri = appInfo.iconBase64
      ? `data:image/png;base64,${appInfo.iconBase64}`
      : undefined;

    return {
      id: appInfo.packageName,
      appName: appInfo.appName,
      packageName: appInfo.packageName,
      iconUri,
      enabled: existingSettings?.enabled ?? true,
      sound: existingSettings?.sound ?? "default",
      soundType: existingSettings?.soundType ?? "system",
      soundUri: existingSettings?.soundUri,
      volume: existingSettings?.volume ?? 0.8,
      vibrate: existingSettings?.vibrate ?? true,
      priority: existingSettings?.priority ?? "normal",
    };
  }
}

export { InstalledAppsService };

