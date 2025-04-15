import React from 'react';
import sponsor1 from '../../assets/sponsor1.webp';
import sponsor2 from '../../assets/sponsor2.webp';
import sponsor3 from '../../assets/sponsor3.webp';
import phone from '../../assets/phone.png';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Faster, better, stronger than your average crypto exchange</h1>
        <div className="email-form">
          <input type="email" placeholder="Email address" />
          <button className="try-btn">Try TradeX</button>
        </div>
        <div className="partner-logos">
          <img src={sponsor1} alt="Tribeca" />
          <img src={sponsor2} alt="McLaren" />
          <img src={sponsor3} alt="Manchester City" />
        </div>
      </div>
      <div className="hero-image">
        <div className="phone-wrapper">
          <img src={phone} alt="TradeX Mobile App" />
        </div>
      </div>
    </section>
  );
};

export default Hero; 