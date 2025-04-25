import React from 'react';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import './CampaignCenter.css';

const CampaignCenter = () => {
  return (
    <div className="campaign-center-root">
      <Navbar />
      <main className="campaign-center-main">
        <section className="campaign-center-banner">
          <div className="banner-content">
            <h1 className="banner-title">Campaign center</h1>
            <div className="banner-desc">Complete tasks, earn rewards, kick-start your crypto journey.</div>
          </div>
          <div className="banner-icon">
            <img src={require('../../assets/campaign/4CB74EBAAA39B076.png')} alt="No tasks" width="90" height="90" style={{display:'block', objectFit:'contain'}} />
          </div>
        </section>
        <section className="campaign-center-tasks">
          <h2 className="section-title">Tasks</h2>
          <div className="section-desc">Elevate your earning experience.</div>
          <div className="tasks-empty">
            <div className="tasks-empty-icon">
              <img src={require('../../assets/campaign/4CB74EBAAA39B076.png')} alt="No tasks" width="70" height="70" style={{display:'block', objectFit:'contain'}} />
            </div>
            <div className="tasks-empty-text">You don't have any tasks to complete right now.</div>
          </div>
        </section>
        <section className="campaign-center-campaigns">
          <div className="campaigns-header">
            <h2 className="section-title">Campaigns</h2>
            <a href="#" className="view-all">View all <span style={{fontSize: '1.2em', marginLeft: 2}}>&rarr;</span></a>
          </div>
          <div className="campaigns-list">
            <div className="campaign-card">
              <div className="campaign-badge">For New Users</div>
              <div className="campaign-img">
                <img src={require('../../assets/campaign/4CB74EBAAA39B076.png')} alt="Campaign" width="60" height="60" style={{display:'block', objectFit:'contain'}} />
              </div>
              <div className="campaign-title">10,000 $BABY & 76,000 $NAXX</div>
              <div className="campaign-desc">Exclusively for New Users. Complete all tasks and get up to 25 USDT & 1,000 $BABY.</div>
              <button className="campaign-join">Join</button>
            </div>
            <div className="campaign-card">
              <div className="campaign-badge">Ends in 13 days</div>
              <div className="campaign-img">
                <img src={require('../../assets/campaign/4CB74EBAAA39B076.png')} alt="Campaign" width="60" height="60" style={{display:'block', objectFit:'contain'}} />
              </div>
              <div className="campaign-title">Walletconnect Trade and Earn Campaign</div>
              <div className="campaign-desc">Earn a share of 1,200,000 $WCT Prize Pool when you trade using WalletConnect.</div>
              <button className="campaign-join">Join</button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CampaignCenter;
