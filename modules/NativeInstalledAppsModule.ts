import { NativeModules } from 'react-native';

export default NativeModules.InstalledAppsModule || {
  getInstalledApps: async () => {
    console.warn('InstalledAppsModule native module not found. Using fallback.');
    return [];
  },
};

