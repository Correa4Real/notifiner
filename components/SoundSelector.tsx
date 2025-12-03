import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";

interface SoundSelectorProps {
  readonly selectedSound: string;
  readonly onSoundSelect: (sound: string) => void;
}

const availableSounds = [
  { id: "default", name: "Padrão do Sistema", icon: "notifications" },
  { id: "chime", name: "Sino", icon: "campaign" },
  { id: "bell", name: "Sino Clássico", icon: "notifications-active" },
  { id: "ding", name: "Ding", icon: "volume-up" },
  { id: "pop", name: "Pop", icon: "music-note" },
  { id: "chirp", name: "Chirp", icon: "pets" },
];

export function SoundSelector({
  selectedSound,
  onSoundSelect,
}: SoundSelectorProps) {
  const renderSoundItem = ({ item }: { item: (typeof availableSounds)[0] }) => (
    <TouchableOpacity
      style={[
        styles.soundItem,
        selectedSound === item.id && styles.soundItemSelected,
      ]}
      onPress={() => onSoundSelect(item.id)}
      activeOpacity={0.7}
    >
      <MaterialIcons
        name={item.icon as any}
        size={24}
        color={
          selectedSound === item.id
            ? colors.dark.primary
            : colors.dark.textSecondary
        }
      />
      <Text
        style={[
          styles.soundName,
          selectedSound === item.id && styles.soundNameSelected,
        ]}
      >
        {item.name}
      </Text>
      {selectedSound === item.id && (
        <MaterialIcons
          name="check-circle"
          size={20}
          color={colors.dark.primary}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={availableSounds}
        renderItem={renderSoundItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  soundItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.dark.surfaceVariant,
    marginBottom: spacing.sm,
  },
  soundItemSelected: {
    backgroundColor: colors.dark.surfaceVariant,
    borderWidth: 2,
    borderColor: colors.dark.primary,
  },
  soundName: {
    ...typography.body,
    color: colors.dark.textSecondary,
    marginLeft: spacing.md,
    flex: 1,
  },
  soundNameSelected: {
    color: colors.dark.text,
    fontWeight: "600",
  },
});
