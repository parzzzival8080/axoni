import React, { useState, useEffect } from 'react';
import './CurrencyModal.css';

const CurrencyModal = ({ onClose, onSelectCurrency }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true);
        
        // Using your API to fetch currencies
        const response = await fetch(
          'https://api.axoni.co/api/v1/coin-conversions?apikey=5lPMMw7mIuyzQQDjlKJbe0dY'
        );
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const responseData = await response.json();
        
        // Handle different possible response structures
        let coinsData = responseData;
        
        // If the API returns data inside a "data" property
        if (!Array.isArray(responseData) && responseData.data) {
          coinsData = responseData.data;
        }
        
        if (!Array.isArray(coinsData)) {
          throw new Error('Invalid API response format');
        }
        
        // Map the API response to match our currency structure
        const formattedCurrencies = coinsData.map((coin, index) => ({
          id: coin.id || String(index), // Generate an id if not provided
          symbol: coin.symbol || 'Unknown',  // Symbol for display (e.g., BTC, ETH)
          name: coin.name || 'Unknown Currency', // Full name (e.g., Bitcoin, Ethereum)
          icon: coin.image_path || null,
          price: coin.price || null, // Make sure price is included
          // Determine if it's a stablecoin based on name/symbol containing 'usd'
          isStablecoin: 
            (coin.symbol && coin.symbol.toLowerCase().includes('usd')) || 
            (coin.name && coin.name.toLowerCase().includes('usd')) ||
            (coin.symbol && ['usdt', 'usdc', 'dai', 'busd'].includes(coin.symbol.toLowerCase()))
        }));
        
        setCurrencies(formattedCurrencies);
      } catch (err) {
        console.error('Error fetching currencies:', err);
        setError('Failed to load currencies. Please try again later.');
        
        // Fallback to default currencies if API fails
        setCurrencies([
          { id: 'usdt', symbol: 'USDT', name: 'Tether', icon: '🟢', price: 1, isStablecoin: true },
          { id: 'eth', symbol: 'ETH', name: 'Ethereum', icon: '🔷', price: 3500, isStablecoin: false },
          { id: 'usdc', symbol: 'USDC', name: 'USD Coin', icon: '🔵', price: 1, isStablecoin: true },
          { id: 'btc', symbol: 'BTC', name: 'Bitcoin', icon: '🟠', price: 60000, isStablecoin: false },
          { id: 'sol', symbol: 'SOL', name: 'Solana', icon: '🟣', price: 150, isStablecoin: false },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);
  
  const filteredCurrencies = currencies
    .filter(currency => 
      (currency.symbol && currency.symbol.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (currency.name && currency.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter(currency => 
      activeTab === 'All' || (activeTab === 'Stablecoins' && currency.isStablecoin)
    );

  const handleSelectCurrency = (currency) => {
    if (onSelectCurrency) {
      onSelectCurrency(currency);
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="currency-modal">
      <div className="currency-modal-overlay" onClick={onClose}></div>
      <div className="currency-modal-container">
        <div className="currency-modal-content">
          <div className="currency-modal-header">
            <h3 className="currency-modal-title">Convert to</h3>
            <button 
              onClick={onClose} 
              className="currency-modal-close-button"
            >
              ✕
            </button>
          </div>
          
          <div className="currency-search-container">
            <div className="currency-search-input-wrapper">
              <span className="currency-search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                type="text"
                className="currency-search-input"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="currency-tabs">
            <button 
              className={`currency-tab ${activeTab === 'All' ? 'active' : ''}`}
              onClick={() => setActiveTab('All')}
            >
              All
            </button>
            <button 
              className={`currency-tab ${activeTab === 'Stablecoins' ? 'active' : ''}`}
              onClick={() => setActiveTab('Stablecoins')}
            >
              Stablecoins
            </button>
          </div>
          
          <div className="currency-list">
            {loading ? (
              <div className="currency-loading">Loading currencies...</div>
            ) : error ? (
              <div className="currency-error">{error}</div>
            ) : filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((currency) => (
                <div 
                  key={currency.id}
                  className="currency-list-item"
                  onClick={() => handleSelectCurrency(currency)}
                >
                  <div className="currency-icon">
                    {currency.icon ? (
                      <img 
                        src={currency.icon} 
                        alt={currency.name} 
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'contain' }} 
                      />
                    ) : (
                      'No image found'
                    )}
                  </div>
                  <div className="currency-info">
                    <div className="currency-name">{currency.symbol}</div>
                    <div className="currency-full-name">{currency.name}</div>
                  </div>
                  {currency.price && (
                    <div className="currency-price">${parseFloat(currency.price).toFixed(2)}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="currency-no-results">No currencies found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyModal;