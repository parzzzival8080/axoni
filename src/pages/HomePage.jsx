import React, { useState, useEffect } from 'react';
import Seo from '../components/common/Seo';
import Hero from '../components/home/Hero';
import Trading from '../components/home/Trading';
import Journey from '../components/home/Journey';
import About from '../components/home/About';
import News from '../components/home/News';
import FAQ from '../components/home/FAQ';
import TradingGame from '../components/home/TradingGame';
import TradeRewardsPopup from '../components/common/TradeRewardsPopup';
import { useIsMobile } from '../hooks/useIsMobile';
import MobileHomeScreen from '../components/mobile/MobileHomeScreen';
import MobileGuestHome from '../components/mobile/MobileGuestHome';

const HomePage = () => {
  const isMobile = useIsMobile();
  const [showRewardsPopup, setShowRewardsPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('authToken'));

  // Listen for auth changes (logout/login from other components)
  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem('authToken'));
    window.addEventListener('storage', checkAuth);
    window.addEventListener('focus', checkAuth);
    // Also check on every render
    checkAuth();
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('focus', checkAuth);
    };
  }, []);

  useEffect(() => {
    const checkForRecentSignIn = () => {
      const authToken = localStorage.getItem('authToken');
      const hasSeenRewardsPopup = localStorage.getItem('hasSeenRewardsPopup');

      if (authToken && !hasSeenRewardsPopup) {
        setTimeout(() => {
          setShowRewardsPopup(true);
        }, 1000);
      }
    };

    checkForRecentSignIn();
  }, []);

  const handleCloseRewardsPopup = () => {
    setShowRewardsPopup(false);
    localStorage.setItem('hasSeenRewardsPopup', 'true');
  };

  // Mobile logged-in: show OKX-style home screen (no rewards popup on mobile)
  if (isMobile && isLoggedIn) {
    return <MobileHomeScreen />;
  }

  // Mobile guest: show OKX-style guest home
  if (isMobile && !isLoggedIn) {
    return <MobileGuestHome />;
  }

  // Desktop: full landing page
  return (
    <div className="bg-[#0a0a0a]">
      <Seo
        path="/"
        description="GLD - Trade Bitcoin, Ethereum & 50+ crypto with low fees. Spot trading, futures up to 100x leverage, staking up to 12% APY. Secure platform with Proof of Reserves. Sign up and get $2,000 in rewards."
      />
      <Hero />
      <TradingGame />
      <Trading />
      <Journey />
      <About />
      <News />
      <FAQ />
      <TradeRewardsPopup
        isOpen={showRewardsPopup}
        onClose={handleCloseRewardsPopup}
      />
    </div>
  );
};

export default HomePage;
