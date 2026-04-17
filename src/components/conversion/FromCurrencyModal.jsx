import React from 'react';
import './CurrencyModal.css';
import TetherLogo from '../../assets/coin/usdt.png';

const FromCurrencyModal = ({ onClose, onSelectCurrency, excludeSymbol }) => {
  const currencies = [
    {
      id: 'usdt',
      symbol: 'USDT',
      name: 'Tether',
      icon: TetherLogo,
      price: 1,
      isStablecoin: true,
    },
    {
      id: 'usdc',
      symbol: 'USDC',
      name: 'USD Coin',
      icon: 'https://pxolovoopbeooafcoasx.supabase.co/storage/v1/object/public/uploads//usdc.jpg',
      price: 1,
      isStablecoin: true,
    },
    {
      id: 'eth',
      symbol: 'ETH',
      name: 'Ethereum',
      icon: 'https://pxolovoopbeooafcoasx.supabase.co/storage/v1/object/public/uploads//eth.png',
      price: 0,
      isStablecoin: false,
    },
  ];

  const visibleCurrencies = excludeSymbol
    ? currencies.filter(c => c.symbol.toLowerCase() !== excludeSymbol.toLowerCase())
    : currencies;

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
            <h3 className="currency-modal-title">Convert from</h3>
            <button
              onClick={onClose}
              className="currency-modal-close-button"
            >
              ✕
            </button>
          </div>

          <div className="currency-list">
            {visibleCurrencies.map((currency) => (
              <div
                key={currency.id}
                className="currency-list-item"
                onClick={() => handleSelectCurrency(currency)}
              >
                <div className="currency-icon">
                  {currency.icon ? (
                    <img
                      src={currency.icon}
                      alt={currency.symbol}
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#2A2A2A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>
                      {currency.symbol.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="currency-info">
                  <div className="currency-name">{currency.symbol}</div>
                  <div className="currency-full-name">{currency.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FromCurrencyModal;
