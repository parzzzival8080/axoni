import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaGlobe,
  FaChevronDown,
  FaChevronUp,
  FaTwitter,
  FaTiktok,
  FaInstagram,
  FaDiscord,
  FaTelegram,
  FaFacebook,
  FaYoutube,
  FaLinkedin,
  FaEllipsisH,
} from "react-icons/fa";
import Logo from "../../assets/logo/logo.png";
import { QRCodeSVG } from "qrcode.react";

const Footer = () => {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [activeSections, setActiveSections] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [showTradeOnGo, setShowTradeOnGo] = useState(true);

  const appDownloadUrl = "https://api.axoni.co/api/v1/download-axoni-apk";

  // Check if viewport is mobile
  useEffect(() => {
    const checkViewport = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setShowTradeOnGo(width > 917);
    };

    checkViewport();
    window.addEventListener("resize", checkViewport);

    return () => {
      window.removeEventListener("resize", checkViewport);
    };
  }, []);

  // Toggle accordion sections on mobile
  const toggleSection = (index) => {
    setActiveSections((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  // Section titles for mobile accordion
  const sectionTitles = [
    "More about AXONI",
    "Products",
    "Markets",
    "Account",
    "Resources",
    "Trade",
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Logo and Copyright */}
        <div className="footer-logo">
          <div className="logo-container">
            <img
              src={Logo}
              alt="AXONI-logo"
              className="h-12 w-auto object-contain"
            />
          </div>
          <p className="copyright">©2025 axoni.co | All Rights Reserved</p>
        </div>

        {/* Language Selector */}

        {/* Conditional rendering based on viewport */}
        {isMobile ? (
          // Mobile Accordion Layout
          <div className="footer-accordion">
            {/* More about AXONI */}
            <div className="footer-column">
              <h3
                className={`column-title ${
                  activeSections.includes(0) ? "active" : ""
                }`}
                onClick={() => toggleSection(0)}
              >
                {sectionTitles[0]}
              </h3>
              <ul
                className={`column-links ${
                  activeSections.includes(0) ? "active" : ""
                }`}
              >
                <li>
                  <Link to="/about-us">About us</Link>
                </li>
                <li>
                  <Link to="#">Terms of Use</Link>
                </li>
                <li>
                  <Link to="#">Privacy and Cookie Policy</Link>
                </li>
                <li>
                  <Link to="/download">Download App</Link>
                </li>
                <li>
                  <Link to="/legal">Legal</Link>
                </li>
              </ul>
            </div>

            {/* Products */}
            <div className="footer-column">
              <h3
                className={`column-title ${
                  activeSections.includes(1) ? "active" : ""
                }`}
                onClick={() => toggleSection(1)}
              >
                {sectionTitles[1]}
              </h3>
              <ul
                className={`column-links ${
                  activeSections.includes(1) ? "active" : ""
                }`}
              >
                {/* <li>
                  <Link to="/conversion">Convert</Link>
                </li>
                <li>
                  <Link to="/spot-trading">Spot Trading</Link>
                </li>
                <li>
                  <Link to="/future-trading">Future Trading</Link>
                </li>
                <li>
                  <Link to="/earn">Earn</Link>
                </li>
                <li>
                  <Link to="/market">Markets</Link>
                </li>
                <li>
                  <Link to="/my-assets">Assets</Link>
                </li> */}
                <li>
                  <Link to="/spot-trading">Spot Trading</Link>
                </li>
                <li>
                  <Link to="/future-trading">Futures Trading</Link>
                </li>
                <li>
                  <Link to="/conversion">Conversion</Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div className="footer-column">
              <h3
                className={`column-title ${
                  activeSections.includes(2) ? "active" : ""
                }`}
                onClick={() => toggleSection(2)}
              >
                {sectionTitles[2]}
              </h3>
              <ul
                className={`column-links ${
                  activeSections.includes(2) ? "active" : ""
                }`}
              >
                {/* <li>
                  <a href="#affiliate">Affiliate</a>
                </li>
                <li>
                  <a href="#v5-api">V5 API</a>
                </li>
                <li>
                  <a href="#historical-data">Historical market data</a>
                </li>
                <li>
                  <a href="#fee-schedule">CEX fee schedule</a>
                </li>
                <li>
                  <a href="#listing">Listing application</a>
                </li>
                <li>
                  <a href="#p2p-merchant">P2P Merchant application</a>
                </li> */}

          
                <li>
                  <Link to="/market">Market Overview</Link>
                </li>
                <li>
                  <Link to="/my-assets">Assets</Link>
                </li>
              </ul>

            </div>

            {/* Support */}
            <div className="footer-column">
              <h3
                className={`column-title ${
                  activeSections.includes(3) ? "active" : ""
                }`}
                onClick={() => toggleSection(3)}
              >
                {sectionTitles[3]}
              </h3>
              <ul
                className={`column-links ${
                  activeSections.includes(3) ? "active" : ""
                }`}
              >
                {/* <li>
                  <a href="#support-center">Support center</a>
                </li>
                <li>
                  <a href="#channel-verification">Channel verification</a>
                </li>
                <li>
                  <a href="#announcements">Announcements</a>
                </li>
                <li>
                  <a href="#connect-with-okx">Connect with AXONI</a>
                </li> */}
                 <li>
                  <Link to="/signup">Sign Up</Link>
                </li>
                <li>
                  <Link to="/login">Login</Link>
                </li>
              </ul>
            </div>

            {/* Crypto calculator */}
            <div className="footer-column">
              <h3
                className={`column-title ${
                  activeSections.includes(4) ? "active" : ""
                }`}
                onClick={() => toggleSection(4)}
              >
                {sectionTitles[4]}
              </h3>
              <ul
                className={`column-links ${
                  activeSections.includes(4) ? "active" : ""
                }`}
              >
                {/* <li>
                  <a href="#btc-usd">BTC to USD</a>
                </li>
                <li>
                  <a href="#eth-usd">ETH to USD</a>
                </li>
                <li>
                  <a href="#usdt-usd">USDT to USD</a>
                </li>
                <li>
                  <a href="#sol-usd">SOL to USD</a>
                </li>
                <li>
                  <a href="#xrp-usd">XRP to USD</a>
                </li> */}
                  <li>
                  <Link to="/about-us">About Us</Link>
                </li>
                <li>
                  <Link to="/download">Download App</Link>
                </li>
              </ul>
            </div>

            {/* Trade */}
            <div className="footer-column">
              <h3
                className={`column-title ${
                  activeSections.includes(5) ? "active" : ""
                }`}
                onClick={() => toggleSection(5)}
              >
                {sectionTitles[5]}
              </h3>
              <ul
                className={`column-links ${
                  activeSections.includes(5) ? "active" : ""
                }`}
              >
                {/* <li>
                  <a href="#btc-usdc">BTC USDC</a>
                </li>
                <li>
                  <a href="#eth-usdc">ETH USDC</a>
                </li>
                <li>
                  <a href="#btc-usdt">BTC USDT</a>
                </li>
                <li>
                  <a href="#eth-usdt">ETH USDT</a>
                </li>
                <li>
                  <a href="#ltc-usdt">LTC USDT</a>
                </li>
                <li>
                  <a href="#sol-usdt">SOL USDT</a>
                </li>
                <li>
                  <a href="#xrp-usdt">XRP USDT</a>
                </li>
                <li>
                  <a href="#bitcoin-price">Bitcoin price</a>
                </li>
                <li>
                  <a href="#ethereum-price">Ethereum price</a>
                </li>
                <li>
                  <a href="#cardano-price">Cardano price</a>
                </li>
                <li>
                  <a href="#solana-price">Solana price</a>
                </li>
                <li>
                  <a href="#xrp-price">XRP price</a>
                </li>
                <li>
                  <a href="#bitcoin-prediction">Bitcoin price prediction</a>
                </li>
                <li>
                  <a href="#ethereum-prediction">Ethereum price prediction</a>
                </li>
                <li>
                  <a href="#xrp-prediction">XRP price prediction</a>
                </li>
                <li>
                  <a href="#how-to-buy-crypto">How to buy crypto</a>
                </li>
                <li>
                  <a href="#how-to-buy-bitcoin">How to buy Bitcoin</a>
                </li>
                <li>
                  <a href="#how-to-buy-ethereum">How to buy Ethereum</a>
                </li>
                <li>
                  <a href="#how-to-buy-solana">How to buy Solana</a>
                </li> */}

                 <li>
                  <Link to="/spot-trading">Spot Trading</Link>
                </li>
                <li>
                  <Link to="/future-trading">Futures Trading</Link>
                </li>

              </ul>
            </div>

            {/* No Trade on the go section for mobile view */}
          </div>
        ) : (
          // Desktop Layout
          <div className="footer-columns">
            {/* More about AXONI */}
            <div className="footer-column">
              <h3 className="column-title">More about AXONI</h3>
              <ul className="column-links">
                <li>
                  <Link to="/about-us">About us</Link>
                </li>
                <li>
                  <Link to="/terms-condtions">Terms of Use</Link>
                </li>
                <li>
                  <Link to="/privacy-policy">Privacy and Cookie Policy</Link>
                </li>
                <li>
                  <Link to="/download">Download App</Link>
                </li>
                <li>
                  <Link to="/legal">Legal</Link>
                </li>
              </ul>
            </div>

            {/* Products */}
            <div className="footer-column">
              <h3 className="column-title">Products</h3>
              <ul className="column-links">
                <li>
                  <Link to="/spot-trading">Spot Trading</Link>
                </li>
                <li>
                  <Link to="/future-trading">Futures Trading</Link>
                </li>
                <li>
                  <Link to="/conversion">Conversion</Link>
                </li>
                {/* <li>
                  <Link to="/earn">Earn</Link>
                </li> */}
              </ul>
            </div>

            {/* Services */}
            <div className="footer-column">
              <h3 className="column-title">Markets</h3>
              <ul className="column-links">
                <li>
                  <Link to="/market">Market Overview</Link>
                </li>
                <li>
                  <Link to="/my-assets">Assets</Link>
                </li>
              </ul>

              <h3 className="column-title support-title">Account</h3>
              <ul className="column-links">
                <li>
                  <Link to="/signup">Sign Up</Link>
                </li>
                <li>
                  <Link to="/login">Login</Link>
                </li>
              </ul>
            </div>

            {/* Crypto calculator */}
            <div className="footer-column">
              <h3 className="column-title">Resources</h3>
              <ul className="column-links">
                <li>
                  <Link to="/about-us">About Us</Link>
                </li>
                <li>
                  <Link to="/download">Download App</Link>
                </li>
              </ul>
            </div>

            {/* Trade */}
            <div className="footer-column">
              <h3 className="column-title">Trade</h3>
              <ul className="column-links">
                <li>
                  <Link to="/spot-trading">Spot Trading</Link>
                </li>
                <li>
                  <Link to="/future-trading">Futures Trading</Link>
                </li>
              </ul>
            </div>

            {/* Trade on the go - Desktop Only - Hidden when width < 806px */}
            {showTradeOnGo && (
              <div className="footer-column trade-on-go">
                <h3 className="column-title flex flex-col items-start text-left">
                  <span>Trade on the go with</span>
                  <span>AXONI</span>
                </h3>
                {/* <button
                  to="/spot-trading"
                >
                  Trade Now
                </button> */}
                <Link
                  className="bg-[#F0B90B] hover:bg-[#e67615] text-white font-medium py-2 px-6 rounded-full transition-colors duration-200 mb-2"
                  to="/spot-trading"
                >
                  Trade Now
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
