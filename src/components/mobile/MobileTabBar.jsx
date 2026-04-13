import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X } from "lucide-react";

// Custom tab bar icons — outlined (inactive) and filled (active)
const HomeIcon = ({ active }) => active ? (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.707 2.293a1 1 0 00-1.414 0l-9 9A1 1 0 003 13h1v7a2 2 0 002 2h4v-5a1 1 0 011-1h2a1 1 0 011 1v5h4a2 2 0 002-2v-7h1a1 1 0 00.707-1.707l-9-9z" />
  </svg>
) : (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
  </svg>
);

const MarketsIcon = ({ active }) => active ? (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3v18h18v-2H5V3H3zm14 4a1 1 0 011 1v8a1 1 0 11-2 0V8a1 1 0 011-1zm-4 4a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1zm-4 2a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1z" />
  </svg>
) : (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="16" y="7" width="3" height="10" rx="1" />
    <rect x="11.5" y="11" width="3" height="6" rx="1" />
    <rect x="7" y="13" width="3" height="4" rx="1" />
    <path d="M3 3v18h18" />
  </svg>
);

const TradeIcon = ({ active }) => active ? (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
    <path d="M7 10l5-5 5 5M7 14l5 5 5-5" opacity="0.9" />
  </svg>
) : (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 7l4-4 4 4" />
    <path d="M16 17l-4 4-4-4" />
    <path d="M12 3v18" />
    <path d="M4 12h16" />
  </svg>
);

const AssetsIcon = ({ active }) => active ? (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 7H3a1 1 0 00-1 1v8a1 1 0 001 1h18a1 1 0 001-1V8a1 1 0 00-1-1zm-1 8H4V9h16v6z" />
    <path d="M5 5h14a1 1 0 011 1v1H4V6a1 1 0 011-1z" opacity="0.6" />
    <circle cx="16" cy="12" r="2" />
  </svg>
) : (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="10" rx="2" />
    <path d="M6 7V5a2 2 0 012-2h8a2 2 0 012 2v2" />
    <circle cx="16" cy="12" r="1.5" />
  </svg>
);

const AccountIcon = ({ active }) => active ? (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="8" r="4" />
    <path d="M20 21a8 8 0 00-16 0" />
  </svg>
) : (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3.5" />
    <path d="M20 21c0-3.87-3.58-7-8-7s-8 3.13-8 7" />
  </svg>
);

// Trade sheet icons
const SpotIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const FuturesIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M7 16l4-8 4 4 4-8" />
  </svg>
);

const ConvertIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 4v6h6" />
    <path d="M23 4l-6 6" />
    <path d="M7 20v-6H1" />
    <path d="M1 20l6-6" />
  </svg>
);

const tabs = [
  { label: "Home", IconComponent: HomeIcon, path: "/" },
  { label: "Markets", IconComponent: MarketsIcon, path: "/market" },
  { label: "Trade", IconComponent: TradeIcon, path: "__trade_menu__" },
  { label: "Assets", IconComponent: AssetsIcon, path: "/my-assets" },
  { label: "Account", IconComponent: AccountIcon, path: "/account/profile" },
];

const TransferIcon = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 7h12l-4-4" />
    <path d="M16 17H4l4 4" />
  </svg>
);

const tradeOptions = [
  { label: "Spot", IconComponent: SpotIcon, path: "/spot-trading", description: "Buy and sell crypto" },
  { label: "Futures", IconComponent: FuturesIcon, path: "/future-trading", description: "Trade with leverage" },
  { label: "Convert", IconComponent: ConvertIcon, path: "/conversion", description: "Swap crypto instantly" },
  { label: "Transfer", IconComponent: TransferIcon, path: "/transfer", description: "Move funds between wallets" },
];

const TRADE_PATHS = ["/spot-trading", "/future-trading", "/conversion", "/transfer"];

const MobileTabBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showTradeMenu, setShowTradeMenu] = useState(false);

  const isActive = (path) => {
    if (path === "__trade_menu__") return TRADE_PATHS.some(p => location.pathname === p || location.pathname.startsWith(p + "/"));
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleTabClick = (path) => {
    if (path === "__trade_menu__") {
      setShowTradeMenu(true);
    } else {
      setShowTradeMenu(false);
      navigate(path);
    }
  };

  return (
    <>
      {/* Trade Menu Bottom Sheet */}
      {showTradeMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[55]"
            onClick={() => setShowTradeMenu(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-[56] bg-[#1A1A1A] rounded-t-2xl animate-slide-up"
            style={{ paddingBottom: "calc(56px + env(safe-area-inset-bottom, 0px))" }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#2A2A2A]" />
            </div>
            <div className="flex items-center justify-between px-5 pt-2 pb-3">
              <h3 className="text-white font-semibold text-base">Trade</h3>
              <button onClick={() => setShowTradeMenu(false)} className="w-8 h-8 rounded-full bg-[#1E1E1E] flex items-center justify-center">
                <X size={16} className="text-[#5E6673]" />
              </button>
            </div>
            <div className="px-4 pb-4 space-y-1">
              {tradeOptions.map(({ label, IconComponent, path, description }) => {
                const active = location.pathname === path;
                return (
                  <button
                    key={path}
                    onClick={() => {
                      setShowTradeMenu(false);
                      navigate(path);
                    }}
                    className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-colors ${
                      active ? "bg-[#1E1E1E]" : "hover:bg-[#2A2A2A]"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      active ? "bg-[#2EBD85]/15" : "bg-[#1E1E1E]"
                    }`}>
                      <span className={active ? "text-[#2EBD85]" : "text-[#848E9C]"}>
                        <IconComponent active={active} />
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-medium ${active ? "text-white" : "text-gray-200"}`}>{label}</p>
                      <p className="text-xs text-[#5E6673]">{description}</p>
                    </div>
                    {active && (
                      <div className="w-5 h-5 rounded-full bg-[#2EBD85] flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Tab Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212] border-t border-[#1E1E1E] flex items-center justify-around"
        style={{
          height: "calc(60px + env(safe-area-inset-bottom, 0px))",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {tabs.map(({ label, IconComponent, path }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => handleTabClick(path)}
              className={`flex flex-col items-center justify-center flex-1 h-full pt-1.5 transition-colors ${
                active ? "text-[#2EBD85]" : "text-[#5E6673]"
              }`}
            >
              <IconComponent active={active} />
              <span className={`text-[10px] mt-1 ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default MobileTabBar;
