import React, { useEffect, useState } from 'react';
import styles from './Hero.module.css';
import unverifiedStyles from './HeroUnverified.module.css';
import sponsor1 from '../../assets/sponsor1.webp';
import sponsor2 from '../../assets/sponsor2.webp';
import sponsor3 from '../../assets/sponsor3.webp';
import phone from '../../assets/phone.png';

const Hero = () => {
  const [isVerified, setIsVerified] = useState(true);

  useEffect(() => {
    // localStorage returns string, so check for string 'true'
    setIsVerified(localStorage.getItem('is_verified') === 'true');
  }, []);

  if (!isVerified) {
    // Unverified user view (OKX style)
    return (
      <section className={unverifiedStyles.unverifiedHero}>
        <div className={unverifiedStyles.unverifiedInner}>
          <div className={unverifiedStyles.unverifiedContent}>
            <h1 className={unverifiedStyles.unverifiedTitle}>You're almost there</h1>
            <div className={unverifiedStyles.unverifiedSubtitle}>
              Verify your identity to start your crypto journey with us
            </div>
            <button
              className={unverifiedStyles.verifyBtn}
              onClick={() => { window.location.href = '/account/profile/verify'; }}
            >
              Verify now
            </button>
            <div className={unverifiedStyles.sponsors}>
              <img src={sponsor1} alt="Tribeca" />
              <img src={sponsor2} alt="McLaren" />
              <img src={sponsor3} alt="Manchester City" />
            </div>
          </div>
          <div className={unverifiedStyles.unverifiedPhone}>
            <img src={phone} alt="TradeX Mobile App" style={{ width: '100%', borderRadius: '32px', boxShadow: '0 8px 32px #000a' }} />
          </div>
        </div>
      </section>
    );
  }

  // Verified user view (original)
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