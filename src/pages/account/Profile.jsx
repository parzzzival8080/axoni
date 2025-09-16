import React from 'react';
import { Link } from 'react-router-dom';
import ProfileNavBar from '../../components/profile/ProfileNavBar';
import { FiEdit, FiCopy, FiCheck, FiShield } from 'react-icons/fi';
import axios from 'axios';

const Profile = () => {
  // Loading and error state
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [profileData, setProfileData] = React.useState(null);
  const [showTradingFeeModal, setShowTradingFeeModal] = React.useState(false);

  // Get user ID from localStorage
  const storedUser = localStorage.getItem('user');
  const localUser = storedUser ? JSON.parse(storedUser) : {};
  const userId = localStorage.getItem('user_id');

  React.useEffect(() => {
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
          `https://django.COINCHIcoin.tech/api/user_account/getUserInformation/?user_id=${userId}`
        );
        if (response.data && response.data.user && response.data.user_detail) {
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

  // Fallback if API fails
  const fallbackData = {
    user: {
      name: localUser.username || 'User',
      email: localUser.email || 'user@example.com',
      uid: localUser.uid || 'Not provided',
      referral_code: localUser.referral_code || 'Not available',
      role: localUser.role || 'client',
    },
    user_detail: {
      phone_number: localUser.phone || null,
      user_country: localUser.country || null,
      user_profile: localUser.profileImage || null,
      tier: localUser.tradingLevel === 'Premium Tier',
      is_verified:
        localUser.is_verified === true ||
        localStorage.getItem('is_verified') === 'true',
    },
  };



  // Use API data or fallback
  const user = profileData?.user || fallbackData.user;
  const userDetail = profileData?.user_detail || fallbackData.user_detail;

  // Verification status logic
  const isVerified = userDetail.is_verified === true;
  const isPending =
    !isVerified && localStorage.getItem('is_verified') === 'pending';

  // Display data with proper null handling
  const displayData = {
    username: user.name || 'Not provided',
    userId: userId || 'Not provided',
    uid: user.uid || 'Not provided',
    email: user.email || 'Not provided',
    phone: userDetail.phone_number || 'Not provided',
    country: userDetail.user_country || 'Not specified',
    tradingLevel: userDetail.tier ? 'Premium Tier' : 'Level 1',
    profileImage: userDetail.user_profile || null,
    referralCode: user.referral_code || 'Not available',
    role: user.role || 'client',
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative">
        <ProfileNavBar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex justify-center items-center py-12 sm:py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
            <span className="ml-3 text-sm sm:text-base">Loading profile...</span>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex flex-col items-center justify-center py-12 sm:py-16">
            <div className="text-red-500 mb-4">
              <svg
                className="w-10 h-10 sm:w-12 sm:h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-gray-900 dark:text-gray-100 mb-2 text-center">
              Error loading profile
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center px-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-[#FE7400] text-white rounded-md hover:bg-orange-600 transition-colors text-sm sm:text-base"
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-semibold mb-6 sm:mb-8">Profile</h1>

        {/* Profile Avatar Section */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-8">
            <div className="relative flex justify-center sm:justify-start">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                {displayData.profileImage ? (
                  <img
                    src={displayData.profileImage}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-3xl sm:text-4xl">👤</span>
                )}
              </div>
           
            </div>

            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center sm:text-left">Personal info</h2>

              {/* Nickname */}
                            {/* Nickname */}
              <div className="border-b border-gray-200 dark:border-gray-700 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                  <div className="sm:w-1/3">
                    <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                      Nickname
                    </span>
                  </div>
                  <div className="flex-1 sm:w-1/3 flex justify-between items-center">
                    <span className="text-sm sm:text-base font-medium sm:font-normal">{displayData.username}</span>
                    {/* <Link
                      to="/account/profile/change-nickname"
                      className="inline-block text-sm py-1.5 px-3 sm:py-1 sm:px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-2 sm:hidden"
                    >
                      Change
                    </Link> */}
                  </div>
                  {/* <div className="hidden sm:block sm:w-1/3 sm:text-right">
                    <Link
                      to="/account/profile/change-nickname"
                      className="inline-block text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Change
                    </Link>
                  </div> */}
                </div>
              </div>


              {/* User ID */}
              <div className="border-b border-gray-200 dark:border-gray-700 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                  <div className="sm:w-1/3">
                    <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                      User ID
                    </span>
                  </div>
                  <div className="flex-1 sm:w-1/3 flex justify-between items-center">
                    <span className="text-sm sm:text-base font-medium sm:font-normal break-all">{displayData.userId}</span>
                    <button
                      onClick={() => handleCopy(displayData.userId)}
                      className="inline-block text-sm py-1.5 px-3 sm:py-1 sm:px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-2 sm:hidden"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="hidden sm:block sm:w-1/3 sm:text-right">
                    <button
                      onClick={() => handleCopy(displayData.userId)}
                      className="inline-block text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* UID */}
              <div className="border-b border-gray-200 dark:border-gray-700 py-3 sm:py-4">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
                  <div className="sm:w-1/3">
                    <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">UID</span>
                  </div>
                  <div className="flex-1 sm:w-1/3 flex justify-between items-center">
                    <span className="text-sm sm:text-base font-medium sm:font-normal break-all">{displayData.uid}</span>
                    <button
                      onClick={() => handleCopy(displayData.uid)}
                      className="inline-block text-sm py-1.5 px-3 sm:py-1 sm:px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-2 sm:hidden"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="hidden sm:block sm:w-1/3 sm:text-right">
                    <button
                      onClick={() => handleCopy(displayData.uid)}
                      className="inline-block text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Info Section */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Verification info</h2>

          {/* Country/Region */}
          <div className="border-b border-gray-200 dark:border-gray-700 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
              <div className="sm:w-1/3">
                <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                  Country/Region
                </span>
              </div>
              <div className="flex-1 sm:w-1/3 flex justify-between items-center">
                <span className="text-sm sm:text-base font-medium sm:font-normal">{displayData.country}</span>
                <button className="inline-block text-sm py-1.5 px-3 sm:py-1 sm:px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-2 sm:hidden">
                  View details
                </button>
              </div>
              
            </div>
          </div>
        </div>

        {/* Account Details Section */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Account details</h2>

           {/* Password Field */}
          <div className="border-b border-gray-200 dark:border-gray-700 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
              <div className="sm:w-1/3">
                <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Password</span>
              </div>
              <div className="flex-1 sm:w-1/3 flex justify-between items-center">
                <span className="text-sm sm:text-base font-medium sm:font-normal">••••••••</span>
                <Link
                  to="/account/profile/security/change-password"
                  className="inline-block text-sm py-1.5 px-3 sm:py-1 sm:px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-2 sm:hidden"
                >
                  Change
                </Link>
              </div>
              <div className="hidden sm:block sm:w-1/3 sm:text-right">
                <Link
                  to="/account/profile/security/change-password"
                  className="inline-block text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Change
                </Link>
              </div>
            </div>
          </div>

         {/* Email */}
          <div className="border-b border-gray-200 dark:border-gray-700 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
              <div className="sm:w-1/3">
                <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Email</span>
              </div>
              <div className="flex-1 sm:w-1/3 flex justify-between items-center">
                <span className="text-sm sm:text-base font-medium sm:font-normal break-all">{displayData.email}</span>
                <Link
                  to="/account/profile/security/change-email"
                  className="inline-block text-sm py-1.5 px-3 sm:py-1 sm:px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-2 sm:hidden"
                >
                  Change
                </Link>
              </div>
              <div className="hidden sm:block sm:w-1/3 sm:text-right">
                <Link
                  to="/account/profile/security/change-email"
                  className="inline-block text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Change
                </Link>
              </div>
            </div>
          </div>

           {/* Phone */}
          <div className="border-b border-gray-200 dark:border-gray-700 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
              <div className="sm:w-1/3">
                <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Phone</span>
              </div>
              <div className="flex-1 sm:w-1/3 flex justify-between items-center">
                <span className="text-sm sm:text-base font-medium sm:font-normal break-all">{displayData.phone}</span>
                <button className="inline-block text-sm py-1.5 px-3 sm:py-1 sm:px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-2 sm:hidden">
                  Change
                </button>
              </div>
              <div className="hidden sm:block sm:w-1/3 sm:text-right">
                <button className="inline-block text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Change
                </button>
              </div>
            </div>
          </div>

         {/* Referral Code */}
          <div className="border-b border-gray-200 dark:border-gray-700 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
              <div className="sm:w-1/3">
                <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                  Referral Code
                </span>
              </div>
              <div className="flex-1 sm:w-1/3 flex justify-between items-center">
                <span className="text-sm sm:text-base font-medium sm:font-normal break-all">{displayData.referralCode}</span>
                <button
                  onClick={() => handleCopy(displayData.referralCode)}
                  className="inline-block text-sm py-1.5 px-3 sm:py-1 sm:px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-2 sm:hidden"
                >
                  Copy
                </button>
              </div>
              <div className="hidden sm:block sm:w-1/3 sm:text-right">
                <button
                  onClick={() => handleCopy(displayData.referralCode)}
                  className="inline-block text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Trading Fee Tier */}
          <div className="border-b border-gray-200 dark:border-gray-700 py-3 sm:py-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
              <div className="sm:w-1/3">
                <span className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                  Trading fee tier
                </span>
              </div>
              <div className="flex-1 sm:w-1/3 flex justify-between items-center">
                <span className="text-sm sm:text-base font-medium sm:font-normal">{displayData.tradingLevel}</span>
                <button 
                  onClick={() => setShowTradingFeeModal(true)}
                  className="inline-block text-sm py-1.5 px-3 sm:py-1 sm:px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-2 sm:hidden"
                >
                  View details
                </button>
              </div>
              <div className="hidden sm:block sm:w-1/3 sm:text-right">
             
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Fee Tier Modal */}
      {showTradingFeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 sm:bg-gray-600 sm:bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg sm:w-full rounded-t-2xl sm:rounded-lg shadow-xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto relative">
            {/* Mobile handle bar */}
            <div className="sm:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
            
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white pr-4 leading-tight">
                  Trading Fee Tier Details
                </h3>
                <button
                  onClick={() => setShowTradingFeeModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 sm:p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3 sm:space-y-4 text-sm sm:text-base leading-relaxed">
                <p className="text-gray-700 dark:text-gray-300">
                  Your current trading fee tier is <strong className="text-gray-900 dark:text-white">{displayData.tradingLevel}</strong>.
                </p>
                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 sm:p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <strong className="text-gray-900 dark:text-white">Level 1:</strong> Enjoy standard trading fees.
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    This tier applies to users with a 30-day trading volume below $5,000,000 USDT or total assets below $100,000 USDT.
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 sm:p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <strong className="text-orange-600 dark:text-orange-400">Premium Tier:</strong> Benefit from reduced trading fees.
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    This tier is for users with a 30-day trading volume exceeding $5,000,000 USDT or total assets above $100,000 USDT.
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 sm:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                    💡 Pro Tip
                  </p>
                  <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 mt-1">
                    Fees are calculated daily based on your 30-day trading volume and daily asset balance. Trade more to unlock better rates!
                  </p>
                </div>
              </div>
              
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-end">
                <button
                  onClick={() => setShowTradingFeeModal(false)}
                  className="w-full sm:w-auto px-6 py-3 sm:px-6 sm:py-2 bg-[#FE7400] text-white rounded-lg sm:rounded-md hover:bg-orange-600 active:bg-orange-700 transition-colors text-sm sm:text-base font-medium"
                >
                  Close
                </button>
              </div>
            </div>
            
            {/* Safe area padding for mobile */}
            <div className="sm:hidden h-safe-area-inset-bottom"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;