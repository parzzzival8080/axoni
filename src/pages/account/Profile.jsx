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
          `https://django.bhtokens.com/api/user_account/getUserInformation/?user_id=${userId}`
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
            <div className="text-red-500 mb-2">
              <svg
                className="w-12 h-12"
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              Error loading profile
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#FE7400] text-white rounded-md hover:bg-orange-600 transition-colors"
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-8">Profile</h1>

        {/* Profile Avatar Section */}
        <div className="mb-10">
          <div className="flex items-start gap-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                {displayData.profileImage ? (
                  <img
                    src={displayData.profileImage}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-4xl">👤</span>
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md">
                <FiEdit className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Personal info</h2>

              <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
                <div className="w-1/3">
                  <span className="text-gray-500 dark:text-gray-400">
                    Nickname
                  </span>
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
                  <span className="text-gray-500 dark:text-gray-400">
                    User ID
                  </span>
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
            </div>
          </div>
        </div>

        {/* Verification Info Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Verification info</h2>

          {/* <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
            <div className="w-1/3">
              <span className="text-gray-500 dark:text-gray-400">
                Identity verification
              </span>
            </div>
            <div className="w-1/3 flex items-center">
              {isVerified ? (
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold text-sm border border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700">
                  <FiCheck className="mr-2 text-green-500" /> Verified
                </span>
              ) : isPending ? (
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm border border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700">
                  <FiShield className="mr-2 text-orange-500" /> Pending Review
                </span>
              ) : (
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 font-semibold text-sm border border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700">
                  <FiShield className="mr-2 text-yellow-500" /> Not Verified
                </span>
              )}
            </div>
            <div className="w-1/3 text-right">
              <Link
                to="/account/profile/verify"
                className="text-sm py-1.5 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                View Details
              </Link>
              {isPending && (
                <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 text-right">
                  Your verification is under review. Please wait for an email
                  update.
                </div>
              )}
            </div>
          </div> */}

          <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
            <div className="w-1/3">
              <span className="text-gray-500 dark:text-gray-400">
                Country/Region
              </span>
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
              <button className="text-sm py-1 px-3 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Change
              </button>
            </div>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
            <div className="w-1/3">
              <span className="text-gray-500 dark:text-gray-400">
                Referral Code
              </span>
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

          <div className="border-b border-gray-200 dark:border-gray-700 py-4 flex items-center">
            <div className="w-1/3">
              <span className="text-gray-500 dark:text-gray-400">
                Trading fee tier
              </span>
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
