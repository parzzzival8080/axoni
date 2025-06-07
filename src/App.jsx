import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import SpotTrading from './pages/SpotTrading';
import LoginPage from './pages/login/LoginPage';
import SignUpPage from './pages/SignUpPage';
import Footer from './components/common/Footer';
import ChatBubble from './components/common/ChatBubble';
import './styles.css';
import FutureTrading from './pages/FutureTrading';
import Assets from './pages/Assets';
import Conversion from '../src/pages/Conversion';
import ComingSoon from './components/common/ComingSoon';
import Earn from './pages/Earn';
import SimpleEarn from './components/earn/SimpleEarn';
import Overview from './pages/account/Overview';
import Profile from './pages/account/Profile';
import Market from './pages/Market';
import DownloadPage from './pages/DownloadPage';
import AboutUs from './pages/AboutUs';
import Announcement from './pages/supportCenter/announcement/Announcement';
import Article from './pages/supportCenter/announcement/Article';
import Deposit from './pages/account/Deposit';
import Withdraw from './pages/account/Withdraw';
import Transfer from './pages/account/Transfer';
import VerifyPage from './pages/account/VerifyPage';
import ChangePassword from './pages/account/ChangePassword';
import ChangeEmail from './pages/account/ChangeEmail';
import { CryptoProvider } from './context/CryptoContext';
import TradingChartWebView from './pages/trading_chartWebView';
import DepositGuide from './components/faq/depositGuide';
import WithdrawalGuide from './components/faq/withdrawGuide';
function App() {
  return (
    <CryptoProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Fullscreen TradingView chart page, no layout wrappers */}
            <Route path="/tradingviewEmbed" element={<TradingChartWebView />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
    
            <Route path="/spot-trading" element={
              <>
                <Navbar />
                <main>
                  <SpotTrading />
                </main>
              </>
            } />
            <Route path="/future-trading" element={
              <>
                <Navbar />
                <main>
                  <FutureTrading/>
                </main>
              </>
            } />
            <Route path="/deposit" element={
              <>
                <Navbar />
                <main>
                  <Deposit />
                </main>
                <Footer />
              </>
            } />
            <Route path="/withdraw" element={
              <>
                <Navbar />
                <main>
                  <Withdraw />
                </main>
                <Footer />
              </>
            } />
            <Route path="/transfer" element={
              <>
                <Navbar />
                <main>
                  <Transfer />
                </main>
                <Footer />
              </>
            } />
              <Route path="/conversion" element={
                        <>
                          <Navbar />
                          <main>
                            <Conversion/>
                          </main>
                          <Footer />
                     
                        </>
              } />
            <Route path="/earn" element={
                        <>
                          <Navbar />
                          <main>
                            <Earn/>
                          </main>
                          <Footer />
                          <ChatBubble />
                        </>
            } />
              <Route path="/coming-soon" element={
                        <>
                          <main>
                            <ComingSoon/>
                          </main>
                          <ChatBubble />
                        </>
            } />
             <Route path="/earn/simple-earn" element={
                        <>
                        <Navbar />
                          <main>
                            <SimpleEarn/>
                          </main>
                          <Footer />
                          <ChatBubble />
                        </>
            } />
            <Route path="/account/overview" element={
                        <>
                        <Navbar />
                          <main>
                            <Overview/>
                          </main>
                          <Footer />
                          <ChatBubble />
                        </>
            } />
             <Route path="/account/profile" element={
                        <>
                        <Navbar />
                          <main>
                            <Profile/>
                          </main>
                          <Footer />
                          <ChatBubble />
                        </>
            } />
            <Route path="/account/profile/verify" element={
                        <>
                        <Navbar />
                          <main>
                            <VerifyPage/>
                          </main>
                          <Footer />
                          <ChatBubble />
                        </>
             } />
             <Route path="/account/profile/security" element={
                        <>
                        <Navbar />
                          <main>
                            <React.Suspense fallback={<div>Loading...</div>}>
                              {React.createElement(React.lazy(() => import('./pages/account/Security')))}
                            </React.Suspense>
                          </main>
                          <Footer />
                          <ChatBubble />
                        </>
             } />
             <Route path="/account/profile/preferences" element={
                        <>
                        <Navbar />
                          <main>
                            <ComingSoon title="Preferences" message="This feature is coming soon" />
                          </main>
                          <Footer />
                          <ChatBubble />
                        </>
             } />
             <Route path="/account/profile/sub-accounts" element={
                        <>
                        <Navbar />
                          <main>
                            <ComingSoon title="Sub-accounts" message="This feature is coming soon" />
                          </main>
                          <Footer />
                          <ChatBubble />
                        </>
             } />
             <Route path="/account/profile/api" element={
                        <>
                        <Navbar />
                          <main>
                            <ComingSoon title="API Management" message="This feature is coming soon" />
                          </main>
                          <Footer />
                          <ChatBubble />
                        </>
             } />
             <Route path="/account/profile/third-party" element={
                        <>
                        <Navbar />
                          <main>
                            <ComingSoon title="Third-party Authorization" message="This feature is coming soon" />
                          </main>
                          <Footer />
                          <ChatBubble />
                        </>
             } />
             <Route path="/account/profile/security/change-password" element={
                        <>
                        <Navbar />
                          <main>
                            <ChangePassword />
                          </main>
                          <Footer />
                          <ChatBubble />
                        </>
             } />
             <Route path="/account/profile/security/change-email" element={
                        <>
                        <Navbar />
                          <main>
                            <ChangeEmail />
                          </main>
                          <Footer />
                          <ChatBubble />
                        </>
             } />
            <Route path="/market" element={
              <>
                <Navbar />
                <main>
                  <Market/>
                </main>
                <Footer />
                <ChatBubble />
              </>
            } />
            <Route path="/download" element={
              <>
                <Navbar />
                <main>
                  <DownloadPage/>
                </main>
                <Footer />
              </>
            } />
            <Route path="/about-us" element={
              <>
                <Navbar />
                <main>
                  <AboutUs/>
                </main>
                <Footer />
              </>
            } />
            <Route path="/help/category/announcements" element={
              <>
                <Navbar />
                <main>
                  <Announcement/>
                </main>
                <Footer />
                <ChatBubble />
              </>
            } />
             <Route path="/help/announcements/:articleSlug" element={
                <>
                  <Navbar />
                  <main>
                    <Article />
                  </main>
                  <Footer />
                  <ChatBubble />
                </>
              } />
              <Route path="/help/deposit/:depositGuideSlug" element={
                <>
                  <Navbar />
                  <main>
                    <DepositGuide />
                  </main>
                  <Footer />
                 
                </>
              } />
              <Route path="/help/withdrawal/:withdrawalGuideSlug" element={
                <>
                  <Navbar />
                  <main>
                    <WithdrawalGuide />
                  </main>
                  <Footer />
                 
                </>
              } />
            <Route path="/pages/morePages/CampaignCenter" element={
              <>
                <Navbar />
                <main>
                  {/* Using dynamic import instead of require for Vite compatibility */}
                  <React.Suspense fallback={<div>Loading...</div>}>
                    {React.createElement(React.lazy(() => import('./pages/morePages/CampaignCenter')))}
                  </React.Suspense>
                </main>
                <Footer />
                <ChatBubble />
              </>
            } />
            <Route path="/pages/morePages/MyRewards" element={
              <>
                <Navbar />
                <main>
                  {/* Using dynamic import instead of require for Vite compatibility */}
                  <React.Suspense fallback={<div>Loading...</div>}>
                    {React.createElement(React.lazy(() => import('./pages/morePages/MyRewards')))}
                  </React.Suspense>
                </main>
                <Footer />
                <ChatBubble />
              </>
            } />
            <Route path="/pages/morePages/Referral" element={
              <>
                <Navbar />
                <main>
                  {/* Using dynamic import instead of require for Vite compatibility */}
                  <React.Suspense fallback={<div>Loading...</div>}>
                    {React.createElement(React.lazy(() => import('./pages/morePages/Referral')))}
                  </React.Suspense>
                </main>
                <Footer />
                <ChatBubble />
              </>
            } />
              {/* <Route path="/pages/morePages/Affiliate" element={
              <>
                <Navbar />
                <main>
                
                  <React.Suspense fallback={<div>Loading...</div>}>
                    {React.createElement(React.lazy(() => import('./pages/morePages/Affiliate')))}
                  </React.Suspense>
                </main>
                <Footer />
                <ChatBubble />
              </>
            } /> */}
             <Route path="./components/common/ComingSoon" element={
              <>
                <Navbar />
                <main>
                  {/* Using dynamic import instead of require for Vite compatibility */}
                  <React.Suspense fallback={<div>Loading...</div>}>
                    {React.createElement(React.lazy(() => import('./components/common/ComingSoon')))}
                  </React.Suspense>
                </main>
                <Footer />
                <ChatBubble />
              </>
            } />
            <Route path="/assets" element={
              <>
                <Navbar />
                <main>
                  <Assets />
                </main>
                <Footer />
                <ChatBubble />
              </>
            } />
            <Route path="/" element={
              <>
                <Navbar />
                <main>
                  <HomePage />
                </main>
                <Footer />
                <ChatBubble />
              </>
            } />
          </Routes>
        </div>
      </Router>
    </CryptoProvider>
  );
}

export default App;
