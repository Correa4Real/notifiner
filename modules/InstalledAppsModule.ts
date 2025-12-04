import { NativeModulesProxy, EventEmitter, Subscription } from 'expo-modules-core';

import InstalledAppsModuleNative from './InstalledAppsModuleNative';

export interface InstalledAppInfo {
  packageName: string;
  appName: string;
  iconBase64?: string;
}

export default class InstalledAppsModule {
  static async getInstalledApps(): Promise<InstalledAppInfo[]> {
    return await InstalledAppsModuleNative.getInstalledApps();
  }
}

