import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.collabvault.app',
  appName: 'CollabVault',
  webDir: 'out',
  server: {
    url: 'https://collabvault.vercel.app',
    cleartext: false,
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
