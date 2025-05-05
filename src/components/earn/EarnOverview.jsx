import React, { useState } from 'react';
import './EarnOverview.css';
import EarnOverviewImg from '../../assets/img/earn-overview-img.png';

const EarnOverview = () => {
  const [selectedProduct, setSelectedProduct] = useState('All products');
  const [selectedTerm, setSelectedTerm] = useState('All terms');
  const [searchQuery, setSearchQuery] = useState('');

  const cryptoData = [
    { token: 'USDT', icon: 'fas fa-circle', iconColor: '#26a17b', marketApr: '50.00%', term: '3 days', action: 'Subscribe', label: 'Savings Starter' },
    { token: 'USDT', icon: 'fas fa-circle', iconColor: '#26a17b', marketApr: '1.50% - 3.95%', term: 'Flexible/Fixed', action: '' },
    { token: 'BTC', icon: 'fab fa-bitcoin', iconColor: '#f7931a', marketApr: '1.00%', term: 'Flexible/Fixed', action: '' },
    { token: 'ETH', icon: 'fab fa-ethereum', iconColor: '#627eea', marketApr: '1.00% - 3.11%', term: 'Flexible/Fixed', action: '' },
    { token: 'MOVE', icon: 'fas fa-circle', iconColor: '#000000', marketApr: '192.00%', term: 'Flexible', action: '' },
    { token: 'PRCL', icon: 'fas fa-chevron-up', iconColor: '#666666', marketApr: '167.00%', term: 'Flexible', action: '' },
    { token: 'DEGEN', icon: 'fas fa-circle', iconColor: '#6364d1', marketApr: '169.00%', term: 'Flexible', action: '' },
    { token: 'GODS', icon: 'fas fa-circle', iconColor: '#0099ff', marketApr: '79.00%', term: 'Flexible', action: '' },
  ];

  const [faqItems, setFaqItems] = useState([
    { 
      question: 'What is Earn?', 
      isExpanded: true,
      answer: 'TradeX Earn provides you with a way to generate interest on your assets through multiple investment choices. Products include Simple Earn, Loan, and On-chain Earn.'
    },
    { 
      question: 'What is annual percentage rate (APR)?', 
      isExpanded: false,
      answer: 'APR is the annual percentage rate your deposited crypto generates from our Earn products.'
    },
    { 
      question: 'When does revenue calculation/distribution start?', 
      isExpanded: false,
      answer: 'The calculation and distribution time of revenue may be different for different projects. Take our DeFi service for example, we send your deposited funds to the contract addresses of verified third-party DeFi services at around 11:00 am (UTC +8) daily. Revenue calculation starts as soon as funds are successfully delivered on-chain. However, it’s possible this may be delayed due to on-chain operations. Revenue consists of interest and rewards. Your interest and initial investment are distributed the day after you redeem your other principal and rewards are distributed daily at around 00:00 (UTC +8). All funds are settled in locked mining accounts.'
    },
    { 
      question: 'What are the risks?', 
      isExpanded: false,
      answer: 'TradeX accesses third party DeFi protocols, and only provides related services such as project display and revenue distribution, and does not take responsibility for any asset losses caused by potential risks such as contract vulnerabilities, hacking incidents, or termination of business, bankruptcy, abnormal suspension or cessation of trading of third party DeFi platforms or projects.'
    },
  ]);

  const toggleFaqItem = (index) => {
    setFaqItems(faqItems.map((item, i) => {
      if (i === index) {
        return { ...item, isExpanded: !item.isExpanded };
      }
      return item;
    }));
  };

  const earnOptions = [
    { icon: 'fas fa-coins', label: 'Simple Earn' },
    { icon: 'fas fa-chart-line', label: 'Structured Products' },
    { icon: 'fas fa-link', label: 'On-chain Earn' },
  ];
  return (
    <div className="earn-component">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Put your crypto to work</h1>
            <p className="hero-subtitle">Earn daily rewards on 100+ tokens including USDT, USDC and ETH.</p>
            <button className="activate-button">Activate Auto-earn</button>
          </div>
          
          {/* Placeholder for crypto earning visualization image */}
          <div className="hero-image-placeholder">
            {/* Image will be inserted here later */}
            <img src={EarnOverviewImg} alt="earn-overview-img" />
          </div>
        </div>
      </section>

      {/* Earn Options Section */}
      <section className="earn-options-section">
        <div>
          {earnOptions.map((option, index) => (
            <div key={index} className="earn-option">
              <i className={option.icon}></i>
              <span>{option.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <h2>Products</h2>
        
        <div className="products-controls">
          <div className="left-controls">
            <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}>
              <option value="All products">All products</option>
              <option value="USDT">USDT</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
            </select>
            
            <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
              <option value="All terms">All terms</option>
              <option value="3 days">3 days</option>
              <option value="7 days">7 days</option>
              <option value="30 days">30 days</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>
          
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Search crypto"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                <td className="token-cell">
                  <div className="token-info">
                    <i className={crypto.icon} style={{ color: crypto.iconColor }}></i>
                    <span className="token-name">{crypto.token}</span>
                    {crypto.label && <span className="badge">{crypto.label}</span>}
                  </div>
                </td>
                <td>{crypto.marketApr}</td>
                <td>{crypto.term}</td>
                <td>
                  {crypto.action ? (
                    <button className="subscribe-button">{crypto.action}</button>
                  ) : (
                    <i className="fas fa-chevron-down dropdown-icon"></i>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button className="view-more-button">View more</button>
      </section>

      {/* FAQ Section */}
       <section className="faq-section">
        <h2>FAQ</h2>
        <div className="faq-list">
          {faqItems.map((item, index) => (
            <div key={index} className="faq-item">
              <div 
                className="faq-question"
                onClick={() => toggleFaqItem(index)}
              >
                <span>{item.question}</span>
                <i className={`fas fa-chevron-${item.isExpanded ? 'up' : 'down'} faq-icon`}></i>
              </div>
              {item.isExpanded && item.answer && (
                <div className="faq-answer">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default EarnOverview