import React from 'react';
import './CurrencyModal.css';
import TetherLogo from '../../assets/coin/usdt.png';

const FromCurrencyModal = ({ onClose, onSelectCurrency }) => {
  // Static USDT currency data
  const usdtCurrency = {
    id: 'usdt',
    symbol: 'USDT',
    name: 'Tether',
    icon: TetherLogo,
    price: 1,
    isStablecoin: true
  };

  const handleSelectCurrency = () => {
    if (onSelectCurrency) {
      onSelectCurrency(usdtCurrency);
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
            <h3 className="currency-modal-title">Convert from</h3>
            <button 
              onClick={onClose} 
              className="currency-modal-close-button"
            >
              ✕
            </button>
          </div>
          
          {/* Keep tabs for consistent UI but make them non-functional */}
          {/* <div className="currency-tabs">
            <button 
              className="currency-tab active"
            >
              All
            </button>
            <button 
              className="currency-tab"
              disabled
            >
            Stablecoins 
            </button>
          </div> */}
          
          <div className="currency-list">
            <div 
              key={usdtCurrency.id}
              className="currency-list-item"
              onClick={handleSelectCurrency}
            >
              <div className="currency-icon">
                <img 
                  src={usdtCurrency.icon} 
                  alt={usdtCurrency.symbol} 
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'contain' }} 
                />
              </div>
              <div className="currency-info">
                <div className="currency-name">{usdtCurrency.symbol}</div>
                <div className="currency-full-name">{usdtCurrency.name}</div>
              </div>
            </div>
            
            <div className="currency-note" style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
              <p>Currently, only USDT is available as the source currency</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FromCurrencyModal;