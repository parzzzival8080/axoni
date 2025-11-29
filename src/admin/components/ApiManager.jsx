import React, { useState, useEffect } from 'react';
import { useWhiteLabel } from '../context/WhiteLabelContext';
import { SettingsService } from '../config/supabase';

const ApiManager = () => {
  const { config, updateConfig } = useWhiteLabel();
  const [apiSettings, setApiSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load API settings from database
  useEffect(() => {
    loadApiSettings();
  }, []);

  const loadApiSettings = async () => {
    try {
      setLoading(true);
      const settings = await SettingsService.getSettingsByCategory('apis');
      setApiSettings(settings);
    } catch (err) {
      setError('Failed to load API settings');
      console.error('Error loading API settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (settingKey, value) => {
    setApiSettings(prev => 
      prev.map(setting => 
        setting.setting_key === settingKey 
          ? { ...setting, value: value }
          : setting
      )
    );
  };

  const saveApiSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Prepare settings for batch update
      const settingsToUpdate = apiSettings
        .filter(setting => setting.value !== undefined)
        .map(setting => ({
          key: setting.setting_key,
          value: setting.value,
          type: setting.setting_type
        }));

      if (settingsToUpdate.length === 0) {
        setSuccess('No changes to save');
        return;
      }

      await SettingsService.batchUpdateSettings(settingsToUpdate);
      setSuccess('API settings saved successfully');
      
      // Reload settings to get updated data
      await loadApiSettings();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save API settings');
      console.error('Error saving API settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const getSettingValue = (setting) => {
    return SettingsService.getSettingValue(setting);
  };

  const renderSettingInput = (setting) => {
    const value = getSettingValue(setting);
    
    switch (setting.setting_type) {
      case 'url':
        return (
          <input
            type="url"
            value={value || ''}
            onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder={`Enter ${setting.display_name}`}
          />
        );
      
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder={`Enter ${setting.display_name}`}
          />
        );
      
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleSettingChange(setting.setting_key, e.target.checked)}
              className="w-4 h-4 text-yellow-600 bg-gray-800 border-gray-600 rounded focus:ring-yellow-500 focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-300">Enable</span>
          </div>
        );
      
      case 'integer':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleSettingChange(setting.setting_key, parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder={`Enter ${setting.display_name}`}
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder={`Enter ${setting.display_name}`}
          />
        );
    }
  };

  const groupSettingsByType = () => {
    const groups = {
      'Trading APIs': [],
      'User Management': [],
      'External Services': [],
      'WebSocket & Real-time': [],
      'Support & Documentation': []
    };

    apiSettings.forEach(setting => {
      if (setting.setting_key.includes('v2') || setting.setting_key.includes('trading') || setting.setting_key.includes('coins') || setting.setting_key.includes('order')) {
        groups['Trading APIs'].push(setting);
      } else if (setting.setting_key.includes('user') || setting.setting_key.includes('login') || setting.setting_key.includes('signup') || setting.setting_key.includes('django')) {
        groups['User Management'].push(setting);
      } else if (setting.setting_key.includes('websocket') || setting.setting_key.includes('socket') || setting.setting_key.includes('okx')) {
        groups['WebSocket & Real-time'].push(setting);
      } else if (setting.setting_key.includes('support') || setting.setting_key.includes('conveythis')) {
        groups['Support & Documentation'].push(setting);
      } else {
        groups['External Services'].push(setting);
      }
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
        <span className="ml-2 text-white">Loading API settings...</span>
      </div>
    );
  }

  const groupedSettings = groupSettingsByType();

  return (
    <div className="space-y-6">
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

      {/* API Settings Groups */}
      {Object.entries(groupedSettings).map(([groupName, settings]) => (
        settings.length > 0 && (
          <div key={groupName} className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              {groupName === 'Trading APIs' && (
                <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              {groupName === 'User Management' && (
                <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
              {groupName === 'WebSocket & Real-time' && (
                <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )}
              {groupName === 'External Services' && (
                <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                </svg>
              )}
              {groupName === 'Support & Documentation' && (
                <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {groupName}
            </h3>
            <div className="space-y-4">
              {settings.map((setting) => (
                <div key={setting.setting_key}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {setting.display_name}
                    {setting.is_required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {renderSettingInput(setting)}
                  {setting.description && (
                    <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {/* API Status Monitor */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          API Status Monitor
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apiSettings.slice(0, 6).map((setting) => (
            <div key={setting.setting_key} className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-sm text-white">{setting.display_name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* API Endpoints Reference */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          API Endpoints Reference
        </h3>
        <div className="space-y-3 text-sm">
          {Object.entries(groupedSettings).map(([groupName, settings]) => (
            settings.length > 0 && (
              <div key={groupName} className="bg-gray-800 rounded-lg p-3">
                <h4 className="text-white font-medium mb-2">{groupName}</h4>
                <div className="space-y-1 text-gray-300">
                  {settings.map((setting) => (
                    <p key={setting.setting_key}>
                      • <code className="bg-gray-700 px-1 rounded">{setting.setting_key}</code> - {setting.description}
                    </p>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={loadApiSettings}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
        <button
          onClick={saveApiSettings}
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
    </div>
  );
};

export default ApiManager; 