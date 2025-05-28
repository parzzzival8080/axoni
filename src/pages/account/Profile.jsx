import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProfileNavBar from '../../components/profile/ProfileNavBar';
import { FiEdit, FiCopy, FiCheck, FiShield } from 'react-icons/fi';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get user_id from localStorage (assuming it's stored as 'uid' or 'user_id')
        const userId = localStorage.getItem('user_id') || localStorage.getItem('uid');
        
        if (!userId) {
          setError('User ID not found. Please log in again.');
          setIsLoading(false);
          return;
        }
        
        console.log('Fetching user data for user_id:', userId);
        
        const response = await axios.get(`https://django.bhtokens.com/api/user_account/getUserInformation/?user_id=${userId}`);
        
        console.log('User data response:', response.data);
        
        if (response.data && response.data.user && response.data.user_detail) {
          setProfileData(response.data);
        } else {
          setError('Invalid response format from server.');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);
  
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative">
        <ProfileNavBar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
            <span className="ml-3">Loading profile...</span>
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
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-red-500 dark:text-red-400 mb-2">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">Error loading profile</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Extract data from API response
  const user = profileData?.user || {};
  const userDetail = profileData?.user_detail || {};
  
  // Get user_id from localStorage for display
  const userIdFromStorage = localStorage.getItem('user_id') || localStorage.getItem('uid');
  
  const displayData = {
    username: user.name || "Not provided",
    userId: userIdFromStorage || "Not provided", // User ID from localStorage
    uid: user.uid || "Not provided", // UID from API response
    email: user.email || "Not provided",
    phone: userDetail.phone_number || "Not provided",
    country: userDetail.user_country || "Not specified",
    tradingLevel: userDetail.tier ? "Premium Tier" : "Level 1",
    isVerified: userDetail.is_verified || false,
    profileImage: userDetail.user_profile || null,
    referralCode: user.referral_code || "Not available",
    role: user.role || "client"
  };

  // Determine verification status
  const isVerified = (userDetail.is_verified === true) || (localStorage.getItem('is_verified') === 'true');

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative">
      <ProfileNavBar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Profile</h1>
          {isVerified ? (
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold text-sm border border-green-300">
              <FiCheck className="mr-2 text-green-500" /> Verified
            </span>
          ) : (
            <Link to="/account/verify" className="inline-flex items-center px-4 py-2 rounded-full bg-[#FE7400] text-white font-semibold text-sm hover:bg-orange-600 transition">
              <FiShield className="mr-2" /> Verify Now
            </Link>
          )}
        </div>
        
        {/* Profile Avatar Section */}
        <div className="mb-10">
          <div className="flex items-start gap-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                {displayData.profileImage ? (
                  <img 
                    src={displayData.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <span className={`text-gray-400 text-4xl ${displayData.profileImage ? 'hidden' : 'block'}`}>👤</span>
              </div>
              <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md">
                <FiEdit className="text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Personal info</h2>
              
              <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
                <div className="w-1/3">
                  <span className="text-gray-500 dark:text-gray-400">Full Name</span>
                </div>
                <div className="w-1/3">
                  <span>{displayData.username}</span>
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
                  <span>{displayData.userId}</span>
                </div>
                <div className="w-1/3 text-right">
                  <button 
                    onClick={() => handleCopy(displayData.userId)}
                    className="text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
                <div className="w-1/3">
                  <span className="text-gray-500 dark:text-gray-400">UID</span>
                </div>
                <div className="w-1/3">
                  <span>{displayData.uid}</span>
                </div>
                <div className="w-1/3 text-right">
                  <button 
                    onClick={() => handleCopy(displayData.uid)}
                    className="text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
                <div className="w-1/3">
                  <span className="text-gray-500 dark:text-gray-400">Referral Code</span>
                </div>
                <div className="w-1/3">
                  <span>{displayData.referralCode}</span>
                </div>
                <div className="w-1/3 text-right">
                  <button 
                    onClick={() => handleCopy(displayData.referralCode)}
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
              {displayData.isVerified ? (
                <>
                  <FiCheck className="text-green-500 mr-2" />
                  <span className="text-green-500">Verified</span>
                </>
              ) : (
                <span className="text-yellow-500">Pending verification</span>
              )}
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
              <span>{displayData.country}</span>
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
              <span>{displayData.email}</span>
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
              <span>{displayData.phone}</span>
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
              <span className="text-gray-500 dark:text-gray-400">Account Role</span>
            </div>
            <div className="w-1/3">
              <span className="capitalize">{displayData.role}</span>
            </div>
            <div className="w-1/3 text-right">
              <button className="text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                View details
              </button>
            </div>
          </div>
          
          <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
            <div className="w-1/3">
              <span className="text-gray-500 dark:text-gray-400">Trading fee tier</span>
            </div>
            <div className="w-1/3">
              <span>{displayData.tradingLevel}</span>
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