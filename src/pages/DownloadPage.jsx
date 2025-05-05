import React from 'react'
import { FaMobile, FaDesktop } from 'react-icons/fa';
import './DownloadPage.css';
import DownloadImage1 from '../assets/img/download-img-1.png';
import DownloadImage2 from '../assets/img/download-img-2-removebg-preview.png';
import DownloadImage3 from '../assets/img/download-img-3.png';
import logo from '../assets/logo/logo.png';
const DownloadPage = () => {
  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="landing__hero">
        <div className="landing__container">
          <div className="landing__hero-content">
            <h1 className="landing__title">
              A new alternative<br />
              to <span className="landing__highlight">your crypto</span><br />
              <span className="landing__highlight">journey</span>
            </h1>
            <p className="landing__tagline">Crypto trading — made easy for you</p>
            <div className="landing__buttons">
              <button className="landing__button">
                <FaMobile className="landing__button-icon" />
                Download app
              </button>
              <button className="landing__button landing__button--outline">
                <FaDesktop className="landing__button-icon" />
                Download Desktop
              </button>
            </div>
          </div>
          <div className="landing__hero-image">
            {/* Placeholder for phone mockups */}
            <img src={DownloadImage1} alt="download-img-1" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing__features">
        <div className="landing__container landing__container--reverse">
          <div className="landing__features-image">
            {/* Placeholder for app screenshots */}
            <img src={DownloadImage2} alt="download-img-2" />
          </div>
          <div className="landing__features-content">
            <h2 className="landing__section-title">One app</h2>
            <h3 className="landing__section-subtitle">Unlimited possibilities</h3>
            <p className="landing__description">
              Download the TradeX app to trade crypto on the go. Gain access to diverse tokens and trading pairs, advanced market data and more!
            </p>
          </div>
        </div>
      </section>

      {/* Desktop Platform Section */}
      <section className="landing__platform">
        <div className="landing__container">
          <div className="landing__platform-content">
            <h2 className="landing__section-title">Powerful platform</h2>
            <h3 className="landing__section-subtitle">Trade like a pro</h3>
            <p className="landing__description">
              Trade crypto like a pro with our crypto trading platform on your desktop. Experience the fastest transactions and our powerful API on Window or MacOS today.
            </p>
          </div>
          <div className="landing__platform-image">
            {/* Placeholder for desktop platform screenshot */}
            <img src={DownloadImage3} alt="download-img-3" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing__footer">
        <div className="landing__container landing__container--footer">
            <div className="landing__footer-brand">
            <div className="landing__logo">
                <img src={logo} alt="logo" />
                <h3 className="landing__logo-text">TradeX APP</h3>
            </div>
            <p className="landing__footer-tagline">Crypto exchange on the go</p>
            </div>
            <div className="landing__footer-buttons">
            <button className="landing__button landing__button--dark landing__button--outline">
                Download app
            </button>
            <button className="landing__button landing__button--dark landing__button--outline">
                Download Desktop
            </button>
            </div>
         </div>
        </footer>
    </div>
  )
}

export default DownloadPage