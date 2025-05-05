import React, { useState } from 'react';
import './CryptoPrices.css';

const CryptoPrices = () => {
  const [activeTab, setActiveTab] = useState('Top');
  
  const tabs = ['Favorites', 'Top', 'Hot', 'Gainers', 'New'];
  
  const cryptoData = [
    { symbol: 'BTC', name: 'Bitcoin', price: '$96,348.20', change: '-0.59%', icon: 'fab fa-bitcoin', color: '#f7931a' },
    { symbol: 'ETH', name: 'Ethereum', price: '$1,826.68', change: '-0.87%', icon: 'fab fa-ethereum', color: '#627eea' },
    { symbol: 'OKB', name: 'OKB', price: '$51.2900', change: '-0.35%', icon: 'fas fa-circle', color: '#333333' },
    { symbol: 'SOL', name: 'Solana', price: '$147.66', change: '-0.29%', icon: 'fas fa-circle', color: '#00FFA3' },
    { symbol: 'TON', name: 'Toncoin', price: '$3.1800', change: '+0.28%', icon: 'fas fa-circle', color: '#0088cc' },
    { symbol: 'DOGE', name: 'Dogecoin', price: '$0.17933', change: '-1.23%', icon: 'fas fa-circle', color: '#c2a633' },
    { symbol: 'XRP', name: 'XRP', price: '$2.2000', change: '-0.45%', icon: 'fas fa-times', color: '#23292f' }
  ];

  return (
    <div className="crypto-prices">
      <h2 className="crypto-prices-title">Today's crypto prices</h2>
      
      <div className="crypto-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`crypto-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      
      <table className="crypto-table">
        <thead>
          <tr>
            <th className="align-left">Name</th>
            <th className="align-right">Price</th>
            <th className="align-right">Change</th>
          </tr>
        </thead>
        <tbody>
          {cryptoData.map((crypto, index) => (
            <tr key={index} className="crypto-row">
              <td className="crypto-name">
                <div className="crypto-name-content">
                  <i className={crypto.icon} style={{ color: crypto.color }}></i>
                  <span className="crypto-symbol">{crypto.symbol}</span>
                </div>
              </td>
              <td className="crypto-price">{crypto.price}</td>
              <td className={`crypto-change ${crypto.change.startsWith('+') ? 'positive' : 'negative'}`}>
                {crypto.change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="view-more-container">
        <button className="view-more-button">View more</button>
      </div>
    </div>
  );
};

export default CryptoPrices;