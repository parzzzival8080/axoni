import React from 'react';
import { Link } from 'react-router-dom';
import ProfileNavBar from '../../components/profile/ProfileNavBar';
import { FiEdit, FiCopy, FiCheck } from 'react-icons/fi';

const Profile = () => {
  // Get user data from localStorage or use default values
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const profileData = {
    username: user.username || "Doe***@gmail.com",
    userId: user.id || "676742689443800709",
    email: user.email || "Doe***@gmail.com",
    phone: user.phone || "****129",
    country: "Philippines",
    tradingLevel: "Level 1"
  };
  
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative">
      <ProfileNavBar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-8">Profile</h1>
        
        {/* Profile Avatar Section */}
        <div className="mb-10">
          <div className="flex items-start gap-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-4xl">👤</span>
              </div>
              <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md">
                <FiEdit className="text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Personal info</h2>
              
              <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
                <div className="w-1/3">
                  <span className="text-gray-500 dark:text-gray-400">Nickname</span>
                </div>
                <div className="w-1/3">
                  <span>{profileData.username}</span>
                </div>
                <div className="w-1/3 text-right">
                  <Link 
                    to="/account/profile/change-nickname"
                    className="text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Change
                  </Link>
                </div>
              </div>
              
              <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
                <div className="w-1/3">
                  <span className="text-gray-500 dark:text-gray-400">User ID</span>
                </div>
                <div className="w-1/3">
                  <span>{profileData.userId}</span>
                </div>
                <div className="w-1/3 text-right">
                  <button 
                    onClick={() => handleCopy(profileData.userId)}
                    className="text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Verification Info Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Verification info</h2>
          
          <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
            <div className="w-1/3">
              <span className="text-gray-500 dark:text-gray-400">Identity verification</span>
            </div>
            <div className="w-1/3 flex items-center">
              <FiCheck className="text-green-500 mr-2" />
              <span className="text-green-500">Verified</span>
            </div>
            <div className="w-1/3 text-right">
              <button className="text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                View details
              </button>
            </div>
          </div>
          
          <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
            <div className="w-1/3">
              <span className="text-gray-500 dark:text-gray-400">Country/Region</span>
            </div>
            <div className="w-1/3">
              <span>{profileData.country}</span>
            </div>
            <div className="w-1/3 text-right">
              <button className="text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                View details
              </button>
            </div>
          </div>
        </div>
        
        {/* Account Details Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Account details</h2>
          
          {/* Password Field */}
          <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
            <div className="w-1/3">
              <span className="text-gray-500 dark:text-gray-400">Password</span>
            </div>
            <div className="w-1/3">
              <span>••••••••</span>
            </div>
            <div className="w-1/3 text-right">
              <Link 
                to="/account/profile/security/change-password"
                className="text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Change
              </Link>
            </div>
          </div>
          
          <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
            <div className="w-1/3">
              <span className="text-gray-500 dark:text-gray-400">Email</span>
            </div>
            <div className="w-1/3">
              <span>{profileData.email}</span>
            </div>
            <div className="w-1/3 text-right">
              <Link 
                to="/account/profile/security/change-email"
                className="text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Change
              </Link>
            </div>
          </div>
          
          <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
            <div className="w-1/3">
              <span className="text-gray-500 dark:text-gray-400">Phone</span>
            </div>
            <div className="w-1/3">
              <span>{profileData.phone}</span>
            </div>
            <div className="w-1/3 text-right">
              <button 
                className="text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Change
              </button>
            </div>
          </div>
          
          <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
            <div className="w-1/3">
              <span className="text-gray-500 dark:text-gray-400">Linked accounts</span>
            </div>
            <div className="w-1/3">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="w-1/3 text-right">
              <button className="text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Manage
              </button>
            </div>
          </div>
          
          <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
            <div className="w-1/3">
              <span className="text-gray-500 dark:text-gray-400">Trading fee tier</span>
            </div>
            <div className="w-1/3">
              <span>{profileData.tradingLevel}</span>
            </div>
            <div className="w-1/3 text-right">
              <button className="text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                View details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;