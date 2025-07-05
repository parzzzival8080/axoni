import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  }
});

// Database service for system settings
export class SettingsService {
  static async getAllSettings() {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('is_active', true)
        .order('setting_category', { ascending: true })
        .order('setting_key', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw error;
    }
  }

  static async getSettingsByCategory(category) {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('setting_category', category)
        .eq('is_active', true)
        .order('setting_key', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error fetching ${category} settings:`, error);
      throw error;
    }
  }

  static async getSetting(settingKey) {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('setting_key', settingKey)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      console.error(`Error fetching setting ${settingKey}:`, error);
      throw error;
    }
  }

  static async updateSetting(settingKey, value, settingType = null) {
    try {
      // First get the current setting to determine the correct column
      const currentSetting = await this.getSetting(settingKey);
      if (!currentSetting) {
        throw new Error(`Setting ${settingKey} not found`);
      }

      const type = settingType || currentSetting.setting_type;
      let updateData = { updated_at: new Date().toISOString() };

      // Map value to correct column based on type
      switch (type) {
        case 'string':
        case 'url':
        case 'email':
        case 'color':
        case 'file':
          updateData.string_value = value;
          break;
        case 'integer':
          updateData.integer_value = parseInt(value);
          break;
        case 'decimal':
          updateData.decimal_value = parseFloat(value);
          break;
        case 'boolean':
          updateData.boolean_value = typeof value === 'boolean' ? value : value === 'true';
          break;
        case 'json':
          updateData.json_value = typeof value === 'string' ? JSON.parse(value) : value;
          break;
        default:
          updateData.string_value = value;
      }

      const { data, error } = await supabase
        .from('system_settings')
        .update(updateData)
        .eq('setting_key', settingKey)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating setting ${settingKey}:`, error);
      throw error;
    }
  }

  static async batchUpdateSettings(settings) {
    try {
      const updates = [];
      
      for (const { key, value, type, setting_category } of settings) {
        const currentSetting = await this.getSetting(key);
        if (!currentSetting) continue;

        const settingType = type || currentSetting.setting_type;
        let updateData = { 
          setting_key: key,
          updated_at: new Date().toISOString(),
          // Always include setting_category for color settings
          setting_category: settingType === 'color' ? (setting_category || currentSetting.setting_category || 'colors') : (setting_category || currentSetting.setting_category)
        };

        // Map value to correct column based on type
        switch (settingType) {
          case 'string':
          case 'url':
          case 'email':
          case 'color':
          case 'file':
            updateData.string_value = value;
            break;
          case 'integer':
            updateData.integer_value = parseInt(value);
            break;
          case 'decimal':
            updateData.decimal_value = parseFloat(value);
            break;
          case 'boolean':
            updateData.boolean_value = typeof value === 'boolean' ? value : value === 'true';
            break;
          case 'json':
            updateData.json_value = typeof value === 'string' ? JSON.parse(value) : value;
            break;
          default:
            updateData.string_value = value;
        }

        updates.push(updateData);
      }

      // Use upsert for batch updates
      const { data, error } = await supabase
        .from('system_settings')
        .upsert(updates, { 
          onConflict: 'setting_key',
          ignoreDuplicates: false 
        })
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error batch updating settings:', error);
      throw error;
    }
  }

  static async createSetting(settingData) {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .insert([{
          setting_key: settingData.key,
          setting_category: settingData.category,
          setting_type: settingData.type || 'string',
          display_name: settingData.displayName,
          description: settingData.description,
          string_value: settingData.type === 'string' ? settingData.value : null,
          integer_value: settingData.type === 'integer' ? settingData.value : null,
          decimal_value: settingData.type === 'decimal' ? settingData.value : null,
          boolean_value: settingData.type === 'boolean' ? settingData.value : null,
          json_value: settingData.type === 'json' ? settingData.value : null,
          is_active: true,
          is_required: settingData.required || false,
          environment: settingData.environment || 'production'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating setting:', error);
      throw error;
    }
  }

  static async deleteSetting(settingKey) {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({ is_active: false })
        .eq('setting_key', settingKey);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Error deleting setting ${settingKey}:`, error);
      throw error;
    }
  }

  // Helper method to get setting value in the correct format
  static getSettingValue(setting) {
    if (!setting) return null;

    switch (setting.setting_type) {
      case 'string':
      case 'url':
      case 'email':
      case 'color':
      case 'file':
        return setting.string_value;
      case 'integer':
        return setting.integer_value;
      case 'decimal':
        return setting.decimal_value;
      case 'boolean':
        return setting.boolean_value;
      case 'json':
        return setting.json_value;
      default:
        return setting.string_value;
    }
  }

  // Convert database settings to config format
  static formatSettingsToConfig(settings) {
    const config = {
      logos: {},
      colors: {},
      assets: {},
      names: { socialMedia: {} },
      qr: {},
      apis: {},
      features: {},
      trading: {}
    };

    settings.forEach(setting => {
      const value = this.getSettingValue(setting);
      const key = setting.setting_key;

      if (key.startsWith('logo_')) {
        config.logos[key.replace('logo_', '')] = value;
      } else if (key.startsWith('color_')) {
        config.colors[key.replace('color_', '')] = value;
      } else if (key.startsWith('asset_')) {
        config.assets[key.replace('asset_', '')] = value;
      } else if (key.startsWith('api_')) {
        config.apis[key.replace('api_', '')] = value;
      } else if (key.startsWith('qr_')) {
        config.qr[key.replace('qr_', '')] = value;
      } else if (key.startsWith('feature_')) {
        config.features[key.replace('feature_', '')] = value;
      } else if (setting.setting_category === 'identity' || setting.setting_category === 'contact') {
        if (key === 'social_media') {
          config.names.socialMedia = value;
        } else {
          config.names[key] = value;
        }
      } else if (setting.setting_category === 'trading') {
        if (key === 'trading_config') {
          Object.assign(config.trading, value);
        } else {
          config.trading[key] = value;
        }
      }
    });

    return config;
  }
}

export default supabase; 