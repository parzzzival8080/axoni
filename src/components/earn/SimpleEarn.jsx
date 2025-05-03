import React from 'react';
import './SimpleEarn.css';
import EarnNavBar from './EarnNavBar';
import SimpleEarnImg from '../../assets/img/simple-earn-img.png';

const SimpleEarn = () => {
  const cryptoData = [
    { token: 'USDT', icon: 'fas fa-circle', iconColor: '#26a17b', marketApr: '1.50%', term: 'Flexible/Fixed' },
    { token: 'USDC', icon: 'fas fa-circle', iconColor: '#2775ca', marketApr: '1.00%', term: 'Flexible' },
    { token: 'BTC', icon: 'fab fa-bitcoin', iconColor: '#f7931a', marketApr: '1.00%', term: 'Flexible' },
    { token: 'ETH', icon: 'fab fa-ethereum', iconColor: '#627eea', marketApr: '1.00%', term: 'Flexible' },
    { token: 'OKB', icon: 'fas fa-circle', iconColor: '#333333', marketApr: '1.00%', term: 'Flexible' },
    { token: 'VRA', icon: 'fas fa-circle', iconColor: '#E63946', marketApr: '225.00%', term: 'Flexible' },
    { token: 'MOVE', icon: 'fas fa-circle', iconColor: '#333333', marketApr: '195.00%', term: 'Flexible' },
  ];

  const alternativeOptions = [
    {
      title: 'Structured Products',
      description: 'Earn potentially high APRs on current market trends',
      icon: 'fas fa-chart-line'
    },
    {
      title: 'On-chain Earn',
      description: 'Participate with on the chain',
      icon: 'fas fa-link'
    }
  ];

  return (
    <div className="simple-earn">
      <EarnNavBar/>
      {/* Hero Section */}
      <section className="simple-earn-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Grow crypto effortlessly on<br />Simple Earn</h1>
            <p className="hero-subtitle">
              Entrust your crypto assets to our highly secure platform, while enjoying<br />
              attractive returns
            </p>
            <button className="what-is-button">What is Simple Earn?</button>
          </div>
          
          {/* Placeholder for crypto growth visualization */}
          <div className="hero-visual-placeholder">
            {/* Image will be inserted here later */}
            <img src={SimpleEarnImg} alt="simple-earn-img" />
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <div className="products-header">
          <h2>Products</h2>
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text"
              placeholder="Search crypto"
              className="search-input"
            />
          </div>
        </div>

        <table className="products-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Market APR ↑</th>
              <th>Term</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cryptoData.map((crypto, index) => (
              <tr key={index}>
                <td className="token-column">
                  <i className={crypto.icon} style={{ color: crypto.iconColor }}></i>
                  <span className="token-name">{crypto.token}</span>
                </td>
                <td>{crypto.marketApr}</td>
                <td>{crypto.term}</td>
                <td>
                  <button className="action-button">
                    <i className="fas fa-chevron-down"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="view-more-button">View more</button>
      </section>

      {/* Alternative Options Section */}
      <section className="alternatives-section">
        <h2>Not quite what you're looking for?</h2>
        <div className="alternatives-content">
          {alternativeOptions.map((option, index) => (
            <div key={index} className="alternative-card">
              <i className={option.icon}></i>
              <h3>{option.title}</h3>
              <p>{option.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SimpleEarn;