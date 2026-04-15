import React, { useState, useEffect } from 'react';
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
  const isLoggedIn = !!localStorage.getItem('authToken');

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
