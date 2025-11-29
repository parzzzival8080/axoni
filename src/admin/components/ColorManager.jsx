import React, { useState, useEffect } from 'react';
import { useWhiteLabel } from '../context/WhiteLabelContext';
import { SettingsService } from '../config/supabase';

const ColorManager = () => {
  const { config, updateConfig } = useWhiteLabel();
  const [colorSettings, setColorSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load color settings from database
  useEffect(() => {
    loadColorSettings();
  }, []);

  // Update CSS variables in :root for live preview
  useEffect(() => {
    colorSettings.forEach(setting => {
      const value = getSettingValue(setting);
      if (value) {
        document.documentElement.style.setProperty(`--color-${setting.setting_key.replace('color_', '').replace(/_/g, '-')}`, value);
      }
    });
  }, [colorSettings]);

  const loadColorSettings = async () => {
    try {
      setLoading(true);
      const settings = await SettingsService.getSettingsByCategory('colors');
      setColorSettings(settings);
    } catch (err) {
      setError('Failed to load color settings');
      console.error('Error loading color settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleColorChange = (settingKey, value) => {
    setColorSettings(prev =>
      prev.map(setting =>
        setting.setting_key === settingKey
          ? { ...setting, value: value }
          : setting
      )
    );
    // Update CSS variable immediately for live preview
    document.documentElement.style.setProperty(`--color-${settingKey.replace('color_', '').replace(/_/g, '-')}`, value);
  };

  const saveColorSettings = async () => {
    try {
      setSaving(true);
      setError(null);

      // Prepare settings for batch update
      const settingsToUpdate = colorSettings
        .filter(setting => setting.value !== undefined)
        .map(setting => ({
          key: setting.setting_key,
          value: setting.value,
          type: 'color',
          setting_category: setting.setting_category || 'colors',
        }));

      if (settingsToUpdate.length === 0) {
        setSuccess('No changes to save');
        return;
      }

      await SettingsService.batchUpdateSettings(settingsToUpdate);
      setSuccess('Color settings saved successfully');

      // Reload settings to get updated data
      await loadColorSettings();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save color settings');
      console.error('Error saving color settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const getSettingValue = (setting) => {
    // Prefer the edited value, fallback to DB value
    if (setting.value !== undefined) return setting.value;
    return SettingsService.getSettingValue(setting);
  };

  const groupColorsByType = () => {
    const groups = {
      'Primary Colors': [],
      'Background Colors': [],
      'Text Colors': [],
      'Status Colors': []
    };

    colorSettings.forEach(setting => {
      if (setting.setting_key.includes('primary') || setting.setting_key.includes('accent') || setting.setting_key.includes('secondary')) {
        groups['Primary Colors'].push(setting);
      } else if (setting.setting_key.includes('background') || setting.setting_key.includes('card')) {
        groups['Background Colors'].push(setting);
      } else if (setting.setting_key.includes('text')) {
        groups['Text Colors'].push(setting);
      } else if (setting.setting_key.includes('success') || setting.setting_key.includes('error') || setting.setting_key.includes('warning') || setting.setting_key.includes('border')) {
        groups['Status Colors'].push(setting);
      }
    });

    return groups;
  };

  const renderColorInput = (setting) => {
    const value = getSettingValue(setting);

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          {setting.display_name}
          {setting.is_required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => handleColorChange(setting.setting_key, e.target.value)}
            className="w-12 h-12 rounded-lg border border-gray-600 cursor-pointer shadow-lg"
            style={{ backgroundColor: value || '#000000' }}
          />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleColorChange(setting.setting_key, e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder={`Enter ${setting.display_name}`}
          />
        </div>
        {setting.description && (
          <p className="text-xs text-gray-500">{setting.description}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        <span className="ml-2 text-white">Loading color settings...</span>
      </div>
    );
  }

  const groupedColors = groupColorsByType();

  return (
    <div className="space-y-6">
      {/* Save Button (moved to top) */}
      <div className="flex justify-end space-x-4 mb-4">
        <button
          onClick={loadColorSettings}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
        <button
          onClick={saveColorSettings}
          disabled={saving}
          className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </>
          )}
        </button>
      </div>
      {/* Status Messages */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-200">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-900 border border-green-700 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-200">{success}</span>
          </div>
        </div>
      )}

      {/* Color Settings Groups */}
      {Object.entries(groupedColors).map(([groupName, settings]) => (
        settings.length > 0 && (
          <div key={groupName} className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
              {groupName === 'Primary Colors' && (
                <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
              )}
              {groupName === 'Background Colors' && (
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
              {groupName === 'Text Colors' && (
                <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {groupName === 'Status Colors' && (
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {groupName}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {settings.map((setting) => (
                <div key={setting.setting_key}>
                  {renderColorInput(setting)}
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {/* Color Preview */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Color Preview
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Preview */}
          <div 
            className="rounded-lg p-6 border border-gray-600"
            style={{ 
              backgroundColor: getSettingValue(colorSettings.find(s => s.setting_key === 'color_background')) || '#000000',
              color: getSettingValue(colorSettings.find(s => s.setting_key === 'color_text')) || '#FFFFFF'
            }}
          >
            <div className="text-center mb-4">
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: getSettingValue(colorSettings.find(s => s.setting_key === 'color_text')) || '#FFFFFF' }}
              >
                AXONI Platform
              </h2>
              <p 
                className="text-sm"
                style={{ color: getSettingValue(colorSettings.find(s => s.setting_key === 'color_text_secondary')) || '#848E9C' }}
              >
                Your trusted crypto partner
              </p>
            </div>
            <div className="space-y-3">
              <div 
                className="p-3 rounded-lg"
                style={{ backgroundColor: getSettingValue(colorSettings.find(s => s.setting_key === 'color_card_background')) || '#121212' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">Trading Card</span>
                  <span 
                    className="text-sm font-semibold"
                    style={{ color: getSettingValue(colorSettings.find(s => s.setting_key === 'color_accent')) || '#F0B90B' }}
                  >
                    $50,000
                  </span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ 
                    backgroundColor: getSettingValue(colorSettings.find(s => s.setting_key === 'color_accent')) || '#F0B90B',
                    color: '#FFFFFF'
                  }}
                >
                  Primary Button
                </button>
                <button 
                  className="px-4 py-2 rounded-lg text-sm font-medium border"
                  style={{ 
                    borderColor: getSettingValue(colorSettings.find(s => s.setting_key === 'color_border')) || '#2A2A2A',
                    color: getSettingValue(colorSettings.find(s => s.setting_key === 'color_text')) || '#FFFFFF'
                  }}
                >
                  Secondary
                </button>
              </div>
            </div>
          </div>

          {/* Color Palette */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Color Palette</h4>
            <div className="grid grid-cols-2 gap-3">
              {colorSettings.slice(0, 8).map((setting) => {
                const value = getSettingValue(setting);
                return (
                  <div key={setting.setting_key} className="flex items-center space-x-3 p-2 bg-gray-800 rounded-lg">
                    <div 
                      className="w-8 h-8 rounded border border-gray-600"
                      style={{ backgroundColor: value || '#000000' }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{setting.display_name}</p>
                      <p className="text-xs text-gray-400 font-mono">{value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Color Usage Guide */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Color Usage Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className="text-gray-300">Primary Colors: Main brand colors and accents</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded bg-gray-600"></div>
              <span className="text-gray-300">Background Colors: Page and component backgrounds</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-gray-300">Text Colors: Typography and readability</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-gray-300">Status Colors: Success, error, and warning states</span>
            </div>
          </div>
          <div className="space-y-3 text-gray-300">
            <p>• Colors are automatically applied to CSS variables</p>
            <p>• Changes are reflected in real-time preview</p>
            <p>• All colors support hex, RGB, and HSL formats</p>
            <p>• Ensure sufficient contrast for accessibility</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorManager; 