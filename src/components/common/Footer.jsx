import React from 'react';
import {
  FaTwitter,
  FaTelegram,
  FaDiscord,
  FaFacebook,
  FaInstagram,
  FaReddit,
  FaYoutube
} from 'react-icons/fa';

const Footer = () => {
  const footerLinks = [
    {
      title: 'More about OKX',
      links: [
        'About us', 'Careers', 'Press room', 'Security', 'Help center',
        'Contact us', 'Blog', 'API', 'Web3 docs', 'Telegram'
      ]
    },
    {
      title: 'Products',
      links: [
        'Exchange', 'App', 'Wallet', 'NFT', 'Earn', 'Demo trading',
        'Jumpstart', 'VIP', 'Institutional', 'Block trading'
      ]
    },
    {
      title: 'Services',
      links: ['VIP', 'Institutional', 'API']
    },
    {
      title: 'Support',
      links: [
        'Help center', 'User feedback', 'Security notice',
        'Anti-money laundering', 'Law enforcement'
      ]
    },
    {
      title: 'Buy crypto',
      links: [
        'Buy Bitcoin', 'Buy Ethereum', 'Buy Solana', 'Buy XRP',
        'Buy ADA', 'Buy BNB', 'Buy Dogecoin', 'Buy Shiba',
        'Buy AVAX', 'Buy NEAR'
      ]
    },
    {
      title: 'Trade',
      links: [
        'Spot trading', 'Futures', 'Options', 'Margin',
        'Paper trading', 'Crypto calculator', 'Price chart',
        'Fee rate', 'Trading bots', 'OTC'
      ]
    },
    {
      title: 'Tools on the go with',
      links: [
        'Crypto converter', 'Cryptocurrency price list',
        'Cryptocurrency calculator', 'Market cap crypto',
        'Buy crypto guides', 'Sell crypto guides',
        'DCA calculator', 'Profit calculator',
        'How to buy Bitcoin', 'How to buy Ethereum'
      ]
    }
  ];

  return (
    <footer>
      <div className="footer-top">
        <div className="footer-logo">
          <img src="/assets/images/okx-logo.png" alt="OKX" />
          <p>© 2023 OKX</p>
        </div>
        <div className="download-app">
          <button className="download-btn">Download App</button>
          <div className="qr-code">
            <img src="/assets/images/qr-code.png" alt="QR Code" />
            <p>Scan to download our app</p>
          </div>
        </div>
      </div>
      <div className="footer-links">
        {footerLinks.map((section, index) => (
          <div className="footer-column" key={index}>
            <h4>{section.title}</h4>
            <ul>
              {section.links.map((link, linkIndex) => (
                <li key={linkIndex}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer-social">
        <div className="community">Community</div>
        <div className="social-icons">
          <a href="#"><FaTwitter /></a>
          <a href="#"><FaTelegram /></a>
          <a href="#"><FaDiscord /></a>
          <a href="#"><FaFacebook /></a>
          <a href="#"><FaInstagram /></a>
          <a href="#"><FaReddit /></a>
          <a href="#"><FaYoutube /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 