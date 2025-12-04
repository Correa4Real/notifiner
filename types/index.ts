export interface AppNotification {
  id: string;
  appName: string;
  packageName: string;
  icon?: string;
  iconUri?: string;
  enabled: boolean;
  sound?: string;
  soundType?: "system" | "custom";
  soundUri?: string;
  volume: number;
  vibrate: boolean;
  vibrationIntensity?: number;
  priority: "low" | "normal" | "high";
  lastNotification?: Date;
}

export interface NotificationSettings {
  apps: AppNotification[];
  globalVolume: number;
  doNotDisturb: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface SoundOption {
  id: string;
  name: string;
  uri: string;
}
