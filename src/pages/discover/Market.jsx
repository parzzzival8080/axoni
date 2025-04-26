import React, { useState, useEffect } from 'react';
import NavigationTabs from '../../components/Market/NavigationTabs'
import SecondaryTabs from '../../components/Market/SecondaryTabs'
import CryptoPriceSection from '../../components/Market/CryptoPriceSection'
import FaqSection from '../../components/Market/FaqSection'
import '../../components/Market/Market.css'

const Market = () => {
   // Primary and secondary tabs data
  const [primaryTabs] = useState([
    { id: 'favorites', label: 'Favorites' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'spot', label: 'Spot' },
    { id: 'futures', label: 'Futures' },
    { id: 'options', label: 'Options' },
    { id: 'premarket', label: 'Pre-market' },
    { id: 'okxindex', label: 'OKX Index' },
    { id: 'tradingdata', label: 'Trading data' },
    { id: 'arbitragedata', label: 'Arbitrage data' }
  ]);
  
  const [secondaryTabs] = useState([
    { id: 'top', label: 'Top' },
    { id: 'new', label: 'New' },
    { id: 'ai', label: 'AI' },
    { id: 'solana', label: 'Solana' },
    { id: 'pvm', label: 'PvM' },
    { id: 'meme', label: 'Meme' },
    { id: 'defi', label: 'DeFi' },
    { id: 'layer1', label: 'Layer 1' },
    { id: 'gaming', label: 'Gaming' },
    { id: 'chatfi', label: 'ChatFi' }
  ]);
  
  // Active tab states
  const [activePrimaryTab, setActivePrimaryTab] = useState('crypto');
  const [activeSecondaryTab, setActiveSecondaryTab] = useState('top');
  
  // Default crypto data
  const defaultCryptoData = [
    { id: 'btc', name: 'BTC', fullName: 'Bitcoin', price: 94735.20, change: 0.02, marketCap: 1887 },
    { id: 'eth', name: 'ETH', fullName: 'Ethereum', price: 1804.88, change: 1.05, marketCap: 218.00 },
    { id: 'usdt', name: 'USDT', fullName: 'Tether', price: 1.0004, change: -0.03, marketCap: 146.018 },
    { id: 'xrp', name: 'XRP', fullName: 'XRP', price: 2.2196, change: 1.70, marketCap: 129.75 },
    { id: 'bnb', name: 'BNB', fullName: 'BNB', price: 604.20, change: 0.63, marketCap: 88.07 },
    { id: 'sol', name: 'SOL', fullName: 'Solana', price: 151.80, change: 0.58, marketCap: 78.58 },
    { id: 'usdc', name: 'USDC', fullName: 'USD Coin', price: 0.9999, change: 0.00, marketCap: 62.32 },
    { id: 'doge', name: 'DOGE', fullName: 'Dogecoin', price: 0.18684, change: 2.82, marketCap: 27.85 },
    { id: 'ada', name: 'ADA', fullName: 'Cardano', price: 0.72720, change: 1.82, marketCap: 26.17 },
  ];
  
  // State for crypto data
  const [cryptoData, setCryptoData] = useState(defaultCryptoData);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Function to simulate data loading
  const fetchCryptoData = (primaryTab, secondaryTab) => {
    setIsLoading(true);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      let filteredData = [...defaultCryptoData];
      
      // Filter based on primary tab
      if (primaryTab === 'futures') {
        filteredData = filteredData.filter(coin => coin.marketCap > 100);
      } else if (primaryTab === 'spot') {
        filteredData = filteredData.filter(coin => 
          ['USDT', 'USDC'].includes(coin.name)
        );
      }
      
      // Further filter based on secondary tab
      if (secondaryTab === 'defi') {
        filteredData = filteredData.filter(coin => 
          ['ETH', 'SOL'].includes(coin.name)
        );
      } else if (secondaryTab === 'meme') {
        filteredData = filteredData.filter(coin => 
          ['DOGE'].includes(coin.name)
        );
      }
      
      setCryptoData(filteredData);
      setIsLoading(false);
    }, 300); // Simulate network delay
  };

  // Effect to update data when tabs change
  useEffect(() => {
    fetchCryptoData(activePrimaryTab, activeSecondaryTab);
  }, [activePrimaryTab, activeSecondaryTab]);

  // Tab selection handlers
  const handlePrimaryTabClick = (tabId) => {
    if (tabId !== activePrimaryTab) {
      setActivePrimaryTab(tabId);
      // Data will be fetched by the useEffect
    }
  };
  
  const handleSecondaryTabClick = (tabId) => {
    if (tabId !== activeSecondaryTab) {
      setActiveSecondaryTab(tabId);
      // Data will be fetched by the useEffect
    }
  };
  return (
    <div className="crypto-container">
        <div className="navigation-tabs">
        <NavigationTabs 
            tabs={primaryTabs} 
            activeTab={activePrimaryTab} 
            onTabClick={handlePrimaryTabClick} 
        />
        
        <SecondaryTabs 
            tabs={secondaryTabs} 
            activeTab={activeSecondaryTab} 
            onTabClick={handleSecondaryTabClick} 
        />
        </div>

        <CryptoPriceSection 
        cryptoData={cryptoData} 
        isLoading={isLoading} 
        />
        
        <FaqSection />
    </div>
   
  )
}
export default Market