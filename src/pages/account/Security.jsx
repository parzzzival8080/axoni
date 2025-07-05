import React, { useState, useEffect } from "react";
import { FiMail, FiLock, FiShield, FiAlertCircle, FiX } from "react-icons/fi";
import { useNavigate } from 'react-router-dom';
import ProfileNavBar from '../../components/profile/ProfileNavBar';
import axios from 'axios';

const Security = () => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  
  // User data state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  
  // Get user ID from localStorage
  const userId = localStorage.getItem('user_id');
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (!userId) {
          setError('User ID not found. Please log in again.');
          setIsLoading(false);
          return;
        }
        const response = await axios.get(
          `https://django.kinecoin.co/api/user_account/getUserInformation/?user_id=${userId}`
        );
        if (response.data && response.data.user) {
          setProfileData(response.data);
        } else {
          setError('User data format invalid.');
        }
      } catch (err) {
        setError('Failed to fetch user details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userId]);
  
  // Fallback data from localStorage if API fails
  const storedUser = localStorage.getItem('user');
  const localUser = storedUser ? JSON.parse(storedUser) : {};
  
  const fallbackData = {
    user: {
      email: localUser.email || 'user@example.com',
    },
  };
  
  // Use API data or fallback
  const user = profileData?.user || fallbackData.user;
  
  // Display data with proper null handling
  const displayData = {
    email: user.email || 'Not provided',
  };
  

  
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
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative">
        <ProfileNavBar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
            <span className="ml-3 text-sm">Loading security settings...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative">
        <ProfileNavBar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
              <FiAlertCircle className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2 text-center">
              Error loading security settings
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center px-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#FE7400] text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  
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
        {/* <h2 className="text-2xl font-semibold mb-8">Security center</h2>

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
        </div> */}

        {/* Authentication Methods */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-6">Authentication methods</h3>



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
                <span className="text-gray-400 text-sm">{displayData.email}</span>
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


      </div>
    </div>
  );
};

export default Security;
