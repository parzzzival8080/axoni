import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProfileNavBar from '../../components/profile/ProfileNavBar';
import axios from 'axios';
import { useIsMobile } from '../../hooks/useIsMobile';
import MobileSettingsPanel from '../../components/mobile/MobileSettingsPanel';

const Profile = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [profileData, setProfileData] = React.useState(null);
  const [showTradingFeeModal, setShowTradingFeeModal] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState(null);

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
          `https://django.axoni.co/api/user_account/getUserInformation/?user_id=${userId}`
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

  const fallbackData = {
    user: {
      name: localUser.username || 'User',
      email: localUser.email || 'user@example.com',
      uid: localUser.uid || 'N/A',
      referral_code: localUser.referral_code || 'N/A',
    },
    user_detail: {
      phone_number: localUser.phone || null,
      user_country: localUser.country || null,
      user_profile: localUser.profileImage || null,
      is_verified: localUser.is_verified === true || localStorage.getItem('is_verified') === 'true',
    },
  };

  const user = profileData?.user || fallbackData.user;
  const userDetail = profileData?.user_detail || fallbackData.user_detail;
  const isVerified = userDetail.is_verified === true;

  const displayData = {
    username: user.name || 'Not provided',
    userId: userId || 'N/A',
    uid: user.uid || 'N/A',
    email: user.email || 'Not provided',
    phone: userDetail.phone_number || 'Not provided',
    country: userDetail.user_country || 'Not specified',
    profileImage: userDetail.user_profile || null,
    referralCode: user.referral_code || 'N/A',
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <div className="bg-[#121212] flex items-center justify-center">
        {!isMobile && <ProfileNavBar />}
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2EBD85] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#121212] flex flex-col items-center justify-center px-6">
        {!isMobile && <ProfileNavBar />}
        <p className="text-[#848E9C] text-sm mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-[#2EBD85] text-white rounded-lg text-sm font-medium">
          Try Again
        </button>
      </div>
    );
  }

  // Mobile Account Screen
  if (isMobile) {
    return (
      <div className="bg-[#121212] text-white pb-20">
        {/* Profile Card */}
        <div className="px-4 pt-2 pb-4">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 bg-[#1E1E1E] rounded-full flex items-center justify-center flex-shrink-0">
              {displayData.profileImage ? (
                <img src={displayData.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-[#848E9C] text-2xl">
                  {displayData.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold truncate">{displayData.username}</h2>
              <p className="text-[#5E6673] text-xs">UID: {displayData.uid}</p>
            </div>
            {isVerified && (
              <span className="px-2 py-1 bg-[#2EBD85]/15 text-[#2EBD85] text-[10px] font-medium rounded-md">Verified</span>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button onClick={() => navigate('/deposit')} className="flex flex-col items-center gap-1.5 py-3 bg-[#1E1E1E] rounded-xl">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              <span className="text-[10px] text-[#848E9C]">Deposit</span>
            </button>
            <button onClick={() => navigate('/withdraw')} className="flex flex-col items-center gap-1.5 py-3 bg-[#1E1E1E] rounded-xl">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              <span className="text-[10px] text-[#848E9C]">Withdraw</span>
            </button>
            <button onClick={() => navigate('/account/overview')} className="flex flex-col items-center gap-1.5 py-3 bg-[#1E1E1E] rounded-xl">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              <span className="text-[10px] text-[#848E9C]">Overview</span>
            </button>
            <button onClick={() => navigate('/account/profile/security')} className="flex flex-col items-center gap-1.5 py-3 bg-[#1E1E1E] rounded-xl">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="text-[10px] text-[#848E9C]">Security</span>
            </button>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="px-4 space-y-3">
          {/* Personal Info */}
          <div className="bg-[#1E1E1E] rounded-xl overflow-hidden">
            <h3 className="px-4 pt-3 pb-1 text-xs font-medium text-[#5E6673] uppercase tracking-wider">Personal Info</h3>
            <MenuItem label="Email" value={displayData.email} />
            <MenuItem label="Phone" value={displayData.phone} />
            <MenuItem label="Country" value={displayData.country} />
          </div>

          {/* Account */}
          <div className="bg-[#1E1E1E] rounded-xl overflow-hidden">
            <h3 className="px-4 pt-3 pb-1 text-xs font-medium text-[#5E6673] uppercase tracking-wider">Account</h3>
            <MenuItem label="User ID" value={displayData.userId} copyable onCopy={() => handleCopy(displayData.userId, 'userId')} copied={copiedField === 'userId'} />
            <MenuItem label="UID" value={displayData.uid} copyable onCopy={() => handleCopy(displayData.uid, 'uid')} copied={copiedField === 'uid'} />
            <MenuItem label="Referral Code" value={displayData.referralCode} copyable onCopy={() => handleCopy(displayData.referralCode, 'referral')} copied={copiedField === 'referral'} />
          </div>

          {/* Actions */}
          <div className="bg-[#1E1E1E] rounded-xl overflow-hidden">
            <h3 className="px-4 pt-3 pb-1 text-xs font-medium text-[#5E6673] uppercase tracking-wider">Settings</h3>
            <MenuLink label="Change Password" to="/account/profile/security/change-password" />
            <MenuLink label="Change Email" to="/account/profile/security/change-email" />
            <MenuLink label="Verification" to="/account/profile/verify" badge={isVerified ? 'Verified' : 'Verify'} badgeColor={isVerified ? '#2EBD85' : '#F5A623'} />
          </div>

          {/* Settings Panel */}
          <MobileSettingsPanel />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full py-3.5 bg-[#1E1E1E] rounded-xl text-[#F6465D] text-sm font-medium"
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  // Desktop layout (unchanged)
  return (
    <div className="bg-[#121212] text-white relative">
      <ProfileNavBar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-8">Profile</h1>

        {/* Avatar */}
        <div className="mb-10">
          <div className="flex items-start gap-8">
            <div className="w-24 h-24 bg-[#2A2A2A] rounded-full flex items-center justify-center">
              {displayData.profileImage ? (
                <img src={displayData.profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-[#5E6673] text-4xl">{displayData.username.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Personal info</h2>
              <DesktopRow label="Nickname" value={displayData.username} />
              <DesktopRow label="User ID" value={displayData.userId} copyable onCopy={() => handleCopy(displayData.userId, 'userId')} copied={copiedField === 'userId'} />
              <DesktopRow label="UID" value={displayData.uid} copyable onCopy={() => handleCopy(displayData.uid, 'uid')} copied={copiedField === 'uid'} />
            </div>
          </div>
        </div>

        {/* Verification */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Verification info</h2>
          <DesktopRow label="Country/Region" value={displayData.country} />
          <DesktopRow label="Status" value={isVerified ? 'Verified' : 'Not verified'} valueColor={isVerified ? '#2EBD85' : '#F5A623'} />
        </div>

        {/* Account Details */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Account details</h2>
          <DesktopRow label="Password" value="••••••••" action={<Link to="/account/profile/security/change-password" className="text-sm py-1 px-3 rounded-md border border-[#2A2A2A] hover:bg-[#1E1E1E] transition-colors">Change</Link>} />
          <DesktopRow label="Email" value={displayData.email} action={<Link to="/account/profile/security/change-email" className="text-sm py-1 px-3 rounded-md border border-[#2A2A2A] hover:bg-[#1E1E1E] transition-colors">Change</Link>} />
          <DesktopRow label="Phone" value={displayData.phone} />
          <DesktopRow label="Referral Code" value={displayData.referralCode} copyable onCopy={() => handleCopy(displayData.referralCode, 'referral')} copied={copiedField === 'referral'} />
        </div>
      </div>
    </div>
  );
};

// Mobile menu item
const MenuItem = ({ label, value, copyable, onCopy, copied }) => (
  <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A] last:border-b-0">
    <span className="text-[#5E6673] text-sm">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-sm text-white truncate max-w-[180px]">{value}</span>
      {copyable && (
        <button onClick={onCopy} className="text-[#5E6673] active:text-[#2EBD85]">
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
        </button>
      )}
    </div>
  </div>
);

// Mobile menu link
const MenuLink = ({ label, to, badge, badgeColor }) => (
  <Link to={to} className="flex items-center justify-between px-4 py-3.5 border-b border-[#2A2A2A] last:border-b-0 active:bg-[#2A2A2A]">
    <span className="text-sm text-white">{label}</span>
    <div className="flex items-center gap-2">
      {badge && (
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md" style={{ color: badgeColor, backgroundColor: `${badgeColor}20` }}>
          {badge}
        </span>
      )}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5E6673" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </div>
  </Link>
);

// Desktop row
const DesktopRow = ({ label, value, copyable, onCopy, copied, action, valueColor }) => (
  <div className="border-b border-[#2A2A2A] py-4">
    <div className="flex items-center">
      <div className="w-1/3">
        <span className="text-[#5E6673] text-base">{label}</span>
      </div>
      <div className="flex-1 flex justify-between items-center">
        <span className="text-base break-all" style={valueColor ? { color: valueColor } : undefined}>{value}</span>
        {copyable && (
          <button onClick={onCopy} className="text-sm py-1 px-3 rounded-md border border-[#2A2A2A] hover:bg-[#1E1E1E] transition-colors ml-2">
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
        {action && <div className="ml-2">{action}</div>}
      </div>
    </div>
  </div>
);

export default Profile;
