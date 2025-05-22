import React, { useState } from "react";
import { FiKey, FiSmartphone, FiMail, FiLock, FiShield, FiAlertCircle, FiMonitor, FiBarChart2, FiX } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import ProfileNavBar from '../../components/profile/ProfileNavBar';

const Security = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  
  const handleChangePassword = () => {
    navigate('/account/profile/security/change-password');
  };
  
  const handleChangeEmail = () => {
    navigate('/account/profile/security/change-email');
  };
  
  const handleComingSoonClick = (e) => {
    // Get the button's position
    const rect = e.currentTarget.getBoundingClientRect();
    setPopupPosition({
      top: rect.bottom + window.scrollY + 10, // Position below the button
      left: rect.left + window.scrollX
    });
    setShowPopup(true);
    
    // Hide popup after 3 seconds
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };
  
  const closePopup = () => {
    setShowPopup(false);
  };
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative">
      <ProfileNavBar />
      
      {/* Coming Soon Popup */}
      {showPopup && (
        <div 
          className="absolute z-50 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg"
          style={{ top: `${popupPosition.top}px`, left: `${popupPosition.left}px` }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Coming soon, under development</span>
            <button 
              onClick={closePopup}
              className="ml-2 text-gray-400 hover:text-white"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold mb-8">Security center</h2>

        {/* Pending Security Features */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <FiAlertCircle className="text-orange-500 w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-lg">Pending security features</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Protect your funds by improving account security</p>
            </div>
          </div>

          {/* Authenticator App */}
          <div className="border-t border-gray-200 dark:border-gray-800 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FiShield className="text-gray-600 dark:text-gray-400 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Authenticator app</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Use authentication codes for login and other functions</p>
                </div>
              </div>
              <button 
                className="text-blue-500 text-sm font-medium hover:underline"
                onClick={handleComingSoonClick}
              >
                Set up
              </button>
            </div>
          </div>

          {/* Anti-phishing Code */}
          <div className="border-t border-gray-200 dark:border-gray-800 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FiLock className="text-gray-600 dark:text-gray-400 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Anti-phishing code</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Add a unique code to authentic OKX emails</p>
                </div>
              </div>
              <button 
                className="text-blue-500 text-sm font-medium hover:underline"
                onClick={handleComingSoonClick}
              >
                Set up
              </button>
            </div>
          </div>
        </div>

        {/* Authentication Methods */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-6">Authentication methods</h3>

          {/* Passkeys */}
          <div className="border-t border-gray-200 dark:border-gray-800 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FiKey className="text-gray-600 dark:text-gray-400 w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">Passkeys</h4>
                    <span className="bg-green-500 text-xs text-white px-1.5 py-0.5 rounded text-[10px]">Recommended</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Enjoy secure login without passwords and authentication codes</p>
                </div>
              </div>
              <button 
                className="text-blue-500 text-sm font-medium hover:underline"
                onClick={handleComingSoonClick}
              >
                Manage
              </button>
            </div>
          </div>

          {/* Phone Authentication */}
          <div className="border-t border-gray-200 dark:border-gray-800 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FiSmartphone className="text-gray-600 dark:text-gray-400 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Phone authentication</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Get authentication codes via SMS or calls when managing assets and other functions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">****1051</span>
                <button 
                  className="text-blue-500 text-sm font-medium hover:underline"
                  onClick={handleComingSoonClick}
                >
                  Change phone number
                </button>
              </div>
            </div>
          </div>

          {/* Email Authentication */}
          <div className="border-t border-gray-200 dark:border-gray-800 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FiMail className="text-gray-600 dark:text-gray-400 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Email authentication</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Get authentication codes via email for login and other functions</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">ron***@gmail.com</span>
                <button 
                  className="text-blue-500 text-sm font-medium hover:underline"
                  onClick={handleChangeEmail}
                >
                  Change email
                </button>
              </div>
            </div>
          </div>

          {/* Login Password */}
          <div className="border-t border-gray-200 dark:border-gray-800 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FiLock className="text-gray-600 dark:text-gray-400 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Login password</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Use this password for account login</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">********</span>
                <button 
                  className="text-blue-500 text-sm font-medium hover:underline"
                  onClick={handleChangePassword}
                >
                  Change password
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Security */}
        <div>
          <h3 className="text-xl font-semibold mb-6">Advanced security</h3>

          {/* Device Management */}
          <div className="border-t border-gray-200 dark:border-gray-800 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FiMonitor className="text-gray-600 dark:text-gray-400 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Device management</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Manage and view recent login activity and device information</p>
                </div>
              </div>
              <button 
                className="text-blue-500 text-sm font-medium hover:underline"
                onClick={handleComingSoonClick}
              >
                Manage
              </button>
            </div>
          </div>

          {/* Trading Permissions */}
          <div className="border-t border-gray-200 dark:border-gray-800 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center">
                  <FiBarChart2 className="text-gray-600 dark:text-gray-400 w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium">Trading permissions</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Set your tradable instruments and crypto</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Off</span>
                <button 
                  className="text-blue-500 text-sm font-medium hover:underline"
                  onClick={handleComingSoonClick}
                >
                  Turn on
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
