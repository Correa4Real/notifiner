import * as Notifications from "expo-notifications";
import { Platform, PermissionsAndroid, Alert } from "react-native";

class PermissionService {
  static async requestNotificationPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        return false;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  }

  static async requestInstalledAppsPermission(): Promise<boolean> {
    if (Platform.OS !== "android") {
      return true;
    }

    try {
      const apiLevel = Platform.Version;
      
      if (apiLevel >= 30) {
        const permission = "android.permission.QUERY_ALL_PACKAGES";
        const hasPermission = await PermissionsAndroid.check(permission);

        if (!hasPermission) {
          const granted = await PermissionsAndroid.request(permission,
            {
              title: "Permissão de Acesso a Apps",
              message:
                "Este app precisa de permissão para listar aplicativos instalados e gerenciar suas notificações. Esta permissão é essencial para o funcionamento do app.",
              buttonNeutral: "Perguntar Depois",
              buttonNegative: "Cancelar",
              buttonPositive: "Permitir",
            }
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert(
              "Permissão Necessária",
              "Para gerenciar notificações de outros apps, é necessário conceder a permissão de acesso à lista de aplicativos instalados. Por favor, ative nas configurações do dispositivo.",
              [{ text: "OK" }]
            );
            return false;
          }
        }
      }

      return true;
    } catch (error) {
      console.error("Error requesting installed apps permission:", error);
      return false;
    }
  }

  static async checkNotificationPermissions(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error checking permissions:", error);
      return false;
    }
  }

  static async requestAudioPermission(): Promise<boolean> {
    if (Platform.OS !== "android") {
      return true;
    }

    try {
      const apiLevel = Platform.Version;
      let permission: string;

      if (apiLevel >= 33) {
        permission = "android.permission.READ_MEDIA_AUDIO";
      } else if (apiLevel >= 30) {
        permission = "android.permission.READ_EXTERNAL_STORAGE";
      } else {
        permission = "android.permission.READ_EXTERNAL_STORAGE";
      }

      const hasPermission = await PermissionsAndroid.check(permission);
      
      if (hasPermission) {
        return true;
      }

      const granted = await PermissionsAndroid.request(permission, {
        title: "Permissão de Acesso a Áudios",
        message:
          "Este app precisa de permissão para acessar arquivos de áudio do dispositivo para que você possa escolher sons personalizados para notificações.",
        buttonNeutral: "Perguntar Depois",
        buttonNegative: "Cancelar",
        buttonPositive: "Permitir",
      });

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          "Permissão Necessária",
          "Para escolher músicas personalizadas, é necessário conceder a permissão de acesso a arquivos de áudio. Por favor, ative nas configurações do dispositivo.",
          [{ text: "OK" }]
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error requesting audio permission:", error);
      return false;
    }
  }
}

export { PermissionService };
