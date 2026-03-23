import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'co.axoni.app',
  appName: 'Axoni',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      // Camera plugin for KYC document capture
    }
  }
};

export default config;
