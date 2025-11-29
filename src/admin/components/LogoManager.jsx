import React, { useState } from 'react';
import { useWhiteLabel } from '../context/WhiteLabelContext';

const LogoManager = () => {
  const { config, updateConfig } = useWhiteLabel();
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (section, field, file) => {
    if (!file) return;

    setUploading(true);
    try {
      // In a real implementation, you would upload to your storage service
      // For now, we'll create a local URL
      const imageUrl = URL.createObjectURL(file);
      
      updateConfig({
        ...config,
        [section]: {
          ...config[section],
          [field]: imageUrl
        }
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    updateConfig({
      ...config,
      [section]: {
        ...config[section],
        [field]: value
      }
    });
  };

  const LogoUploadSection = ({ title, section, field, currentUrl, description }) => (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      
      <div className="space-y-4">
        {/* Current Logo Display */}
        {currentUrl && (
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src={currentUrl} 
                alt={title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-300">Current logo</p>
              <p className="text-xs text-gray-500 truncate">{currentUrl}</p>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleLogoUpload(section, field, e.target.files[0])}
            className="hidden"
            id={`${section}-${field}`}
            disabled={uploading}
          />
          <label 
            htmlFor={`${section}-${field}`}
            className="cursor-pointer block"
          >
            <div className="space-y-2">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-sm text-gray-400">
                <span className="font-medium text-yellow-400 hover:text-yellow-300">
                  {uploading ? 'Uploading...' : 'Click to upload'}
                </span>
                <p className="text-xs">PNG, JPG, SVG up to 10MB</p>
              </div>
            </div>
          </label>
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Or enter URL directly
          </label>
          <input
            type="url"
            value={currentUrl || ''}
            onChange={(e) => handleInputChange(section, field, e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="https://example.com/logo.png"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Main Logo */}
      <LogoUploadSection
        title="Main Logo"
        section="logos"
        field="main"
        currentUrl={config?.logos?.main}
        description="Primary logo used throughout the platform. Recommended size: 200x60px"
      />

      {/* Dark Logo */}
      <LogoUploadSection
        title="Dark Logo"
        section="logos"
        field="dark"
        currentUrl={config?.logos?.dark}
        description="Logo for dark backgrounds. Recommended size: 200x60px"
      />

      {/* Light Logo */}
      <LogoUploadSection
        title="Light Logo"
        section="logos"
        field="light"
        currentUrl={config?.logos?.light}
        description="Logo for light backgrounds. Recommended size: 200x60px"
      />

      {/* Favicon */}
      <LogoUploadSection
        title="Favicon"
        section="logos"
        field="favicon"
        currentUrl={config?.logos?.favicon}
        description="Browser tab icon. Recommended size: 32x32px"
      />

      {/* App Icon */}
      <LogoUploadSection
        title="App Icon"
        section="logos"
        field="appIcon"
        currentUrl={config?.logos?.appIcon}
        description="Mobile app icon. Recommended size: 512x512px"
      />

      {/* Logo Settings */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Logo Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Logo Height (px)
            </label>
            <input
              type="number"
              value={config?.logos?.height || 40}
              onChange={(e) => handleInputChange('logos', 'height', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="40"
              min="20"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Logo Width (px)
            </label>
            <input
              type="number"
              value={config?.logos?.width || 120}
              onChange={(e) => handleInputChange('logos', 'width', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="120"
              min="60"
              max="300"
            />
          </div>
        </div>
      </div>

      {/* Logo Preview */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Logo Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Light Background Preview */}
          <div className="bg-white rounded-lg p-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Light Background</h4>
            <div className="flex items-center justify-center h-16">
              {config?.logos?.dark ? (
                <img 
                  src={config.logos.dark}
                  alt="Dark Logo"
                  style={{
                    height: config?.logos?.height || 40,
                    width: config?.logos?.width || 120
                  }}
                  className="object-contain"
                />
              ) : (
                <div className="text-gray-400 text-sm">No dark logo uploaded</div>
              )}
            </div>
          </div>

          {/* Dark Background Preview */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Dark Background</h4>
            <div className="flex items-center justify-center h-16">
              {config?.logos?.light ? (
                <img 
                  src={config.logos.light}
                  alt="Light Logo"
                  style={{
                    height: config?.logos?.height || 40,
                    width: config?.logos?.width || 120
                  }}
                  className="object-contain"
                />
              ) : (
                <div className="text-gray-500 text-sm">No light logo uploaded</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoManager; 