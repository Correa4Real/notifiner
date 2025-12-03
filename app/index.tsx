import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
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
import { PermissionService } from "@/services/permissionService";

export default function HomeScreen() {
  const router = useRouter();
  const [apps, setApps] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    const hasPermission =
      await PermissionService.checkNotificationPermissions();
    if (!hasPermission) {
      const granted = await PermissionService.requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          "Permissão Necessária",
          "Este app precisa de permissão para gerenciar notificações. Por favor, ative nas configurações.",
          [{ text: "OK" }]
        );
      }
    }
    loadApps();
  };

  const loadApps = async () => {
    try {
      setLoading(true);
      const loadedApps = await NotificationService.getInstalledApps();
      setApps(loadedApps);
    } catch (error) {
      console.error("Error loading apps:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAppNotification = async (appId: string) => {
    try {
      const updatedApps = await NotificationService.toggleAppNotification(
        appId
      );
      setApps(updatedApps);
    } catch (error) {
      console.error("Error toggling notification:", error);
    }
  };

  const renderAppItem = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity
      style={styles.appItem}
      onPress={() => router.push(`/app-details?id=${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.appItemContent}>
        <View style={styles.appIconContainer}>
          {item.icon ? (
            <Text style={styles.appIconText}>{item.icon}</Text>
          ) : (
            <MaterialIcons name="apps" size={32} color={colors.dark.primary} />
          )}
        </View>
        <View style={styles.appInfo}>
          <Text style={styles.appName}>{item.appName}</Text>
          <Text style={styles.appPackage}>{item.packageName}</Text>
        </View>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => toggleAppNotification(item.id)}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={item.enabled ? "notifications" : "notifications-off"}
            size={24}
            color={
              item.enabled ? colors.dark.primary : colors.dark.textDisabled
            }
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.dark.primary} />
        <Text style={styles.loadingText}>Carregando aplicativos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={apps}
        renderItem={renderAppItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="notifications-none"
              size={64}
              color={colors.dark.textDisabled}
            />
            <Text style={styles.emptyText}>Nenhum app encontrado</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.dark.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.dark.textSecondary,
    marginTop: spacing.md,
  },
  listContent: {
    padding: spacing.md,
  },
  appItem: {
    backgroundColor: colors.dark.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  appItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  appIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    backgroundColor: colors.dark.surfaceVariant,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  appIconText: {
    fontSize: 24,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    ...typography.body,
    color: colors.dark.text,
    fontWeight: "600",
    marginBottom: spacing.xs,
  },
  appPackage: {
    ...typography.caption,
    color: colors.dark.textSecondary,
  },
  toggleButton: {
    padding: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.dark.textSecondary,
    marginTop: spacing.md,
  },
});
