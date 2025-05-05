import React from 'react';
import styles from './Hero.module.css';
import sponsor1 from '../../assets/sponsor1.webp';
import sponsor2 from '../../assets/sponsor2.webp';
import sponsor3 from '../../assets/sponsor3.webp';
import phone from '../../assets/phone.png';

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Faster, better, stronger than your average crypto exchange</h1>
          <div className={styles.emailForm}>
            <input type="email" className={styles.emailInput} placeholder="Email address" />
            <button className={styles.tryBtn}>Try TradeX</button>
          </div>
          <div className={styles.partnerLogos}>
            <img src={sponsor1} alt="Tribeca" />
            <img src={sponsor2} alt="McLaren" />
            <img src={sponsor3} alt="Manchester City" />
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.phoneWrapper}>
            <img src={phone} alt="TradeX Mobile App" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;