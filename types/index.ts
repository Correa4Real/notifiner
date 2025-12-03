export interface AppNotification {
  id: string;
  appName: string;
  packageName: string;
  icon?: string;
  enabled: boolean;
  sound?: string;
  volume: number;
  vibrate: boolean;
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
