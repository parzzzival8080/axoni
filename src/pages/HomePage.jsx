import React, { useState, useEffect } from 'react';
import Hero from '../components/home/Hero';
import Trading from '../components/home/Trading';
import Journey from '../components/home/Journey';
import About from '../components/home/About';
import News from '../components/home/News';
import FAQ from '../components/home/FAQ';
import TradingGame from '../components/home/TradingGame';
import TradeRewardsPopup from '../components/common/TradeRewardsPopup';

const HomePage = () => {
  const [showRewardsPopup, setShowRewardsPopup] = useState(false);

  useEffect(() => {
    // Check if user just signed in and hasn't seen the popup yet
    const checkForRecentSignIn = () => {
      const authToken = localStorage.getItem('authToken');
      const hasSeenRewardsPopup = localStorage.getItem('hasSeenRewardsPopup');
      const isVerified = localStorage.getItem('is_verified');
      
      console.log('🔍 Popup Debug Info:', {
        authToken: !!authToken,
        hasSeenRewardsPopup,
        isVerified,
        isVerifiedBool: isVerified === 'true'
      });
      
      // Show popup if user is signed in and hasn't seen it yet (removed verification requirement for testing)
      if (authToken && !hasSeenRewardsPopup) {
        console.log('✅ Showing rewards popup');
        // Add a small delay to let the page load completely
        setTimeout(() => {
          setShowRewardsPopup(true);
        }, 1000);
      } else {
        console.log('❌ Not showing popup - conditions not met');
      }
    };

    checkForRecentSignIn();
  }, []);

  const handleCloseRewardsPopup = () => {
    setShowRewardsPopup(false);
    // Mark that user has seen the popup so it doesn't show again
    localStorage.setItem('hasSeenRewardsPopup', 'true');
  };

  // Manual trigger for testing (remove this later)
  const handleManualPopupTrigger = () => {
    localStorage.removeItem('hasSeenRewardsPopup');
    setShowRewardsPopup(true);
  };

  return (
    <div className="min-h-screen bg-black" >
      <Hero />
      <TradingGame />
      <Trading />
      <Journey />
      <About />
      <News />
      <FAQ />

      {/* Trade Rewards Popup */}
      <TradeRewardsPopup 
        isOpen={showRewardsPopup} 
        onClose={handleCloseRewardsPopup} 
      />

      {/* Debug button for testing (remove this later) */}
      {localStorage.getItem('authToken') && (
        <button
          onClick={handleManualPopupTrigger}
          className="fixed bottom-4 right-4 bg-orange-500 text-white px-4 py-2 rounded-lg z-50"
        >
          Test Popup
        </button>
      )}
    </div>
  );
};

export default HomePage; 