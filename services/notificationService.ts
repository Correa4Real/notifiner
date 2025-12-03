import * as SecureStore from "expo-secure-store";
import { AppNotification, NotificationSettings } from "@/types";

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
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }

  static async getInstalledApps(): Promise<AppNotification[]> {
    const settings = await this.getStoredSettings();

    if (settings.apps.length === 0) {
      return this.getMockApps();
    }

    return settings.apps;
  }

  private static getMockApps(): AppNotification[] {
    return [
      {
        id: "1",
        appName: "WhatsApp",
        packageName: "com.whatsapp",
        icon: "💬",
        enabled: true,
        sound: "default",
        volume: 0.8,
        vibrate: true,
        priority: "high",
      },
      {
        id: "2",
        appName: "Gmail",
        packageName: "com.google.android.gm",
        icon: "📧",
        enabled: true,
        sound: "default",
        volume: 0.6,
        vibrate: false,
        priority: "normal",
      },
      {
        id: "3",
        appName: "Instagram",
        packageName: "com.instagram.android",
        icon: "📷",
        enabled: true,
        sound: "default",
        volume: 0.7,
        vibrate: true,
        priority: "normal",
      },
      {
        id: "4",
        appName: "Telegram",
        packageName: "org.telegram.messenger",
        icon: "✈️",
        enabled: false,
        sound: "default",
        volume: 0.9,
        vibrate: true,
        priority: "high",
      },
      {
        id: "5",
        appName: "Twitter",
        packageName: "com.twitter.android",
        icon: "🐦",
        enabled: true,
        sound: "default",
        volume: 0.5,
        vibrate: false,
        priority: "low",
      },
    ];
  }

  static async toggleAppNotification(
    appId: string
  ): Promise<AppNotification[]> {
    const settings = await this.getStoredSettings();
    const appIndex = settings.apps.findIndex((app) => app.id === appId);

    if (appIndex >= 0) {
      settings.apps[appIndex].enabled = !settings.apps[appIndex].enabled;
    } else {
      const mockApps = this.getMockApps();
      const app = mockApps.find((a) => a.id === appId);
      if (app) {
        app.enabled = !app.enabled;
        if (settings.apps.length === 0) {
          settings.apps = mockApps;
        } else {
          const existingIndex = settings.apps.findIndex((a) => a.id === appId);
          if (existingIndex >= 0) {
            settings.apps[existingIndex] = app;
          } else {
            settings.apps.push(app);
          }
        }
      }
    }

    await this.saveSettings(settings);
    return settings.apps;
  }

  static async updateAppSettings(
    appId: string,
    updates: Partial<AppNotification>
  ): Promise<AppNotification[]> {
    const settings = await this.getStoredSettings();
    const appIndex = settings.apps.findIndex((app) => app.id === appId);

    if (appIndex >= 0) {
      settings.apps[appIndex] = { ...settings.apps[appIndex], ...updates };
    } else {
      const mockApps = this.getMockApps();
      const app = mockApps.find((a) => a.id === appId);
      if (app) {
        const updatedApp = { ...app, ...updates };
        if (settings.apps.length === 0) {
          settings.apps = mockApps;
        }
        const existingIndex = settings.apps.findIndex((a) => a.id === appId);
        if (existingIndex >= 0) {
          settings.apps[existingIndex] = updatedApp;
        } else {
          settings.apps.push(updatedApp);
        }
      }
    }

    await this.saveSettings(settings);
    return settings.apps;
  }

  static async getAppById(appId: string): Promise<AppNotification | null> {
    const settings = await this.getStoredSettings();
    let app = settings.apps.find((a) => a.id === appId);

    if (app) {
      return app;
    }

    const mockApps = this.getMockApps();
    const mockApp = mockApps.find((a) => a.id === appId);
    return mockApp ?? null;
  }
}

export { NotificationService };
