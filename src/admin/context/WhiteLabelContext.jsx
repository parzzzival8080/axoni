import React, { createContext, useContext, useState, useEffect } from 'react';
import { SettingsService } from '../config/supabase';

const WhiteLabelContext = createContext();

const defaultConfig = {
  logos: {
    primary: '/assets/logo/logo.png',
    icon: '/assets/logo/tradex-icon.png',
    favicon: '/favicon.ico',
    loginLogo: '/assets/logo/logo.png',
    darkLogo: '/assets/logo/logo.webp'
  },
  colors: {
    primary: '#000000',      // Main background
    secondary: '#1E1E1E',    // Secondary background
    accent: '#014EB2',       // blue accent color
    accentSecondary: '#2EBD85', // Green accent color
    background: '#000000',   // Page background
    cardBackground: '#121212', // Card backgrounds
    text: '#FFFFFF',         // Primary text
    textSecondary: '#848E9C', // Secondary text
    textMuted: '#5E6673',    // Muted text
    border: '#2A2A2A',       // Border color
    success: '#2EBD85',      // Success color
    warning: '#014EB2',      // Warning color
    error: '#FF4747'         // Error color
  },
  assets: {
    loginBackground: '/assets/login/login.png',
    signupBackground: '/assets/login/signup.png',
    heroBackground: '/assets/homepage/background.png',
    aboutImage: '/assets/homepage/image.png',
    laptopImage: '/assets/homepage/laptop.png',
    sponsors: [
      '/assets/sponsor1.png',
      '/assets/sponsor1.webp',
      '/assets/sponsor2.png',
      '/assets/sponsor2.webp',
      '/assets/sponsor3.png',
      '/assets/sponsor3.webp'
    ],
    appStoreImages: [
      '/assets/appstore/1.png',
      '/assets/appstore/2.png',
      '/assets/appstore/3.png',
      '/assets/appstore/4.png',
      '/assets/appstore/icon.png'
    ],
    playStoreImages: [
      '/assets/playstore/1.png',
      '/assets/playstore/2.png',
      '/assets/playstore/3.png',
      '/assets/playstore/4.png',
      '/assets/playstore/banner.png',
      '/assets/playstore/googleplay.png',
      '/assets/playstore/icon.png'
    ],
    coinLogos: {
      bitcoin: '/assets/coin/bitcoin.png',
      btc: '/assets/coin/btc.webp',
      usdt: '/assets/coin/usdt.png'
    },
    rewardsIcon: '/public/images/rewards-icon.svg',
    referralIllustration: '/public/images/referral-illustration.svg'
  },
  names: {
    siteName: 'COINCHI',
    siteNameLong: 'COINCHI COIN',
    tagline: 'Best Cryptocurrency Trading Platform for Futures & Spot',
    taglineShort: 'Your trusted crypto partner',
    companyName: 'COINCHICoin Investments LLC',
    companyNameLegal: 'coinchi.co',
    supportEmail: 'support@coinchi.co',
    contactEmail: 'contact@coinchi.co',
    contactPhone: '+1-800-COINCHI-COIN',
    websiteUrl: 'https://coinchi.co',
    description: 'COINCHI is a secure, fast, and user-friendly cryptocurrency trading platform for spot and futures trading.',
    metaKeywords: 'cryptocurrency, trading, bitcoin, ethereum, altcoins, futures, spot, exchange, COINCHI, crypto platform',
    address: 'California, United States',
    socialMedia: {
      twitter: '@COINCHICoin',
      telegram: '@COINCHICoinOfficial',
      discord: 'COINCHICoin Community',
      facebook: 'COINCHICoin',
      youtube: 'COINCHICoin',
      linkedin: 'COINCHICoin',
      instagram: 'COINCHICoin'
    }
  },
  qr: {
    downloadQR: '',
    appStoreQR: '',
    playStoreQR: '',
    downloadQRUrl: 'https://api.fluxcoin.tech/api/v1/download-COINCHI-apk',
    appStoreQRUrl: 'https://apps.apple.com/app/COINCHI-coin',
    playStoreQRUrl: 'https://play.google.com/store/apps/details?id=com.COINCHIcoin',
    iosDownloadUrl: 'https://api.fluxcoin.tech/api/v1/download-ios',
    androidDownloadUrl: 'https://api.fluxcoin.tech/api/v1/download-apk'
  },
  apis: {
    baseUrl: 'https://django.bhtokens.com/api',
    secondaryUrl: 'https://api.fluxcoin.tech/api/v1',
    socketUrl: 'wss://socket.coinchi.co',
    chartDataUrl: 'https://api.fluxcoin.tech/api/v1',
    supportUrl: 'https://support.coinchi.co',
    tradingViewDatafeed: 'https://api.fluxcoin.tech/api/v1',
    chartsStorageUrl: 'https://saveload.tradingview.com',
    userAccountUrl: 'https://django.bhtokens.com/api/user_account',
    metaMaskWidgetUrl: 'https://mpctoken.com/widget.js',
    conveyThisApiKey: 'pub_74be0ba37cd27263cf6f9f630e760905'
  },
  features: {
    spotTrading: true,
    futuresTrading: true,
    conversion: true,
    staking: true,
    affiliate: true,
    referral: true,
    earn: true,
    metamask: true,
    multiLanguage: true,
    darkMode: true,
    mobileApp: true,
    kyc: true,
    twoFA: true
  },
  trading: {
    spotPairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'ADA/USDT', 'TRX/USDT'],
    futuresPairs: ['BTCUSDT', 'ETHUSDT', 'BNBUSDT'],
    defaultTimeframes: ['1m', '5m', '15m', '1h', '4h', '1d'],
    defaultChart: 'candlestick',
    maxLeverage: 100,
    minOrderSize: 0.001
  }
};

export const useWhiteLabel = () => {
  const context = useContext(WhiteLabelContext);
  if (!context) {
    throw new Error('useWhiteLabel must be used within a WhiteLabelProvider');
  }
  return context;
};

export const WhiteLabelProvider = ({ children }) => {
  const [config, setConfig] = useState(defaultConfig);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [dbConnected, setDbConnected] = useState(false);

  // Track original config to detect changes
  const [originalConfig, setOriginalConfig] = useState(defaultConfig);

  // Load configuration from database on component mount
  useEffect(() => {
    loadConfigFromDatabase();
  }, []);

  // Apply CSS variables when colors change
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(config.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key.replace(/_/g, '-')}`, value);
      if (key === 'accent') {
        console.log('[WhiteLabel] Setting --color-accent to', value);
      }
    });

    // Also apply to specific OKX theme variables
    root.style.setProperty('--okx-primary', config.colors.primary);
    root.style.setProperty('--okx-secondary', config.colors.secondary);
    root.style.setProperty('--okx-accent', config.colors.accent);
    root.style.setProperty('--okx-text-primary', config.colors.text);
    root.style.setProperty('--okx-text-secondary', config.colors.textSecondary);
    root.style.setProperty('--okx-border', config.colors.border);
    
    // Update document title and favicon
    if (config.names.siteName) {
      document.title = `${config.names.siteName} | ${config.names.taglineShort || config.names.tagline}`;
    }
    
    // Update favicon
    if (config.logos.favicon) {
      const favicon = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
      if (favicon) {
        favicon.href = config.logos.favicon;
      } else {
        const newFavicon = document.createElement('link');
        newFavicon.rel = 'icon';
        newFavicon.href = config.logos.favicon;
        document.head.appendChild(newFavicon);
      }
    }
  }, [JSON.stringify(config.colors), config.names]);

  // Check for changes whenever config updates
  useEffect(() => {
    const configChanged = JSON.stringify(config) !== JSON.stringify(originalConfig);
    setHasChanges(configChanged);
  }, [config, originalConfig]);

  const loadConfigFromDatabase = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const settings = await SettingsService.getAllSettings();
      const formattedConfig = SettingsService.formatSettingsToConfig(settings);
      
      // Merge with defaults to ensure all properties exist
      const mergedConfig = {
        ...defaultConfig,
        ...formattedConfig,
        names: { ...defaultConfig.names, ...formattedConfig.names },
        colors: { ...defaultConfig.colors, ...formattedConfig.colors },
        assets: { ...defaultConfig.assets, ...formattedConfig.assets },
        apis: { ...defaultConfig.apis, ...formattedConfig.apis },
        features: { ...defaultConfig.features, ...formattedConfig.features },
        trading: { ...defaultConfig.trading, ...formattedConfig.trading }
      };

      // Ensure critical arrays are properly initialized
      if (!Array.isArray(mergedConfig.assets.sponsors)) {
        mergedConfig.assets.sponsors = defaultConfig.assets.sponsors || [];
      }
      if (!Array.isArray(mergedConfig.assets.appStoreImages)) {
        mergedConfig.assets.appStoreImages = defaultConfig.assets.appStoreImages || [];
      }
      if (!Array.isArray(mergedConfig.assets.playStoreImages)) {
        mergedConfig.assets.playStoreImages = defaultConfig.assets.playStoreImages || [];
      }

      setConfig(mergedConfig);
      setOriginalConfig(mergedConfig);
      setDbConnected(true);
      setLastSaved(new Date());
      
      console.log('✅ Configuration loaded from database successfully');
    } catch (error) {
      console.error('❌ Error loading configuration from database:', error);
      setError(`Failed to load configuration: ${error.message}`);
      setDbConnected(false);
      
      // Fall back to localStorage if database fails
      try {
        const savedConfig = localStorage.getItem('whiteLabelConfig');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          setConfig({ ...defaultConfig, ...parsedConfig });
          console.log('📦 Loaded configuration from localStorage as fallback');
        }
      } catch (localError) {
        console.error('Error parsing localStorage config:', localError);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (section, key, value) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      };
      
      // Also save to localStorage as backup
      localStorage.setItem('whiteLabelConfig', JSON.stringify(newConfig));
      
      return newConfig;
    });
  };

  const saveConfig = async () => {
    try {
      setError(null);
      
      if (!dbConnected) {
        throw new Error('Database connection not available');
      }

      // Prepare batch updates
      const updates = [];
      
      // Process each section
      Object.entries(config).forEach(([section, sectionConfig]) => {
        if (section === 'names') {
          Object.entries(sectionConfig).forEach(([key, value]) => {
            if (key === 'socialMedia') {
              updates.push({
                key: 'social_media',
                value: value,
                type: 'json'
              });
            } else {
              updates.push({
                key: key,
                value: value,
                type: getSettingType(key, value)
              });
            }
          });
        } else if (section === 'trading') {
          updates.push({
            key: 'trading_config',
            value: sectionConfig,
            type: 'json'
          });
        } else {
          Object.entries(sectionConfig).forEach(([key, value]) => {
            const settingKey = `${section === 'logos' ? 'logo' : 
                              section === 'colors' ? 'color' : 
                              section === 'assets' ? 'asset' : 
                              section === 'apis' ? 'api' : 
                              section === 'qr' ? 'qr' : 
                              section === 'features' ? 'feature' : section}_${key}`;
            
            updates.push({
              key: settingKey,
              value: value,
              type: getSettingType(settingKey, value)
            });
          });
        }
      });

      // Save to database
      await SettingsService.batchUpdateSettings(updates);
      
      // Update tracking
      setOriginalConfig({ ...config });
      setHasChanges(false);
      setLastSaved(new Date());
      
      // Also save to localStorage as backup
      localStorage.setItem('whiteLabelConfig', JSON.stringify(config));
      
      console.log('✅ Configuration saved to database successfully');
      return Promise.resolve();
    } catch (error) {
      console.error('❌ Error saving configuration:', error);
      setError(`Failed to save configuration: ${error.message}`);
      throw error;
    }
  };

  const getSettingType = (key, value) => {
    if (key.includes('color_')) return 'color';
    if (key.includes('url') || key.includes('Url')) return 'url';
    if (key.includes('email') || key.includes('Email')) return 'email';
    if (key.startsWith('feature_')) return 'boolean';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'integer';
    if (typeof value === 'object') return 'json';
    return 'string';
  };

  const resetConfig = async () => {
    try {
      setConfig(defaultConfig);
      setOriginalConfig(defaultConfig);
      setHasChanges(false);
      
      // Clear localStorage
      localStorage.removeItem('whiteLabelConfig');
      
      console.log('🔄 Configuration reset to defaults');
    } catch (error) {
      console.error('Error resetting config:', error);
      throw error;
    }
  };

  const exportConfig = () => {
    const exportData = {
      config,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        source: 'COINCHI Admin Panel'
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `COINCHI-config-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importConfig = async (configData) => {
    try {
      const importedData = typeof configData === 'string' ? JSON.parse(configData) : configData;
      
      // Handle both old format (direct config) and new format (with metadata)
      const importedConfig = importedData.config || importedData;
      
      // Merge with defaults to ensure all properties exist
      const mergedConfig = {
        ...defaultConfig,
        ...importedConfig,
        names: { ...defaultConfig.names, ...importedConfig.names },
        colors: { ...defaultConfig.colors, ...importedConfig.colors },
        assets: { ...defaultConfig.assets, ...importedConfig.assets },
        apis: { ...defaultConfig.apis, ...importedConfig.apis },
        features: { ...defaultConfig.features, ...importedConfig.features },
        trading: { ...defaultConfig.trading, ...importedConfig.trading }
      };
      
      setConfig(mergedConfig);
      setHasChanges(true);
      
      console.log('📥 Configuration imported successfully');
    } catch (error) {
      console.error('Error importing config:', error);
      throw new Error('Invalid configuration format');
    }
  };

  const uploadFile = async (file, category = 'general') => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        reject(new Error('Invalid file type. Please upload an image file.'));
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        reject(new Error('File size too large. Please upload an image smaller than 5MB.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const value = {
    config,
    updateConfig,
    saveConfig,
    resetConfig,
    exportConfig,
    importConfig,
    uploadFile,
    loadConfigFromDatabase,
    hasChanges,
    loading,
    error,
    lastSaved,
    dbConnected,
    defaultConfig
  };

  return (
    <WhiteLabelContext.Provider value={value}>
      {children}
    </WhiteLabelContext.Provider>
  );
};

export default WhiteLabelContext; 