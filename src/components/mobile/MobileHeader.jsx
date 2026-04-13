import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import ConnectionIndicator from "./ConnectionIndicator";

const TAB_ROUTES = ["/", "/market", "/spot-trading", "/my-assets", "/account/profile"];

const ROUTE_TITLES = {
  "/": "",
  "/market": "Markets",
  "/spot-trading": "Trade",
  "/future-trading": "Futures",
  "/my-assets": "Assets",
  "/account/profile": "Account",
  "/account/overview": "Overview",
  "/account/profile/verify": "Verification",
  "/account/profile/security": "Security",
  "/account/profile/security/change-password": "Change Password",
  "/account/profile/security/change-email": "Change Email",
  "/account/profile/preferences": "Preferences",
  "/account/profile/sub-accounts": "Sub-accounts",
  "/account/profile/api": "API Management",
  "/account/profile/third-party": "Third-party Authorization",
  "/deposit": "Deposit",
  "/withdraw": "Withdraw",
  "/transfer": "Transfer",
  "/conversion": "Convert",
  "/earn": "Earn",
  "/earn/simple-earn": "Simple Earn",
  "/about-us": "About Us",
  "/legal": "Legal",
  "/download": "Download",
  "/get-started": "Get Started",
  "/terms-conditions": "Terms & Conditions",
  "/privacy-policy": "Privacy Policy",
  "/coming-soon": "Coming Soon",
  "/help/category/announcements": "Announcements",
  "/pages/morePages/CampaignCenter": "Campaign Center",
  "/pages/morePages/MyRewards": "My Rewards",
  "/pages/morePages/Referral": "Referral",
};

const ROUTE_TITLE_PATTERNS = [
  { prefix: "/help/announcements/", title: "Announcement" },
  { prefix: "/help/deposit/", title: "Deposit Guide" },
  { prefix: "/help/withdrawal/", title: "Withdrawal Guide" },
];

const resolveTitle = (pathname) => {
  if (ROUTE_TITLES[pathname] !== undefined) return ROUTE_TITLES[pathname];
  for (const { prefix, title } of ROUTE_TITLE_PATTERNS) {
    if (pathname.startsWith(prefix)) return title;
  }
  return "GLD";
};

const handleBack = (navigate) => {
  if (window.history.length <= 2) {
    navigate("/");
  } else {
    navigate(-1);
  }
};

const MobileHeader = ({ title, actions, darkBg = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showChat, setShowChat] = useState(false);
  const [isChatLoaded, setIsChatLoaded] = useState(false);

  const isTabRoute = TAB_ROUTES.includes(location.pathname);
  const isHome = location.pathname === "/";
  const displayTitle = title || resolveTitle(location.pathname);

  return (
    <>
    {/* Chat iframe popup */}
    {showChat && (
      <div className="fixed bottom-20 right-3 z-[200] shadow-2xl" style={{ borderRadius: 12, overflow: 'hidden' }}>
        <div className="flex items-center justify-between bg-[#1E1E1E] px-3 py-2">
          <span className="text-white text-sm font-semibold">Live Chat</span>
          <button onClick={() => { setShowChat(false); setIsChatLoaded(false); }} className="text-gray-400 hover:text-white p-1 active:opacity-60">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!isChatLoaded && (
          <div className="flex flex-col items-center justify-center gap-3 bg-[#121212]" style={{ width: 340, height: 520 }}>
            <div className="w-10 h-10 rounded-full border-2 border-[#2A2A2A] border-t-[#2EBD85] animate-spin" />
            <span className="text-xs text-gray-500">Connecting to support...</span>
          </div>
        )}

        <iframe
          src="https://bot-chatter.vercel.app/livechat/widget?color=2EBD85&source=axoni.co"
          width="340"
          height="520"
          style={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', display: isChatLoaded ? 'block' : 'none' }}
          title="Live Chat"
          onLoad={() => setIsChatLoaded(true)}
        />
      </div>
    )}

    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[#121212]"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="flex items-center justify-between h-11 px-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          {!isTabRoute ? (
            <button onClick={() => handleBack(navigate)} className="-ml-2 p-1 active:opacity-60">
              <ChevronLeft size={22} className="text-white" />
            </button>
          ) : isHome ? (
            <button onClick={() => navigate("/account/profile")} className="active:opacity-60">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#848E9C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M20 21c0-3.87-3.58-7-8-7s-8 3.13-8 7" />
              </svg>
            </button>
          ) : null}
          {displayTitle && (
            <span className="text-[15px] font-semibold text-white">{displayTitle}</span>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-5">
          <ConnectionIndicator />
          {isTabRoute && (
            <>
              <button onClick={() => navigate("/market")} className="active:opacity-60">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#848E9C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </button>
              <button onClick={() => setShowChat(v => !v)} className="active:opacity-60">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={showChat ? "#2EBD85" : "#848E9C"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
              </button>
              <button onClick={() => navigate("/help/category/announcements")} className="active:opacity-60 relative">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#848E9C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[#F6465D] rounded-full"></span>
              </button>
            </>
          )}
          {actions}
        </div>
      </div>
    </header>
    </>
  );
};

export default MobileHeader;
