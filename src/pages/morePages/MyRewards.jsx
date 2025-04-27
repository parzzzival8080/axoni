import React from 'react';
import './MyRewards.css';
import referralImage1 from '../../assets/referral/0DEDDD03AB730CD5.webp';
import referralImage2 from '../../assets/referral/D664C8EB85A43D97.webp';
import referralImage3 from '../../assets/referral/F5935075AB7CA066.webp';

const MyRewards = () => {
  return (
    <main className="my-rewards-main">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>My rewards</h1>
            <p>See how far you've come with your rewards.</p>
          </div>
          <div className="hero-image">
            <img src={referralImage1} alt="Rewards" />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="main-content">
        <div className="container">
          {/* My Rewards Section */}
          <div className="section">
            <h2>My rewards</h2>
            
            <div className="cards-grid">
              {/* Crypto Card */}
              <div className="card">
                <div className="card-content">
                  <h3>Crypto</h3>
                  <div className="amount">0 USDT</div>
                  <p>New funds for you on us</p>
                </div>
                <button className="see-more-btn">See more</button>
              </div>
              
              {/* Trading Bonus Card */}
              <div className="card">
                <div className="card-content">
                  <h3>Trading bonus</h3>
                  <div className="amount">0 USDT</div>
                  <p>Claim and use the power of leverage</p>
                </div>
                <button className="see-more-btn">See more</button>
              </div>
            </div>
            
            <div className="cards-grid">
              {/* Rebate Card */}
              <div className="card">
                <div className="card-content">
                  <h3>Rebate card</h3>
                  <div className="amount">0 USDT</div>
                  <p>Save on your trading costs</p>
                </div>
                <button className="see-more-btn">See more</button>
              </div>
              
              {/* Contract Voucher Card */}
              <div className="card">
                <div className="card-content">
                  <h3>Contract voucher</h3>
                  <div className="amount">0 vouchers</div>
                  <p>Trade perpetual futures for free</p>
                </div>
                <button className="see-more-btn">See more</button>
              </div>
            </div>
          </div>
          
          {/* My Perks Section */}
          <div className="section">
            <h2>My perks</h2>
            
            <div className="cards-grid">
              {/* Trading Fee Tier Card */}
              <div className="card perk-card">
                <div className="card-content">
                  <h3>Trading fee tier</h3>
                  <div className="amount">L1</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Referral Images Section */}
          <div className="section referral-images-section">
            <div className="referral-images">
              <img src={referralImage1} alt="Referral" className="referral-img" />
              <img src={referralImage2} alt="Referral" className="referral-img" />
              <img src={referralImage3} alt="Referral" className="referral-img" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MyRewards;
