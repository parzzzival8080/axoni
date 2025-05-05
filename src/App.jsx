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

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
    
          <Route path="/spot-trading" element={
            <>
              <Navbar />
              <main>
                <SpotTrading />
              </main>
              <ChatBubble />
            </>
          } />
          <Route path="/future-trading" element={
            <>
              <Navbar />
              <main>
                <FutureTrading/>
              </main>
              <ChatBubble />
            </>
          } />
            <Route path="/conversion" element={
                      <>
                        <Navbar />
                        <main>
                          <Conversion/>
                        </main>
                        <Footer />
                        <ChatBubble />
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
  );
}

export default App;
