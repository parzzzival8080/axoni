import React from 'react';
import { useWhiteLabel } from '../context/WhiteLabelContext';

const QRManager = () => {
  const { config, updateConfig } = useWhiteLabel();

  const handleInputChange = (section, field, value) => {
    updateConfig({
      ...config,
      [section]: {
        ...config[section],
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* App Download QR Codes */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          App Download QR Codes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              iOS App Store URL
            </label>
            <input
              type="url"
              value={config?.qr?.iosUrl || ''}
              onChange={(e) => handleInputChange('qr', 'iosUrl', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://apps.apple.com/app/your-app"
            />
            <p className="text-xs text-gray-500 mt-1">QR code will be generated automatically</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Android Play Store URL
            </label>
            <input
              type="url"
              value={config?.qr?.androidUrl || ''}
              onChange={(e) => handleInputChange('qr', 'androidUrl', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://play.google.com/store/apps/details?id=your.app"
            />
            <p className="text-xs text-gray-500 mt-1">QR code will be generated automatically</p>
          </div>
        </div>
      </div>

      {/* Custom QR Codes */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Custom QR Codes
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website URL
            </label>
            <input
              type="url"
              value={config?.qr?.websiteUrl || ''}
              onChange={(e) => handleInputChange('qr', 'websiteUrl', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://yourwebsite.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Support URL
            </label>
            <input
              type="url"
              value={config?.qr?.supportUrl || ''}
              onChange={(e) => handleInputChange('qr', 'supportUrl', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://support.yourwebsite.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Social Media URL
            </label>
            <input
              type="url"
              value={config?.qr?.socialUrl || ''}
              onChange={(e) => handleInputChange('qr', 'socialUrl', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://twitter.com/yourhandle"
            />
          </div>
        </div>
      </div>

      {/* QR Code Settings */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          QR Code Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              QR Code Size (px)
            </label>
            <input
              type="number"
              value={config?.qr?.size || 200}
              onChange={(e) => handleInputChange('qr', 'size', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="200"
              min="100"
              max="500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Error Correction Level
            </label>
            <select
              value={config?.qr?.errorCorrection || 'M'}
              onChange={(e) => handleInputChange('qr', 'errorCorrection', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              QR Code Color
            </label>
            <input
              type="color"
              value={config?.qr?.color || '#000000'}
              onChange={(e) => handleInputChange('qr', 'color', e.target.value)}
              className="w-full h-10 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* QR Code Preview */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          QR Code Preview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* iOS QR Code */}
          {config?.qr?.iosUrl && (
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-300 mb-3">iOS App Store</h4>
              <div className="bg-white rounded-lg p-4 inline-block">
                <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">QR Code</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Scan to download iOS app</p>
            </div>
          )}

          {/* Android QR Code */}
          {config?.qr?.androidUrl && (
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Android Play Store</h4>
              <div className="bg-white rounded-lg p-4 inline-block">
                <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">QR Code</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Scan to download Android app</p>
            </div>
          )}

          {/* Website QR Code */}
          {config?.qr?.websiteUrl && (
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Website</h4>
              <div className="bg-white rounded-lg p-4 inline-block">
                <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">QR Code</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Scan to visit website</p>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Usage Instructions */}
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Usage Instructions
        </h3>
        <div className="space-y-3 text-sm text-gray-300">
          <p>• QR codes will be automatically generated when URLs are provided</p>
          <p>• Use the iOS and Android URLs for app download QR codes</p>
          <p>• Custom URLs can be used for website, support, or social media links</p>
          <p>• QR codes can be downloaded and used in marketing materials</p>
          <p>• Error correction level affects how much damage the QR code can sustain</p>
        </div>
      </div>
    </div>
  );
};

export default QRManager; 