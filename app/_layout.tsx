import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#000000",
          },
          headerTintColor: "#FFFFFF",
          headerTitleStyle: {
            fontWeight: "600",
          },
          contentStyle: {
            backgroundColor: "#000000",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Gerenciador de Notificações",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="app-details"
          options={{
            title: "Detalhes do App",
            presentation: "modal",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
