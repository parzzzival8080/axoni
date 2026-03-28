import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, BarChart3, TrendingUp, Wallet, User, ArrowLeftRight, X, BarChart4, Repeat } from "lucide-react";

const tabs = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Markets", icon: BarChart3, path: "/market" },
  { label: "Trade", icon: TrendingUp, path: "__trade_menu__" },
  { label: "Assets", icon: Wallet, path: "/my-assets" },
  { label: "Account", icon: User, path: "/account/profile" },
];

const tradeOptions = [
  { label: "Spot", icon: TrendingUp, path: "/spot-trading", description: "Buy and sell crypto" },
  { label: "Futures", icon: BarChart4, path: "/future-trading", description: "Trade with leverage" },
  { label: "Convert", icon: Repeat, path: "/conversion", description: "Swap crypto instantly" },
];

const TRADE_PATHS = ["/spot-trading", "/future-trading", "/conversion"];

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
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <h3 className="text-white font-semibold text-base">Trade</h3>
              <button onClick={() => setShowTradeMenu(false)} className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                <X size={16} className="text-gray-400" />
              </button>
            </div>
            <div className="px-4 pb-4 space-y-1">
              {tradeOptions.map(({ label, icon: Icon, path, description }) => {
                const active = location.pathname === path;
                return (
                  <button
                    key={path}
                    onClick={() => {
                      setShowTradeMenu(false);
                      navigate(path);
                    }}
                    className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-colors ${
                      active ? "bg-gray-800" : "hover:bg-gray-800/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      active ? "bg-[#2EBD85]/20" : "bg-gray-800"
                    }`}>
                      <Icon size={20} className={active ? "text-[#2EBD85]" : "text-gray-300"} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-medium ${active ? "text-white" : "text-gray-200"}`}>{label}</p>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                    {active && (
                      <div className="w-5 h-5 rounded-full bg-[#2EBD85] flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
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
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-gray-800 flex items-center justify-around"
        style={{
          height: "calc(56px + env(safe-area-inset-bottom, 0px))",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {tabs.map(({ label, icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              onClick={() => handleTabClick(path)}
              className={`flex flex-col items-center justify-center flex-1 h-full pt-1 ${
                active ? "text-[#2EBD85]" : "text-gray-400"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
              <span className="text-[10px] mt-0.5 font-medium">{label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default MobileTabBar;
