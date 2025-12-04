import { Platform, NativeModules, Alert } from "react-native";

const { NotificationServiceModule } = NativeModules;

class NotificationListenerService {
  static async isEnabled(): Promise<boolean> {
    if (Platform.OS !== "android" || !NotificationServiceModule) {
      return false;
    }

    try {
      return await NotificationServiceModule.isNotificationServiceEnabled();
    } catch (error) {
      console.error("Error checking notification service status:", error);
      return false;
    }
  }

  static async openSettings(): Promise<void> {
    if (Platform.OS !== "android" || !NotificationServiceModule) {
      Alert.alert(
        "Não Suportado",
        "Esta funcionalidade está disponível apenas no Android."
      );
      return;
    }

    try {
      await NotificationServiceModule.openNotificationSettings();
    } catch (error) {
      console.error("Error opening notification settings:", error);
      Alert.alert(
        "Erro",
        "Não foi possível abrir as configurações de notificação."
      );
    }
  }

  static async syncSettings(settings: any): Promise<boolean> {
    if (Platform.OS !== "android" || !NotificationServiceModule) {
      return false;
    }

    try {
      const settingsJson = JSON.stringify(settings);
      return await NotificationServiceModule.syncSettings(settingsJson);
    } catch (error) {
      console.error("Error syncing settings:", error);
      return false;
    }
  }
}

export { NotificationListenerService };

