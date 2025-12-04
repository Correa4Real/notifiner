import { NativeModules, Platform } from 'react-native';

interface AudioPlayerModuleInterface {
  playSound(uri: string, volume: number): Promise<boolean>;
  stopSound(): Promise<boolean>;
  isPlaying(): Promise<boolean>;
}

const { AudioPlayerModule } = NativeModules;

export default (Platform.OS === 'android' && AudioPlayerModule ? AudioPlayerModule as AudioPlayerModuleInterface : null);

