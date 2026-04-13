import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import ChatBubble from "./components/common/ChatBubble";
import "./styles.css";
import ComingSoon from "./components/common/ComingSoon";
import { CryptoProvider } from "./context/CryptoContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { MetaMaskProvider } from "./context/MetaMaskContext";
import ScrollToTop from "./services/userWindowsSize";
import { FreezeCheckProvider } from "./context/FreezeCheckContext";
import { VerifyStatusProvider } from "./context/VerifyStatusContext";
import { useIsMobile } from "./hooks/useIsMobile";
import MobileLayout from "./layouts/MobileLayout";
import ErrorBoundary from "./components/common/ErrorBoundary";

// Initialize dark mode from localStorage before first render
if (typeof window !== 'undefined') {
  const savedDarkMode = localStorage.getItem('darkMode');
  if (savedDarkMode === 'true') {
    document.documentElement.classList.add('dark');
  } else if (savedDarkMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }
}

// Lazy-loaded page components (code splitting)
const HomePage = React.lazy(() => import("./pages/HomePage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const SpotTrading = React.lazy(() => import("./pages/SpotTrading"));
const LoginPage = React.lazy(() => import("./pages/login/LoginPage"));
const SignUpPage = React.lazy(() => import("./pages/SignUpPage"));
const FutureTrading = React.lazy(() => import("./pages/FutureTrading"));
const Assets = React.lazy(() => import("./pages/Assets"));
const Conversion = React.lazy(() => import("./pages/Conversion"));
const Earn = React.lazy(() => import("./pages/Earn"));
const SimpleEarn = React.lazy(() => import("./components/earn/SimpleEarn"));
const Overview = React.lazy(() => import("./pages/account/Overview"));
const Profile = React.lazy(() => import("./pages/account/Profile"));
const Market = React.lazy(() => import("./pages/Market"));
const DownloadPage = React.lazy(() => import("./pages/DownloadPage"));
const AboutUs = React.lazy(() => import("./pages/AboutUs"));
const Legal = React.lazy(() => import("./pages/Legal"));
const Announcement = React.lazy(() => import("./pages/supportCenter/announcement/Announcement"));
const Article = React.lazy(() => import("./pages/supportCenter/announcement/Article"));
const Deposit = React.lazy(() => import("./pages/account/Deposit"));
const Withdraw = React.lazy(() => import("./pages/account/Withdraw"));
const Transfer = React.lazy(() => import("./pages/account/Transfer"));
const VerifyPage = React.lazy(() => import("./pages/account/VerifyPage"));
const ChangePassword = React.lazy(() => import("./pages/account/ChangePassword"));
const ChangeEmail = React.lazy(() => import("./pages/account/ChangeEmail"));
const Security = React.lazy(() => import("./pages/account/Security"));
const TradingChartWebView = React.lazy(() => import("./pages/trading_chartWebView"));
const DepositGuide = React.lazy(() => import("./components/faq/depositGuide"));
const WithdrawalGuide = React.lazy(() => import("./components/faq/withdrawGuide"));
const GetStarted = React.lazy(() => import("./components/common/GetStarted"));
const TermsAndConditions = React.lazy(() => import("./components/common/footerContent/TermsAndConditions"));
const PrivacyPolicy = React.lazy(() => import("./components/common/footerContent/PolicyContent"));
const CampaignCenter = React.lazy(() => import("./pages/morePages/CampaignCenter"));
const MyRewards = React.lazy(() => import("./pages/morePages/MyRewards"));
const Referral = React.lazy(() => import("./pages/morePages/Referral"));

// Loading fallback for Suspense
const LoadingFallback = () => (
  <div className="p-4 space-y-4">
    <div className="animate-pulse bg-[#1E1E1E] rounded h-6 w-48"></div>
    <div className="animate-pulse bg-[#1E1E1E] rounded h-4 w-full"></div>
    <div className="animate-pulse bg-[#1E1E1E] rounded-lg h-32 w-full"></div>
    <div className="animate-pulse bg-[#1E1E1E] rounded h-4 w-3/4"></div>
    <div className="animate-pulse bg-[#1E1E1E] rounded-lg h-12 w-full"></div>
  </div>
);

// Layout wrapper: renders MobileLayout on mobile, desktop layout otherwise
const LayoutWrapper = ({ children, showFooter = true, showChat = true, darkBg = false, hideTabBar = false, hideHeader = false }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileLayout darkBg={darkBg} hideTabBar={hideTabBar} hideHeader={hideHeader}>{children}</MobileLayout>;
  }

  return (
    <>
      <Navbar />
      {children}
      {showFooter && <Footer />}
      {showChat && <ChatBubble />}
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
    <MetaMaskProvider>
      <CurrencyProvider>
        <CryptoProvider>
          <Router>
            <FreezeCheckProvider>
              <VerifyStatusProvider>
                <div className="App">
                  <ScrollToTop />
                  <React.Suspense fallback={<LoadingFallback />}>
                    <Routes>
                      {/* === No layout routes === */}
                      <Route path="/tradingviewEmbed" element={<TradingChartWebView />} />
                      <Route path="/trading_chartWebView" element={<TradingChartWebView />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/signup" element={<SignUpPage />} />

                      {/* Iframe routes */}
                      <Route path="/appstore" element={<div style={{ height: "100vh", width: "100%" }}><iframe src="/landing/appstore.html" style={{ width: "100%", height: "100%", border: "none" }} title="GLD Coin App Store" /></div>} />
                      <Route path="/playstore" element={<div style={{ height: "100vh", width: "100%" }}><iframe src="/landing/playstore.html" style={{ width: "100%", height: "100%", border: "none" }} title="GLD Coin Play Store" /></div>} />
                      <Route path="/landing/playstore" element={<div style={{ height: "100vh", width: "100%" }}><iframe src="/landing/playstore.html" style={{ width: "100%", height: "100%", border: "none" }} title="GLD Coin Play Store" /></div>} />
                      <Route path="/landing/appstore.html" element={<div style={{ height: "100vh", width: "100%" }}><iframe src="/landing/appstore.html" style={{ width: "100%", height: "100%", border: "none" }} title="GLD Coin App Store" /></div>} />
                      <Route path="/metamask" element={<div style={{ height: "100vh", width: "100%" }}><iframe src="../public/metamask/metamask.html" style={{ width: "100%", height: "100%", border: "none" }} title="MetaMask Integration" /></div>} />

                      {/* === Layout routes (LayoutWrapper handles mobile/desktop) === */}

                      {/* Trading — hideHeader because trading has its own SubHeader, keep tabBar for navigation */}
                      <Route path="/spot-trading" element={<LayoutWrapper showFooter={false} showChat={false} darkBg><SpotTrading /></LayoutWrapper>} />
                      <Route path="/future-trading" element={<LayoutWrapper showFooter={false} showChat={false} darkBg><FutureTrading /></LayoutWrapper>} />

                      {/* Finance */}
                      <Route path="/deposit" element={<LayoutWrapper showChat={false} darkBg><Deposit /></LayoutWrapper>} />
                      <Route path="/withdraw" element={<LayoutWrapper showChat={false} darkBg><Withdraw /></LayoutWrapper>} />
                      <Route path="/transfer" element={<LayoutWrapper showChat={false} darkBg><Transfer /></LayoutWrapper>} />
                      <Route path="/conversion" element={<LayoutWrapper showChat={false} darkBg><Conversion /></LayoutWrapper>} />

                      {/* Earn */}
                      <Route path="/earn" element={<LayoutWrapper darkBg><Earn /></LayoutWrapper>} />
                      <Route path="/earn/simple-earn" element={<LayoutWrapper darkBg><SimpleEarn /></LayoutWrapper>} />

                      {/* Account */}
                      <Route path="/account/overview" element={<LayoutWrapper><Overview /></LayoutWrapper>} />
                      <Route path="/account/profile" element={<LayoutWrapper><Profile /></LayoutWrapper>} />
                      <Route path="/account/profile/verify" element={<LayoutWrapper><VerifyPage /></LayoutWrapper>} />
                      <Route path="/account/profile/security" element={<LayoutWrapper><Security /></LayoutWrapper>} />
                      <Route path="/account/profile/preferences" element={<LayoutWrapper><ComingSoon title="Preferences" message="This feature is coming soon" /></LayoutWrapper>} />
                      <Route path="/account/profile/sub-accounts" element={<LayoutWrapper><ComingSoon title="Sub-accounts" message="This feature is coming soon" /></LayoutWrapper>} />
                      <Route path="/account/profile/api" element={<LayoutWrapper><ComingSoon title="API Management" message="This feature is coming soon" /></LayoutWrapper>} />
                      <Route path="/account/profile/third-party" element={<LayoutWrapper><ComingSoon title="Third-party Authorization" message="This feature is coming soon" /></LayoutWrapper>} />
                      <Route path="/account/profile/security/change-password" element={<LayoutWrapper><ChangePassword /></LayoutWrapper>} />
                      <Route path="/account/profile/security/change-email" element={<LayoutWrapper><ChangeEmail /></LayoutWrapper>} />

                      {/* Market */}
                      <Route path="/market" element={<LayoutWrapper darkBg><Market /></LayoutWrapper>} />

                      {/* Info pages */}
                      <Route path="/download" element={<LayoutWrapper showChat={false}><DownloadPage /></LayoutWrapper>} />
                      <Route path="/about-us" element={<LayoutWrapper showChat={false}><AboutUs /></LayoutWrapper>} />
                      <Route path="/legal" element={<LayoutWrapper showChat={false}><Legal /></LayoutWrapper>} />
                      <Route path="/get-started" element={<LayoutWrapper showChat={false}><GetStarted /></LayoutWrapper>} />
                      <Route path="/terms-conditions" element={<LayoutWrapper showChat={false}><TermsAndConditions /></LayoutWrapper>} />
                      <Route path="/privacy-policy" element={<LayoutWrapper showChat={false}><PrivacyPolicy /></LayoutWrapper>} />

                      {/* Help/Support */}
                      <Route path="/help/category/announcements" element={<LayoutWrapper><Announcement /></LayoutWrapper>} />
                      <Route path="/help/announcements/:articleSlug" element={<LayoutWrapper><Article /></LayoutWrapper>} />
                      <Route path="/help/deposit/:depositGuideSlug" element={<LayoutWrapper showChat={false}><DepositGuide /></LayoutWrapper>} />
                      <Route path="/help/withdrawal/:withdrawalGuideSlug" element={<LayoutWrapper showChat={false}><WithdrawalGuide /></LayoutWrapper>} />

                      {/* More pages */}
                      <Route path="/pages/morePages/CampaignCenter" element={<LayoutWrapper><CampaignCenter /></LayoutWrapper>} />
                      <Route path="/pages/morePages/MyRewards" element={<LayoutWrapper><MyRewards /></LayoutWrapper>} />
                      <Route path="/pages/morePages/Referral" element={<LayoutWrapper><Referral /></LayoutWrapper>} />

                      {/* Coming soon / misc */}
                      <Route path="/coming-soon" element={<LayoutWrapper showFooter={false}><ComingSoon /></LayoutWrapper>} />
                      <Route path="/my-assets" element={<LayoutWrapper darkBg><Assets /></LayoutWrapper>} />

                      {/* Home */}
                      <Route path="/" element={<LayoutWrapper darkBg><HomePage /></LayoutWrapper>} />

                      {/* 404 catch-all — must be last */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </React.Suspense>
                </div>
              </VerifyStatusProvider>
            </FreezeCheckProvider>
          </Router>
        </CryptoProvider>
      </CurrencyProvider>
    </MetaMaskProvider>
    </ErrorBoundary>
  );
}

export default App;
