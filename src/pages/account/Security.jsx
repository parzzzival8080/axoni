import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import ProfileNavBar from '../../components/profile/ProfileNavBar';
import { useIsMobile } from '../../hooks/useIsMobile';
import axios from 'axios';

const Security = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        if (!userId) { setError('User ID not found.'); setIsLoading(false); return; }
        const response = await axios.get(
          `https://django.axoni.co/api/user_account/getUserInformation/?user_id=${userId}`
        );
        if (response.data?.user) setProfileData(response.data);
        else setError('User data format invalid.');
      } catch { setError('Failed to fetch user details.'); }
      finally { setIsLoading(false); }
    };
    fetchUserData();
  }, [userId]);

  const storedUser = localStorage.getItem('user');
  const localUser = storedUser ? JSON.parse(storedUser) : {};
  const user = profileData?.user || { email: localUser.email || 'Not provided' };
  const isVerified = profileData?.user_detail?.is_verified || localStorage.getItem('is_verified') === 'true';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        {!isMobile && <ProfileNavBar />}
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#2EBD85] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#121212] flex flex-col items-center justify-center px-6">
        {!isMobile && <ProfileNavBar />}
        <p className="text-[#848E9C] text-sm mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-[#2EBD85] text-white rounded-lg text-sm font-medium">Try Again</button>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#121212] text-white pb-20">
        <div className="px-4 pt-2">
          <h2 className="text-lg font-semibold mb-4">Security</h2>

          {/* Verification Status */}
          <div className="bg-[#1E1E1E] rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2EBD85]/15 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium">Identity Verification</p>
                  <p className="text-[10px] text-[#5E6673]">{isVerified ? 'Your account is verified' : 'Verify to unlock all features'}</p>
                </div>
              </div>
              <span className={`text-[10px] font-medium px-2 py-1 rounded-md ${isVerified ? 'bg-[#2EBD85]/15 text-[#2EBD85]' : 'bg-[#F5A623]/15 text-[#F5A623]'}`}>
                {isVerified ? 'Verified' : 'Verify'}
              </span>
            </div>
          </div>

          {/* Authentication */}
          <div className="bg-[#1E1E1E] rounded-xl overflow-hidden mb-4">
            <h3 className="px-4 pt-3 pb-1 text-xs font-medium text-[#5E6673] uppercase tracking-wider">Authentication</h3>

            <button onClick={() => navigate('/account/profile/security/change-email')} className="flex items-center justify-between w-full px-4 py-3.5 border-b border-[#2A2A2A] active:bg-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#848E9C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
                </svg>
                <div className="text-left">
                  <p className="text-sm">Email</p>
                  <p className="text-[10px] text-[#5E6673]">{user.email}</p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5E6673" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>

            <button onClick={() => navigate('/account/profile/security/change-password')} className="flex items-center justify-between w-full px-4 py-3.5 active:bg-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#848E9C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <div className="text-left">
                  <p className="text-sm">Password</p>
                  <p className="text-[10px] text-[#5E6673]">Change your login password</p>
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5E6673" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>

          {/* Advanced */}
          <div className="bg-[#1E1E1E] rounded-xl overflow-hidden">
            <h3 className="px-4 pt-3 pb-1 text-xs font-medium text-[#5E6673] uppercase tracking-wider">Advanced</h3>

            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#848E9C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" /><circle cx="12" cy="16" r="1" />
                </svg>
                <div>
                  <p className="text-sm">2FA Authenticator</p>
                  <p className="text-[10px] text-[#5E6673]">Extra security layer</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-md bg-[#1E1E1E] text-[#5E6673] border border-[#2A2A2A]">Coming soon</span>
            </div>

            <div className="flex items-center justify-between px-4 py-3.5">
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#848E9C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" />
                </svg>
                <div>
                  <p className="text-sm">Anti-phishing Code</p>
                  <p className="text-[10px] text-[#5E6673]">Verify authentic emails</p>
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-md bg-[#1E1E1E] text-[#5E6673] border border-[#2A2A2A]">Coming soon</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop
  return (
    <div className="min-h-screen bg-[#121212] text-white relative">
      <ProfileNavBar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h3 className="text-xl font-semibold mb-6">Authentication methods</h3>
        <div className="border-t border-[#2A2A2A] py-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email authentication</h4>
              <p className="text-xs text-[#5E6673]">Get authentication codes via email</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#5E6673] text-sm">{user.email}</span>
              <button onClick={() => navigate('/account/profile/security/change-email')} className="text-[#2EBD85] text-sm font-medium">Change</button>
            </div>
          </div>
        </div>
        <div className="border-t border-[#2A2A2A] py-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Login password</h4>
              <p className="text-xs text-[#5E6673]">Use this password for account login</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#5E6673] text-sm">••••••••</span>
              <button onClick={() => navigate('/account/profile/security/change-password')} className="text-[#2EBD85] text-sm font-medium">Change</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
