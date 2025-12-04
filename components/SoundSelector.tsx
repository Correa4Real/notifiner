import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors, spacing, typography, borderRadius } from "@/constants/theme";
import { AudioPickerService, AudioFile } from "@/services/audioPickerService";
import { PreviewService } from "@/services/previewService";
import { Audio } from "expo-av";

interface SoundSelectorProps {
  readonly selectedSound: string;
  readonly selectedSoundUri?: string;
  readonly soundType?: "system" | "custom";
  readonly onSoundSelect: (
    sound: string,
    soundType?: "system" | "custom",
    soundUri?: string
  ) => void;
  readonly volume?: number;
  readonly vibrate?: boolean;
}

// Sons locais incluídos no app
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
  console.log("Sons locais carregados com sucesso");
} catch (error) {
  console.warn("Sons locais não encontrados:", error);
}

const systemSounds = [
  {
    id: "default",
    name: "Padrão do Sistema",
    icon: "notifications",
    isLocal: false,
  },
  {
    id: "swiftly",
    name: "Rápido",
    icon: "flash-on",
    isLocal: true,
    sound: localSounds.swiftly,
  },
  {
    id: "succeeded",
    name: "Sucesso",
    icon: "check-circle",
    isLocal: true,
    sound: localSounds.succeeded,
  },
  {
    id: "newNotification",
    name: "Nova Notificação",
    icon: "notifications-active",
    isLocal: true,
    sound: localSounds.newNotification,
  },
  {
    id: "noProblem",
    name: "Sem Problema",
    icon: "thumb-up",
    isLocal: true,
    sound: localSounds.noProblem,
  },
  {
    id: "hey",
    name: "Hey",
    icon: "volume-up",
    isLocal: true,
    sound: localSounds.hey,
  },
  {
    id: "thatWasQuick",
    name: "Foi Rápido",
    icon: "speed",
    isLocal: true,
    sound: localSounds.thatWasQuick,
  },
  {
    id: "rapaiz",
    name: "Rapaiz",
    icon: "music-note",
    isLocal: true,
    sound: localSounds.rapaiz,
  },
  {
    id: "bentivi",
    name: "Bentivi",
    icon: "library-music",
    isLocal: true,
    sound: localSounds.bentivi,
  },
  {
    id: "steamSound",
    name: "Som Steam",
    icon: "games",
    isLocal: true,
    sound: localSounds.steamSound,
  },
];

const audioExtensions = [
  { value: "all", label: "Todos os Formatos" },
  { value: "mp3", label: "MP3" },
  { value: "wav", label: "WAV" },
  { value: "m4a", label: "M4A" },
  { value: "flac", label: "FLAC" },
  { value: "aac", label: "AAC" },
  { value: "wma", label: "WMA" },
  { value: "opus", label: "OPUS" },
];

export function SoundSelector({
  selectedSound,
  selectedSoundUri,
  soundType,
  onSoundSelect,
  volume = 0.8,
  vibrate = true,
}: SoundSelectorProps) {
  const [customSounds, setCustomSounds] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExtension, setSelectedExtension] = useState<string>("all");
  const [showExtensionDropdown, setShowExtensionDropdown] = useState(false);
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
  const [playProgress, setPlayProgress] = useState<number>(0);
  const soundInstanceRef = useRef<Audio.Sound | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const playingSoundIdRef = useRef<string | null>(null);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        // Ignore keep awake errors
        if (error && typeof error === "object" && "message" in error) {
          const errorMessage = String(error.message);
          if (
            !errorMessage.includes("keep awake") &&
            !errorMessage.includes("KeepAwake")
          ) {
            console.error("Error setting audio mode:", error);
          }
        }
      }
    };

    setupAudio();
    loadCustomSounds();
    return () => {
      stopAllSounds();
    };
  }, []);

  const stopAllSounds = async () => {
    try {
      if (soundInstanceRef.current) {
        try {
          const status = await soundInstanceRef.current.getStatusAsync();
          if (status.isLoaded) {
            try {
              await soundInstanceRef.current.stopAsync();
            } catch (error) {
              // Ignore
            }
            try {
              await soundInstanceRef.current.unloadAsync();
            } catch (error) {
              // Ignore
            }
          }
        } catch (error) {
          // Ignore
        }
        soundInstanceRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setPlayingSoundId(null);
      playingSoundIdRef.current = null;
      setPlayProgress(0);
      await PreviewService.stopPreview();
    } catch (error) {
      // Ignore all errors
    }
  };

  const loadCustomSounds = async () => {
    setLoading(true);
    try {
      console.log("Loading custom sounds...");
      const audioFiles = await AudioPickerService.getAudioFiles();
      console.log(`Loaded ${audioFiles.length} custom sounds`);
      setCustomSounds(audioFiles);
    } catch (error) {
      console.error("Error loading custom sounds:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomSounds = customSounds.filter((sound) => {
    const matchesSearch =
      sound.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sound.artist.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesExtension =
      selectedExtension === "all" ||
      sound.extension?.toLowerCase() === selectedExtension.toLowerCase();

    return matchesSearch && matchesExtension;
  });

  const handlePlayPause = async (
    soundId: string,
    sound: string,
    soundType: "system" | "custom",
    soundUri?: string,
    fileUri?: string,
    localSoundAsset?: any
  ) => {
    try {
      console.log("=== [handlePlayPause] ===");
      console.log("soundId:", soundId);
      console.log("sound:", sound);
      console.log("soundType:", soundType);
      console.log("soundUri:", soundUri);
      console.log("fileUri:", fileUri);
      console.log("localSoundAsset:", localSoundAsset ? "EXISTS" : "UNDEFINED");
      console.log("volume:", volume);
      console.log("vibrate:", vibrate);

      if (playingSoundId === soundId && soundInstanceRef.current) {
        console.log("Stopping current sound");
        await stopAllSounds();
        return;
      }

      await stopAllSounds();

      setPlayingSoundId(soundId);
      playingSoundIdRef.current = soundId;
      setPlayProgress(0);

      await new Promise((resolve) => setTimeout(resolve, 50));

      if (localSoundAsset) {
        console.log("Using PreviewService with localSoundAsset");
        await PreviewService.previewLocalSound(
          localSoundAsset,
          volume,
          vibrate,
          1
        );

        const previewSound = PreviewService.getSoundInstance();
        if (previewSound) {
          soundInstanceRef.current = previewSound;
          let currentSoundId = soundId;
          let isLooping = true;

          previewSound.setOnPlaybackStatusUpdate(async (status) => {
            if (status.isLoaded) {
              if (
                status.durationMillis &&
                status.positionMillis !== undefined
              ) {
                const progress = status.positionMillis / status.durationMillis;
                setPlayProgress(progress);
              }

              if (status.didJustFinish && isLooping) {
                setPlayProgress(0);
                setTimeout(async () => {
                  if (
                    soundInstanceRef.current &&
                    playingSoundIdRef.current === currentSoundId
                  ) {
                    try {
                      setPlayProgress(0);
                      await soundInstanceRef.current.setPositionAsync(0);
                      await soundInstanceRef.current.playAsync();
                    } catch (error) {
                      console.error("Error looping sound:", error);
                      isLooping = false;
                    }
                  } else {
                    isLooping = false;
                  }
                }, 500);
              }
            }
          });

          progressIntervalRef.current = setInterval(async () => {
            if (
              soundInstanceRef.current &&
              playingSoundIdRef.current === currentSoundId
            ) {
              try {
                const status = await soundInstanceRef.current.getStatusAsync();
                if (
                  status.isLoaded &&
                  status.durationMillis &&
                  status.positionMillis !== undefined
                ) {
                  const progress =
                    status.positionMillis / status.durationMillis;
                  setPlayProgress(progress);
                }
              } catch (error) {
                console.error("Error getting playback status:", error);
              }
            }
          }, 100);
        }
        return;
      }

      console.log("Using PreviewService.previewWithSettings for all sounds");
      await PreviewService.previewWithSettings(
        sound,
        soundType,
        soundUri,
        volume,
        vibrate,
        fileUri,
        localSoundAsset,
        1
      );

      const previewSound = PreviewService.getSoundInstance();
      if (previewSound) {
        soundInstanceRef.current = previewSound;
        let currentSoundId = soundId;
        let isLooping = true;

        previewSound.setOnPlaybackStatusUpdate(async (status) => {
          if (status.isLoaded) {
            if (status.durationMillis && status.positionMillis !== undefined) {
              const progress = status.positionMillis / status.durationMillis;
              setPlayProgress(progress);
            }

            if (status.didJustFinish && isLooping) {
              setPlayProgress(0);
              setTimeout(async () => {
                if (
                  soundInstanceRef.current &&
                  playingSoundIdRef.current === currentSoundId
                ) {
                  try {
                    setPlayProgress(0);
                    await soundInstanceRef.current.setPositionAsync(0);
                    await soundInstanceRef.current.playAsync();
                  } catch (error) {
                    console.error("Error looping sound:", error);
                    isLooping = false;
                  }
                } else {
                  isLooping = false;
                }
              }, 500);
            }
          }
        });

        progressIntervalRef.current = setInterval(async () => {
          if (
            soundInstanceRef.current &&
            playingSoundIdRef.current === currentSoundId
          ) {
            try {
              const status = await soundInstanceRef.current.getStatusAsync();
              if (
                status.isLoaded &&
                status.durationMillis &&
                status.positionMillis !== undefined
              ) {
                const progress = status.positionMillis / status.durationMillis;
                setPlayProgress(progress);
              }
            } catch (error) {
              console.error("Error getting playback status:", error);
            }
          }
        }, 100);
      }
    } catch (error) {
      console.error("=== [handlePlayPause] ERROR ===");
      console.error("Error playing sound:", error);
      console.error("Error details:", JSON.stringify(error, null, 2));
      await stopAllSounds();
    }
  };

  const renderSystemSoundItem = ({
    item,
  }: {
    item: (typeof systemSounds)[0];
  }) => {
    // Check if this sound is selected
    const localSoundUri = item.isLocal ? `local:${item.id}` : undefined;
    const isSelected =
      (item.isLocal &&
        (selectedSound === item.id || selectedSoundUri === localSoundUri)) ||
      (!item.isLocal && selectedSound === item.id && !selectedSoundUri);

    const isPlaying = playingSoundId === item.id;
    const progress = isPlaying ? playProgress : 0;

    return (
      <View style={styles.soundItemContainer}>
        <TouchableOpacity
          style={[styles.soundItem, isSelected && styles.soundItemSelected]}
          onPress={() => {
            if (item.isLocal) {
              onSoundSelect(item.id, "system", `local:${item.id}`);
            } else {
              onSoundSelect(item.id, "system");
            }
          }}
          activeOpacity={0.7}
        >
          {isPlaying && (
            <View
              style={[
                styles.soundItemFill,
                {
                  width: `${progress * 100}%`,
                },
              ]}
            />
          )}
          <View style={styles.soundItemContent}>
            <MaterialIcons
              name={item.icon as any}
              size={24}
              color={
                isSelected ? colors.dark.primary : colors.dark.textSecondary
              }
            />
            <Text
              style={[styles.soundName, isSelected && styles.soundNameSelected]}
            >
              {item.name}
            </Text>
            {isSelected && (
              <MaterialIcons
                name="check-circle"
                size={20}
                color={colors.dark.primary}
              />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.previewButton}
          onPress={() => {
            if (item.isLocal) {
              handlePlayPause(
                item.id,
                item.id,
                "system",
                `local:${item.id}`,
                undefined,
                item.sound
              );
            } else {
              handlePlayPause(item.id, item.id, "system");
            }
          }}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={isPlaying ? "pause" : "play-arrow"}
            size={20}
            color={colors.dark.primary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderCustomSoundItem = ({ item }: { item: AudioFile }) => {
    const isSelected = selectedSoundUri === item.uri;
    const soundId = `custom-${item.uri}`;
    const isPlaying = playingSoundId === soundId;
    const progress = isPlaying ? playProgress : 0;

    return (
      <View style={styles.soundItemContainer}>
        <TouchableOpacity
          style={[styles.soundItem, isSelected && styles.soundItemSelected]}
          onPress={() => onSoundSelect(item.title, "custom", item.uri)}
          activeOpacity={0.7}
        >
          {isPlaying && (
            <View
              style={[
                styles.soundItemFill,
                {
                  width: `${progress * 100}%`,
                },
              ]}
            />
          )}
          <View style={styles.soundItemContent}>
            <MaterialIcons
              name="music-note"
              size={24}
              color={
                isSelected ? colors.dark.primary : colors.dark.textSecondary
              }
            />
            <View style={styles.customSoundInfo}>
              <Text
                style={[
                  styles.soundName,
                  isSelected && styles.soundNameSelected,
                ]}
              >
                {item.title}
              </Text>
              <Text style={styles.soundArtist}>{item.artist}</Text>
            </View>
            {isSelected && (
              <MaterialIcons
                name="check-circle"
                size={20}
                color={colors.dark.primary}
              />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.previewButton}
          onPress={() =>
            handlePlayPause(
              soundId,
              item.title,
              "custom",
              item.uri,
              item.fileUri
            )
          }
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={isPlaying ? "pause" : "play-arrow"}
            size={20}
            color={colors.dark.primary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const selectedCustomSound =
    selectedSoundUri && soundType === "custom"
      ? customSounds.find((s) => s.uri === selectedSoundUri)
      : null;

  const isPlayingCustom = playingSoundId === `custom-${selectedSoundUri}`;
  const customProgress = isPlayingCustom ? playProgress : 0;

  return (
    <View style={styles.container}>
      <FlatList
        data={systemSounds}
        renderItem={renderSystemSoundItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />

      {selectedCustomSound && (
        <View style={styles.soundItemContainer}>
          <TouchableOpacity
            style={[styles.soundItem, styles.soundItemSelected]}
            onPress={() => {
              onSoundSelect(
                selectedCustomSound.title,
                "custom",
                selectedCustomSound.uri
              );
            }}
            activeOpacity={0.7}
          >
            {isPlayingCustom && (
              <View
                style={[
                  styles.soundItemFill,
                  {
                    width: `${customProgress * 100}%`,
                  },
                ]}
              />
            )}
            <View style={styles.soundItemContent}>
              <MaterialIcons
                name="music-note"
                size={24}
                color={colors.dark.primary}
              />
              <View style={styles.customSoundInfo}>
                <Text style={[styles.soundName, styles.soundNameSelected]}>
                  {selectedCustomSound.title}
                </Text>
                <Text style={styles.soundArtist}>
                  {selectedCustomSound.artist}
                </Text>
              </View>
              <MaterialIcons
                name="check-circle"
                size={20}
                color={colors.dark.primary}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => {
              handlePlayPause(
                `custom-${selectedCustomSound.uri}`,
                selectedCustomSound.title,
                "custom",
                selectedCustomSound.uri,
                selectedCustomSound.fileUri
              );
            }}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={isPlayingCustom ? "pause" : "play-arrow"}
              size={20}
              color={colors.dark.primary}
            />
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.customButton}
        onPress={() => setShowCustomModal(true)}
        activeOpacity={0.7}
      >
        <MaterialIcons
          name="library-music"
          size={24}
          color={colors.dark.primary}
        />
        <Text style={styles.customButtonText}>
          {selectedSoundUri
            ? "Música Personalizada Selecionada"
            : "Escolher Música do Celular"}
        </Text>
        <MaterialIcons
          name="chevron-right"
          size={24}
          color={colors.dark.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={showCustomModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowCustomModal(false)}
              style={styles.modalCloseButton}
            >
              <MaterialIcons name="close" size={24} color={colors.dark.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Escolher Música</Text>
            <View style={styles.modalCloseButton} />
          </View>

          <View style={styles.filtersContainer}>
            <View style={styles.searchContainer}>
              <MaterialIcons
                name="search"
                size={20}
                color={colors.dark.textSecondary}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar música..."
                placeholderTextColor={colors.dark.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <TouchableOpacity
              style={styles.extensionFilter}
              onPress={() => setShowExtensionDropdown(!showExtensionDropdown)}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name="filter-list"
                size={20}
                color={colors.dark.text}
              />
              <Text style={styles.extensionFilterText}>
                {
                  audioExtensions.find((ext) => ext.value === selectedExtension)
                    ?.label
                }
              </Text>
              <MaterialIcons
                name={showExtensionDropdown ? "expand-less" : "expand-more"}
                size={20}
                color={colors.dark.textSecondary}
              />
            </TouchableOpacity>

            {showExtensionDropdown && (
              <View style={styles.extensionDropdown}>
                {audioExtensions.map((ext) => (
                  <TouchableOpacity
                    key={ext.value}
                    style={[
                      styles.extensionOption,
                      selectedExtension === ext.value &&
                        styles.extensionOptionSelected,
                    ]}
                    onPress={() => {
                      setSelectedExtension(ext.value);
                      setShowExtensionDropdown(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.extensionOptionText,
                        selectedExtension === ext.value &&
                          styles.extensionOptionTextSelected,
                      ]}
                    >
                      {ext.label}
                    </Text>
                    {selectedExtension === ext.value && (
                      <MaterialIcons
                        name="check"
                        size={20}
                        color={colors.dark.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.dark.primary} />
              <Text style={styles.loadingText}>Carregando músicas...</Text>
            </View>
          ) : (
            <FlatList
              data={filteredCustomSounds}
              renderItem={renderCustomSoundItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.customSoundsList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <MaterialIcons
                    name="music-off"
                    size={48}
                    color={colors.dark.textDisabled}
                  />
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? "Nenhuma música encontrada"
                      : "Nenhuma música encontrada no dispositivo"}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  soundItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  soundItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.dark.surfaceVariant,
    flex: 1,
    overflow: "hidden",
    position: "relative",
  },
  soundItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: spacing.md,
    position: "relative",
    zIndex: 1,
  },
  soundItemFill: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.dark.primary,
    opacity: 0.25,
    zIndex: 0,
    borderTopLeftRadius: borderRadius.md,
    borderBottomLeftRadius: borderRadius.md,
  },
  previewButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.dark.surfaceVariant,
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
  customButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.dark.surfaceVariant,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.dark.primary,
  },
  customButtonText: {
    ...typography.body,
    color: colors.dark.text,
    marginLeft: spacing.md,
    flex: 1,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    ...typography.h3,
    color: colors.dark.text,
  },
  filtersContainer: {
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.dark.surface,
    margin: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  searchInput: {
    ...typography.body,
    color: colors.dark.text,
    flex: 1,
    marginLeft: spacing.sm,
    paddingVertical: spacing.sm,
  },
  extensionFilter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    gap: spacing.sm,
  },
  extensionFilterText: {
    ...typography.body,
    color: colors.dark.text,
    flex: 1,
  },
  extensionDropdown: {
    backgroundColor: colors.dark.surfaceVariant,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
    overflow: "hidden",
  },
  extensionOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.surface,
  },
  extensionOptionSelected: {
    backgroundColor: colors.dark.surface,
  },
  extensionOptionText: {
    ...typography.body,
    color: colors.dark.textSecondary,
  },
  extensionOptionTextSelected: {
    color: colors.dark.primary,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...typography.body,
    color: colors.dark.textSecondary,
    marginTop: spacing.md,
  },
  customSoundsList: {
    padding: spacing.md,
  },
  customSoundInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  soundArtist: {
    ...typography.caption,
    color: colors.dark.textSecondary,
    marginTop: spacing.xs,
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
    textAlign: "center",
  },
});
