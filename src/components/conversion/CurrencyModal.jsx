import React, { useState } from 'react';
import './CurrencyModal.css';

const CurrencyModal = ({ onClose, onSelectCurrency }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const currencies = [
    { id: 'usdt', name: 'USDT', fullName: 'Tether', icon: '🟢' },
    { id: 'eth', name: 'ETH', fullName: 'Ethereum', icon: '🔷' },
    { id: 'usdc', name: 'USDC', fullName: 'USD Coin', icon: '🔵' },
    { id: 'btc', name: 'BTC', fullName: 'Bitcoin', icon: '🟠' },
    { id: 'sol', name: 'SOL', fullName: 'Solana', icon: '🟣' },
  ];

  const stablecoins = currencies.filter(c => c.id === 'usdt' || c.id === 'usdc');
  
  const filteredCurrencies = currencies
    .filter(currency => 
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      currency.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(currency => 
      activeTab === 'All' || (activeTab === 'Stablecoins' && stablecoins.some(c => c.id === currency.id))
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
            {filteredCurrencies.map((currency) => (
              <div 
                key={currency.id}
                className="currency-list-item"
                onClick={() => handleSelectCurrency(currency.name)}
              >
                <div className="currency-icon">
                  {currency.icon}
                </div>
                <div className="currency-info">
                  <div className="currency-name">{currency.name}</div>
                  <div className="currency-full-name">{currency.fullName}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyModal;