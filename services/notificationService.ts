import * as SecureStore from "expo-secure-store";
import { AppNotification, NotificationSettings } from "@/types";
import { InstalledAppsService } from "./installedAppsService";

const STORAGE_KEY = "notification_settings";

class NotificationService {
  private static async getStoredSettings(): Promise<NotificationSettings> {
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error reading stored settings:", error);
    }
    return {
      apps: [],
      globalVolume: 1,
      doNotDisturb: false,
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "08:00",
      },
    };
  }

  private static async saveSettings(
    settings: NotificationSettings
  ): Promise<void> {
    try {
      const settingsWithoutIcons = {
        ...settings,
        apps: settings.apps.map((app) => {
          const { iconUri, ...appWithoutIcon } = app;
          return appWithoutIcon;
        }),
      };
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(settingsWithoutIcons));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }

  static async getInstalledApps(): Promise<AppNotification[]> {
    try {
      const installedAppsInfo = await InstalledAppsService.getInstalledApps();
      const settings = await this.getStoredSettings();

      const appsMap = new Map<string, Omit<AppNotification, "iconUri">>();
      
      settings.apps.forEach((app) => {
        const { iconUri, ...appWithoutIcon } = app;
        appsMap.set(app.packageName, appWithoutIcon);
      });

      const apps: AppNotification[] = installedAppsInfo.map((appInfo) => {
        const existingApp = appsMap.get(appInfo.packageName);
        return InstalledAppsService.convertToAppNotification(
          appInfo,
          existingApp
        );
      });

      if (apps.length > 0 && apps.length !== settings.apps.length) {
        const updatedSettings = {
          ...settings,
          apps: apps.map((app) => {
            const { iconUri, ...appWithoutIcon } = app;
            return appWithoutIcon;
          }),
        };
        await this.saveSettings(updatedSettings);
      }

      return apps;
    } catch (error) {
      console.error("Error getting installed apps:", error);
      const settings = await this.getStoredSettings();
      return settings.apps.length > 0 ? settings.apps : [];
    }
  }


  static async toggleAppNotification(
    appId: string
  ): Promise<AppNotification[]> {
    const settings = await this.getStoredSettings();
    const appIndex = settings.apps.findIndex((app) => app.id === appId);

    if (appIndex >= 0) {
      settings.apps[appIndex].enabled = !settings.apps[appIndex].enabled;
      await this.saveSettings(settings);
    }

    return await this.getInstalledApps();
  }

  static async updateAppSettings(
    appId: string,
    updates: Partial<AppNotification>
  ): Promise<AppNotification[]> {
    const settings = await this.getStoredSettings();
    const appIndex = settings.apps.findIndex((app) => app.id === appId);

    if (appIndex >= 0) {
      const { iconUri, ...updatesWithoutIcon } = updates;
      settings.apps[appIndex] = { ...settings.apps[appIndex], ...updatesWithoutIcon };
      await this.saveSettings(settings);
    }

    return await this.getInstalledApps();
  }

  static async getAppById(appId: string): Promise<AppNotification | null> {
    const apps = await this.getInstalledApps();
    return apps.find((a) => a.id === appId) ?? null;
  }
}

export { NotificationService };
