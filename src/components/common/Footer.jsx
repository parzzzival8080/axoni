import React, { useState, useEffect } from 'react';
import { FaGlobe, FaChevronDown, FaChevronUp, FaTwitter, FaTiktok, FaInstagram, FaDiscord, FaTelegram, FaFacebook, FaYoutube, FaLinkedin, FaEllipsisH } from 'react-icons/fa';
import Logo from '../../assets/logo/logo.png';
import {QRCodeSVG} from 'qrcode.react';

const Footer = () => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [activeSections, setActiveSections] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  
  const appDownloadUrl = "https://drive.google.com/file/d/1FeM7hUwGLu1ac_boBGX-_TyVp3d2_F6V/view?usp=sharing";

  // Check if viewport is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Toggle accordion sections on mobile
  const toggleSection = (index) => {
    if (activeSections.includes(index)) {
      setActiveSections(activeSections.filter(i => i !== index));
    } else {
      setActiveSections([...activeSections, index]);
    }
  };

  // Section titles for mobile accordion
  const sectionTitles = [
    "More about TradeX",
    "Products",
    "Services",
    "Support",
    "Crypto calculator",
    "Trade"
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo and Copyright */}
        <div className="footer-logo">
          <div className="logo-container">
            <img src={Logo} alt="tradex-logo" />
          </div>
          <p className="copyright">©2017 - 2025 TradeX.COM</p>
        </div>
        
        {/* Language Selector */}
        <div className="language-selector">
          <button 
            className="language-button"
            onClick={() => setIsLanguageOpen(!isLanguageOpen)}
          >
            <FaGlobe className="globe-icon" />
            <span>English/USD</span>
            {isLanguageOpen ? 
              <div className="chevron-up-circle">
                <FaChevronUp className="chevron-icon" />
              </div> : 
              <div className="chevron-down-circle">
                <FaChevronDown className="chevron-icon" />
              </div>
            }
          </button>
          {isLanguageOpen && (
            <div className="language-dropdown">
              <div className="language-option">English/USD</div>
              <div className="language-option">Spanish/EUR</div>
              <div className="language-option">Chinese/CNY</div>
            </div>
          )}
        </div>
        
        {/* Conditional rendering based on viewport */}
        {isMobile ? (
          // Mobile Accordion Layout
          <div className="footer-accordion">
            {/* More about TradeX */}
            <div className="footer-column">
              <h3 
                className={`column-title ${activeSections.includes(0) ? 'active' : ''}`}
                onClick={() => toggleSection(0)}
              >
                {sectionTitles[0]}
              </h3>
              <ul className={`column-links ${activeSections.includes(0) ? 'active' : ''}`}>
                <li><a href="#about">About us</a></li>
                <li><a href="#privacy">Candidate privacy notice</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#contact">Contact us</a></li>
                <li><a href="#terms">Terms of service</a></li>
                <li><a href="#privacy-notice">Privacy notice</a></li>
                <li><a href="#disclosures">Disclosures</a></li>
                <li><a href="#whistleblower">Whistleblower notice</a></li>
                <li><a href="#law">Law enforcement</a></li>
                <li><a href="#app">TradeX app</a></li>
                <li><a href="#okx-tr">TradeX TR</a></li>
              </ul>
            </div>
            
            {/* Products */}
            <div className="footer-column">
              <h3 
                className={`column-title ${activeSections.includes(1) ? 'active' : ''}`}
                onClick={() => toggleSection(1)}
              >
                {sectionTitles[1]}
              </h3>
              <ul className={`column-links ${activeSections.includes(1) ? 'active' : ''}`}>
                <li><a href="#buy-crypto">Buy crypto</a></li>
                <li><a href="#p2p-trading">P2P trading</a></li>
                <li><a href="#convert">Convert</a></li>
                <li><a href="#trade">Trade</a></li>
                <li><a href="#earn">Earn</a></li>
                <li><a href="#oktc">OKTC</a></li>
                <li><a href="#trading-bots">Trading bots</a></li>
                <li><a href="#all-cryptocurrencies">All cryptocurrencies</a></li>
                <li><a href="#learn">Learn</a></li>
                <li><a href="#tradingview">TradingView</a></li>
              </ul>
            </div>
            
            {/* Services */}
            <div className="footer-column">
              <h3 
                className={`column-title ${activeSections.includes(2) ? 'active' : ''}`}
                onClick={() => toggleSection(2)}
              >
                {sectionTitles[2]}
              </h3>
              <ul className={`column-links ${activeSections.includes(2) ? 'active' : ''}`}>
                <li><a href="#affiliate">Affiliate</a></li>
                <li><a href="#v5-api">V5 API</a></li>
                <li><a href="#historical-data">Historical market data</a></li>
                <li><a href="#fee-schedule">CEX fee schedule</a></li>
                <li><a href="#listing">Listing application</a></li>
                <li><a href="#p2p-merchant">P2P Merchant application</a></li>
              </ul>
            </div>
            
            {/* Support */}
            <div className="footer-column">
              <h3 
                className={`column-title ${activeSections.includes(3) ? 'active' : ''}`}
                onClick={() => toggleSection(3)}
              >
                {sectionTitles[3]}
              </h3>
              <ul className={`column-links ${activeSections.includes(3) ? 'active' : ''}`}>
                <li><a href="#support-center">Support center</a></li>
                <li><a href="#channel-verification">Channel verification</a></li>
                <li><a href="#announcements">Announcements</a></li>
                <li><a href="#connect-with-okx">Connect with TradeX</a></li>
              </ul>
            </div>
            
            {/* Crypto calculator */}
            <div className="footer-column">
              <h3 
                className={`column-title ${activeSections.includes(4) ? 'active' : ''}`}
                onClick={() => toggleSection(4)}
              >
                {sectionTitles[4]}
              </h3>
              <ul className={`column-links ${activeSections.includes(4) ? 'active' : ''}`}>
                <li><a href="#btc-usd">BTC to USD</a></li>
                <li><a href="#eth-usd">ETH to USD</a></li>
                <li><a href="#usdt-usd">USDT to USD</a></li>
                <li><a href="#sol-usd">SOL to USD</a></li>
                <li><a href="#xrp-usd">XRP to USD</a></li>
              </ul>
            </div>
            
            {/* Trade */}
            <div className="footer-column">
              <h3 
                className={`column-title ${activeSections.includes(5) ? 'active' : ''}`}
                onClick={() => toggleSection(5)}
              >
                {sectionTitles[5]}
              </h3>
              <ul className={`column-links ${activeSections.includes(5) ? 'active' : ''}`}>
                <li><a href="#btc-usdc">BTC USDC</a></li>
                <li><a href="#eth-usdc">ETH USDC</a></li>
                <li><a href="#btc-usdt">BTC USDT</a></li>
                <li><a href="#eth-usdt">ETH USDT</a></li>
                <li><a href="#ltc-usdt">LTC USDT</a></li>
                <li><a href="#sol-usdt">SOL USDT</a></li>
                <li><a href="#xrp-usdt">XRP USDT</a></li>
                <li><a href="#bitcoin-price">Bitcoin price</a></li>
                <li><a href="#ethereum-price">Ethereum price</a></li>
                <li><a href="#cardano-price">Cardano price</a></li>
                <li><a href="#solana-price">Solana price</a></li>
                <li><a href="#xrp-price">XRP price</a></li>
                <li><a href="#bitcoin-prediction">Bitcoin price prediction</a></li>
                <li><a href="#ethereum-prediction">Ethereum price prediction</a></li>
                <li><a href="#xrp-prediction">XRP price prediction</a></li>
                <li><a href="#how-to-buy-crypto">How to buy crypto</a></li>
                <li><a href="#how-to-buy-bitcoin">How to buy Bitcoin</a></li>
                <li><a href="#how-to-buy-ethereum">How to buy Ethereum</a></li>
                <li><a href="#how-to-buy-solana">How to buy Solana</a></li>
              </ul>
            </div>

            {/* No Trade on the go section for mobile view */}
          </div>
        ) : (
          // Desktop Layout
          <div className="footer-columns">
            {/* More about TradeX */}
            <div className="footer-column">
              <h3 className="column-title">More about TradeX</h3>
              <ul className="column-links">
                <li><a href="#about">About us</a></li>
                <li><a href="#privacy">Candidate privacy notice</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#contact">Contact us</a></li>
                <li><a href="#terms">Terms of service</a></li>
                <li><a href="#privacy-notice">Privacy notice</a></li>
                <li><a href="#disclosures">Disclosures</a></li>
                <li><a href="#whistleblower">Whistleblower notice</a></li>
                <li><a href="#law">Law enforcement</a></li>
                <li><a href="#app">TradeX app</a></li>
                <li><a href="#okx-tr">TradeX TR</a></li>
              </ul>
            </div>
            
            {/* Products */}
            <div className="footer-column">
              <h3 className="column-title">Products</h3>
              <ul className="column-links">
                <li><a href="#buy-crypto">Buy crypto</a></li>
                <li><a href="#p2p-trading">P2P trading</a></li>
                <li><a href="#convert">Convert</a></li>
                <li><a href="#trade">Trade</a></li>
                <li><a href="#earn">Earn</a></li>
                <li><a href="#oktc">OKTC</a></li>
                <li><a href="#trading-bots">Trading bots</a></li>
                <li><a href="#all-cryptocurrencies">All cryptocurrencies</a></li>
                <li><a href="#learn">Learn</a></li>
                <li><a href="#tradingview">TradingView</a></li>
              </ul>
            </div>
            
            {/* Services */}
            <div className="footer-column">
              <h3 className="column-title">Services</h3>
              <ul className="column-links">
                <li><a href="#affiliate">Affiliate</a></li>
                <li><a href="#v5-api">V5 API</a></li>
                <li><a href="#historical-data">Historical market data</a></li>
                <li><a href="#fee-schedule">CEX fee schedule</a></li>
                <li><a href="#listing">Listing application</a></li>
                <li><a href="#p2p-merchant">P2P Merchant application</a></li>
              </ul>
              
              <h3 className="column-title support-title">Support</h3>
              <ul className="column-links">
                <li><a href="#support-center">Support center</a></li>
                <li><a href="#channel-verification">Channel verification</a></li>
                <li><a href="#announcements">Announcements</a></li>
                <li><a href="#connect-with-okx">Connect with TradeX</a></li>
              </ul>
            </div>
            
            {/* Crypto calculator */}
            <div className="footer-column">
              <h3 className="column-title">Crypto calculator</h3>
              <ul className="column-links">
                <li><a href="#btc-usd">BTC to USD</a></li>
                <li><a href="#eth-usd">ETH to USD</a></li>
                <li><a href="#usdt-usd">USDT to USD</a></li>
                <li><a href="#sol-usd">SOL to USD</a></li>
                <li><a href="#xrp-usd">XRP to USD</a></li>
              </ul>
            </div>
            
            {/* Trade */}
            <div className="footer-column">
              <h3 className="column-title">Trade</h3>
              <ul className="column-links">
                <li><a href="#btc-usdc">BTC USDC</a></li>
                <li><a href="#eth-usdc">ETH USDC</a></li>
                <li><a href="#btc-usdt">BTC USDT</a></li>
                <li><a href="#eth-usdt">ETH USDT</a></li>
                <li><a href="#ltc-usdt">LTC USDT</a></li>
                <li><a href="#sol-usdt">SOL USDT</a></li>
                <li><a href="#xrp-usdt">XRP USDT</a></li>
                <li><a href="#bitcoin-price">Bitcoin price</a></li>
                <li><a href="#ethereum-price">Ethereum price</a></li>
                <li><a href="#cardano-price">Cardano price</a></li>
                <li><a href="#solana-price">Solana price</a></li>
                <li><a href="#xrp-price">XRP price</a></li>
                <li><a href="#bitcoin-prediction">Bitcoin price prediction</a></li>
                <li><a href="#ethereum-prediction">Ethereum price prediction</a></li>
                <li><a href="#xrp-prediction">XRP price prediction</a></li>
                <li><a href="#how-to-buy-crypto">How to buy crypto</a></li>
                <li><a href="#how-to-buy-bitcoin">How to buy Bitcoin</a></li>
                <li><a href="#how-to-buy-ethereum">How to buy Ethereum</a></li>
                <li><a href="#how-to-buy-solana">How to buy Solana</a></li>
              </ul>
            </div>
            
            {/* Trade on the go - Desktop Only */}
            <div className="footer-column trade-on-go">
              <h3 className="column-title">Trade on the go with<br />TradeX</h3>
              <button className="trade-button">Trade</button>
              <QRCodeSVG 
                value={appDownloadUrl}
                size={150}
                level={"H"}
                includeMargin={true}
                className="qr-code-image"
              />
              <p className="qr-text">Scan to download TradeX app</p>
            </div>
          </div>
        )}
        
        {/* Social Media Section */}
        <div className="social-section">
          <h3 className="social-title">Community</h3>
          <div className="social-icons">
            <a href="#twitter" className="social-icon"><FaTwitter /></a>
            <a href="#tiktok" className="social-icon"><FaTiktok /></a>
            <a href="#instagram" className="social-icon"><FaInstagram /></a>
            <a href="#discord" className="social-icon"><FaDiscord /></a>
            <a href="#telegram" className="social-icon"><FaTelegram /></a>
            <a href="#facebook" className="social-icon"><FaFacebook /></a>
            <a href="#youtube" className="social-icon"><FaYoutube /></a>
            <a href="#linkedin" className="social-icon"><FaLinkedin /></a>
            <a href="#more" className="social-icon"><FaEllipsisH /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;