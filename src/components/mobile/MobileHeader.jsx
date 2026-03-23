import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, Search, MessageCircle, Bell } from "lucide-react";
import ConnectionIndicator from "./ConnectionIndicator";

const TAB_ROUTES = ["/", "/market", "/spot-trading", "/my-assets", "/account/profile"];

const ROUTE_TITLES = {
  "/": "Axoni",
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
  "/terms-condtions": "Terms & Conditions",
  "/privacy-policy": "Privacy Policy",
  "/coming-soon": "Coming Soon",
  "/help/category/announcements": "Announcements",
  "/pages/morePages/CampaignCenter": "Campaign Center",
  "/pages/morePages/MyRewards": "My Rewards",
  "/pages/morePages/Referral": "Referral",
};

// Fallback patterns for dynamic routes (prefix → title)
const ROUTE_TITLE_PATTERNS = [
  { prefix: "/help/announcements/", title: "Announcement" },
  { prefix: "/help/deposit/", title: "Deposit Guide" },
  { prefix: "/help/withdrawal/", title: "Withdrawal Guide" },
];

const resolveTitle = (pathname) => {
  // Exact match first
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  // Pattern match for dynamic routes
  for (const { prefix, title } of ROUTE_TITLE_PATTERNS) {
    if (pathname.startsWith(prefix)) return title;
  }
  return "Axoni";
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

  const isTabRoute = TAB_ROUTES.includes(location.pathname);
  const displayTitle = title || resolveTitle(location.pathname);

  const bgClass = darkBg
    ? "bg-black border-b border-gray-800"
    : "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700";

  const textClass = darkBg ? "text-white" : "text-gray-900 dark:text-white";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex items-center px-4 ${bgClass}`}
      style={{
        height: "calc(48px + env(safe-area-inset-top, 0px))",
        paddingTop: "env(safe-area-inset-top, 0px)",
      }}
    >
      <div className="flex items-center justify-between w-full h-12">
        <div className="flex items-center gap-2">
          {!isTabRoute && (
            <button
              onClick={() => handleBack(navigate)}
              className="flex items-center justify-center w-8 h-8 -ml-1"
            >
              <ChevronLeft size={24} className={textClass} />
            </button>
          )}
          <h1 className={`text-base font-semibold truncate ${textClass}`}>
            {displayTitle}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <ConnectionIndicator />
          {isTabRoute && (
            <>
              <button onClick={() => navigate("/market")} className="w-8 h-8 flex items-center justify-center">
                <Search size={18} className={darkBg ? "text-gray-300" : "text-gray-500 dark:text-gray-300"} />
              </button>
              <button onClick={() => {
                if (window.LiveChatWidget) { window.LiveChatWidget.call("maximize"); }
              }} className="w-8 h-8 flex items-center justify-center">
                <MessageCircle size={18} className={darkBg ? "text-gray-300" : "text-gray-500 dark:text-gray-300"} />
              </button>
              <button onClick={() => navigate("/help/category/announcements")} className="w-8 h-8 flex items-center justify-center relative">
                <Bell size={18} className={darkBg ? "text-gray-300" : "text-gray-500 dark:text-gray-300"} />
                <span className="absolute top-1 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </button>
            </>
          )}
          {actions}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
