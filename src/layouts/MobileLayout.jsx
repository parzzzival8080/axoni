import React from "react";
import MobileHeader from "../components/mobile/MobileHeader";
import MobileTabBar from "../components/mobile/MobileTabBar";
import ToastNotification from "../components/mobile/ToastNotification";
import AppBanner from "../components/common/AppBanner";

const MobileLayout = ({ children, title, actions, darkBg = false, hideTabBar = false, hideHeader = false }) => {
  return (
    <div className={`${darkBg ? "bg-[#0a0a0a]" : "bg-[#0a0a0a]"}`}>
      <AppBanner />
      {!hideHeader && <MobileHeader title={title} actions={actions} darkBg={darkBg} />}
      <ToastNotification />
      <main
        className="overflow-y-auto"
        style={{
          paddingTop: hideHeader ? "0px" : "calc(44px + env(safe-area-inset-top, 0px))",
          paddingBottom: hideTabBar ? "0px" : "calc(60px + env(safe-area-inset-bottom, 0px))",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
      {!hideTabBar && <MobileTabBar />}
    </div>
  );
};

export default MobileLayout;
