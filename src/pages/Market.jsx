import React, { useState, useEffect } from 'react';
import NavigationTabs from '../components/Market/NavigationTabs';
import SecondaryTabs from '../components/Market/SecondaryTabs';
import CryptoPriceSection from '../components/Market/CryptoPriceSection';
import FaqSection from '../components/Market/FaqSection';
// No need to import CSS file as we'll use Tailwind

const Market = () => {
  // Primary navigation tabs
  const [activeMainTab, setActiveMainTab] = useState('crypto');
  const mainTabs = [
    { id: 'favorites', label: 'Favorites' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'spot', label: 'Spot' },
    { id: 'futures', label: 'Futures' },
    { id: 'options', label: 'Options' },
    { id: 'premarket', label: 'Pre-market' },
    { id: 'okx-index', label: 'OKX Index' },
    { id: 'trading-data', label: 'Trading data' },
    { id: 'arbitrage-data', label: 'Arbitrage data' }
  ];

  // Secondary tabs
  const [activeSecondaryTab, setActiveSecondaryTab] = useState('all');
  const secondaryTabs = [
    { id: 'top', label: 'Top' },
    { id: 'new', label: 'New' },
    { id: 'all', label: 'All' },
    { id: 'gainers', label: 'Gainers' },
    { id: 'defi', label: 'DeFi' },
    { id: 'meme', label: 'Meme' },
    { id: 'layer1', label: 'Layer 1' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'depin', label: 'DePIN' }
  ];

  // Mock crypto data for the table
  const [cryptoData, setCryptoData] = useState([
    { id: 'btc', name: 'BTC', fullName: 'Bitcoin', price: 94311.00, change: 0.02, marketCap: 1.877 },
    { id: 'eth', name: 'ETH', fullName: 'Ethereum', price: 1902.88, change: -0.34, marketCap: 217.608 },
    { id: 'usdt', name: 'USDT', fullName: 'Tether', price: 0.99998, change: -0.01, marketCap: 149.258 },
    { id: 'xrp', name: 'XRP', fullName: 'XRP', price: 2.1643, change: 0.37, marketCap: 126.598 },
    { id: 'bnb', name: 'BNB', fullName: 'BNB', price: 590.20, change: 0.73, marketCap: 86.048 },
    { id: 'sol', name: 'SOL', fullName: 'Solana', price: 146.40, change: 1.89, marketCap: 75.758 },
    { id: 'usdc', name: 'USDC', fullName: 'USD Coin', price: 0.9990, change: 0.00, marketCap: 61.488 },
    { id: 'doge', name: 'DOGE', fullName: 'Dogecoin', price: 0.17220, change: 0.97, marketCap: 25.608 },
    { id: 'ada', name: 'ADA', fullName: 'Cardano', price: 0.68080, change: 0.58, marketCap: 24.528 },
    { id: 'trx', name: 'TRX', fullName: 'Tron', price: 0.24800, change: 1.00, marketCap: 23.688 },
    { id: 'steth', name: 'STETH', fullName: 'Lido Staked Ether', price: 1798.68, change: -0.47, marketCap: 16.538 },
    { id: 'wbtc', name: 'WBTC', fullName: 'Wrapped Bitcoin', price: 94282.80, change: -0.02, marketCap: 12.168 }
  ]);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  const handleMainTabClick = (tabId) => {
    setActiveMainTab(tabId);
  };

  const handleSecondaryTabClick = (tabId) => {
    setActiveSecondaryTab(tabId);
    
    // Simulate loading data when changing tabs
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Primary Navigation */}
        <NavigationTabs 
          tabs={mainTabs} 
          activeTab={activeMainTab} 
          onTabClick={handleMainTabClick} 
        />
        
        {/* Secondary Navigation */}
        <SecondaryTabs 
          tabs={secondaryTabs} 
          activeTab={activeSecondaryTab} 
          onTabClick={handleSecondaryTabClick} 
        />
        
        {/* Cryptocurrency Price Section */}
        <CryptoPriceSection 
          cryptoData={cryptoData} 
          isLoading={isLoading} 
        />
        
        {/* FAQ Section */}
        <FaqSection />
      </div>
    </div>
  );
};

export default Market;