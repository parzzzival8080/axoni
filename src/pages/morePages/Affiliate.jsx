import React from 'react';
import './Affiliate.css';
import VerticalBreadcrumb from '../../components/affiliate/VerticalBreadCrumb';
import JoinUseImg1 from '../../assets/img/affiliate-join-us-1.png';
import JoinUseImg2 from '../../assets/img/affiliate-join-us-2.png';
import JoinUseImg3 from '../../assets/img/affiliate-join-us-3.png';
import HowItUse1 from '../../assets/img/how-it-works-1.png';
import HowItUse2 from '../../assets/img/how-it-works-2.png';
import HowItUse3 from '../../assets/img/how-it-works-3.png';

// SVG Components
const ChartSVG = () => (
    <div className="chart-container">
      <svg viewBox="0 0 800 600" className="chart" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9EFF00" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#9EFF00" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path 
          d="M 0,600 C 200,550 400,450 600,250 L 760,100 L 760,600 Z" 
          fill="url(#chartGradient)"
        />
        <path 
          d="M 0,600 C 200,550 400,450 600,250 L 760,100" 
          fill="none" 
          stroke="#9EFF00" 
          strokeWidth="4"
        />
        <circle cx="760" cy="100" r="10" fill="#9EFF00" />
        <line x1="760" y1="100" x2="760" y2="600" stroke="#9EFF00" strokeWidth="1" strokeDasharray="8,8" />
      </svg>
      <div className="earnings-badge">
        <span>Potential earnings/month</span>
        <div className="earnings-amount">≈8,005 USDT</div>
      </div>
    </div>
  );
  
  const CommissionIcon = () => (
    <svg viewBox="0 0 100 100" className="feature-icon">
      <circle cx="50" cy="50" r="40" fill="none" stroke="#9EFF00" strokeWidth="4" />
      <path d="M 30,50 L 45,65 L 70,35" stroke="#9EFF00" strokeWidth="4" fill="none" />
    </svg>
  );
  
  const ProductsIcon = () => (
    <div className="products-icon-container">
      <div className="product-icon">T</div>
      <div className="product-icon">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <circle cx="12" cy="12" r="10" fill="#000" />
          <text x="12" y="16" textAnchor="middle" fill="#fff" fontSize="12">₿</text>
        </svg>
      </div>
      <div className="product-icon-accent">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <circle cx="12" cy="12" r="10" fill="#9EFF00" />
          <text x="12" y="16" textAnchor="middle" fill="#000" fontSize="12">$</text>
        </svg>
      </div>
    </div>
  );
  
  const RewardsIcon = () => (
    <div className="rewards-icon">
      <div className="reward-bubble reward-bubble-1">BTC</div>
      <div className="reward-bubble reward-bubble-2">ETH</div>
      <div className="reward-bubble reward-bubble-3">OKX</div>
    </div>
  );
  
  const ProcessIllustration = () => (
    <svg viewBox="0 0 300 300" className="process-illustration">
      <circle cx="150" cy="150" r="120" fill="none" stroke="#222" strokeWidth="2" />
      <circle cx="150" cy="70" r="20" fill="#9EFF00" />
      <text x="150" y="75" textAnchor="middle" fill="#000" fontSize="14">₿</text>
      
      <circle cx="230" cy="150" r="20" fill="#fff" stroke="#222" strokeWidth="2" />
      <text x="230" y="155" textAnchor="middle" fill="#000" fontSize="14">$</text>
      
      <circle cx="150" cy="230" r="20" fill="#fff" stroke="#222" strokeWidth="2" />
      <text x="150" y="235" textAnchor="middle" fill="#000" fontSize="14">×</text>
      
      <circle cx="70" cy="150" r="20" fill="#9EFF00" />
      <text x="70" y="155" textAnchor="middle" fill="#000" fontSize="14">$</text>
      
      <circle cx="150" cy="150" r="40" fill="#fff" stroke="#222" strokeWidth="2" />
      <text x="150" y="155" textAnchor="middle" fill="#000" fontSize="18">OKX</text>
    </svg>
  );

const Affiliate = () => {
        // Sample data for the steps
  const steps = [
    {
      number: 1,
      title: "Submit application",
      label: "Submit application",
      description: "Take a few minutes to fill out our application form, and we'll review it. Once approved, you'll receive an affiliate link.",
      hasUnderReviewBadge: true,
      illustration: HowItUse1
    },
    {
      number: 2,
      title: "Spread the word",
      label: "Spread the word",
      description: "Share your affiliate links or codes with your friends and community, or promote TradeX via social media or any other platform.",
      hasUnderReviewBadge: false,
      illustration: HowItUse2
    },
    {
      number: 3,
      title: "Earn commission",
      label: "Earn commission",
      description: "Promote TradeX via social media or any other platforms, and you can earn up to 50% of your friends' trading fees.",
      hasUnderReviewBadge: true,
      illustration: HowItUse3
    }
  ];

  // State to track the active step
  const [activeStep, setActiveStep] = React.useState(3); // Start with step 3 active

  // Handler for step clicks
  const handleStepClick = (stepNumber) => {
    setActiveStep(stepNumber);
  };

  // Find the active step data
  const activeStepData = steps.find(step => step.number === activeStep);
    

  return (
    <div className="affiliate-container">
      {/* Hero Section (Black Background) */}
      <section className="hero-section">
  <div className="container">
    <div className="hero-content">
      <div className="hero-text">
        <h1>Monetize your<br />influence with<br />TradeX</h1>
        <p className="hero-subheading">
          Are you an influencer or a content creator who shares a passion for crypto? Turn your influence into affluence and earn money by joining the TradeX Affiliate Program!
        </p>
        {/* Apply Now Button */}
        <div className="hero-cta">
          <button className="btn-primary">
            Apply now
          </button>
        </div>
      </div>
      
      {/* Chart placeholder - commented out now, but can be uncommented when needed */}
      {/* <div className="hero-chart">
        <div id="chart-placeholder" className="chart-placeholder">
          <div className="chart-dot"></div>
          <div className="chart-dotted-line"></div>
          
          <div className="earnings-badge">
            <span>Potential earnings/month</span>
            <div className="earnings-amount">≈8,005 USDT</div>
          </div>
        </div>
      </div> */}
    </div>
    
    {/* Additional under review badge for the entire hero section - removed to fix duplication */}
    {/* This was causing the duplication */}
    
    {/* Tier container - commented out now, but can be uncommented when needed */}
    {/* <div className="tier-container">
      {['30', '60', '90', '120', '150'].map((tier, index) => (
        <div 
          key={index} 
          className="tier-badge"
        >
          {tier}
        </div>
      ))}
      <div className="tier-badge tier-badge-active">
        180 traders
      </div>
    </div> */}
    
    {/* Disclaimer text - commented out now, but can be uncommented when needed */}
    {/* <p className="disclaimer-text">* Based on affiliates' average earnings</p> */}
  </div>
  
  {/* Footer disclaimer */}
  <div className="footer-disclaimer">
    <div className="footer-container">
      <p>Disclaimer: The availability and the terms of the Affiliate Program may vary depending on your country or region. Affiliates must ensure that they comply with all applicable laws.</p>
    </div>
  </div>
</section>
      {/* Why Join Us Section */}
      <section className="join-section">
      <div className="container">
        <h2 className="section-title">Why join us</h2>
        
        <div className="benefits-grid">
          {/* Card 1: Up to 50% commission */}
          <div className="benefit-card">
            <div className="benefit-content">
              <h3 className="benefit-title">
                Up to<br />
                50%<br />
                commission
              </h3>
              
              <div className="benefit-details">
                <p>Earn up to 50% commission in USDT when users sign up via your affiliate link and trade. Our competitive commission rates will help you maximize your earnings.</p>
              </div>
              
              {/* Placeholder for commission icon */}
              <div className="benefit-image-container commission-image">
                {/* Empty div where image will be added later */}
                <img src={JoinUseImg1} alt="commission-img" />
              </div>
            </div>
          </div>
          
          {/* Card 2: Industry-leading crypto products */}
          <div className="benefit-card">
            <div className="benefit-content">
              <h3 className="benefit-title">
                Industry-<br />
                leading<br />
                crypto<br />
                products
              </h3>
              
              <div className="benefit-details">
                <p>Promote popular and trusted crypto on OKX, one of the world's largest and most trusted crypto exchanges.</p>
              </div>
              
              {/* Placeholder for crypto products illustration */}
              <div className="benefit-image-container products-image">
                {/* Empty div where image will be added later */}
                <img src={JoinUseImg2} alt="join-img-2" />
              </div>
            </div>
          </div>
          
          {/* Card 3: Exclusive rewards */}
          <div className="benefit-card">
            <div className="benefit-content">
              <h3 className="benefit-title">
                Exclusive rewards
              </h3>
              
              <div className="benefit-details">
                <p>For your invitees, they can unlock exclusive new user bonus. For you, you can create custom campaigns for your community!</p>
              </div>
              
              {/* Placeholder for rewards bubbles */}
              <div className="benefit-image-container rewards-image">
                {/* Empty div where image will be added later */}
                <img src={JoinUseImg3} alt="join-img-3" />
              </div>
              
              <div className="badge-under-review">
                Under review
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* More Perks Section (Black Background) */}
      <section className="perks-section">
      <div className="container">
          <div className="section-header">
          <div className="section-marker"></div>
          <h2>More perks</h2>
          </div>
          
          <div className="perks-grid">
          <div className="perk-card">
              <h3>Dedicated 24/7 support</h3>
              <p>
              Anytime you have any issue, our experienced 1-on-1 account manager and customer support will be at your service.
              </p>
          </div>
          
          <div className="perk-card">
              <h3>Track performance</h3>
              <p>
              Keep track of detailed data about your referrals and earnings in real-time, so you can get first-hand data insights.
              </p>
          </div>
          
          <div className="perk-card">
              <h3>Partner with sub-affiliates</h3>
              <p>
              Build and manage your own team work with sub-affiliates to expand your network.
              </p>
          </div>
          
          <div className="perk-card">
              <h3>Instant messaging</h3>
              <p>
              You can chat with your affiliate manager on-one or in a group chat on OKX anytime.
              </p>
          </div>
          </div>
      </div>
      </section>

      {/* How It Works Section (White Background) */}
      <section className="how-section">
      <div className="container">
        <h2 className="section-title">How it works</h2>
        
        <div className="how-container">
          {/* Vertical breadcrumb positioned to the left */}
          <div className="breadcrumb-wrapper">
            <VerticalBreadcrumb 
              steps={steps} 
              activeStep={activeStep} 
              onStepClick={handleStepClick} 
            />
          </div>
          
          {/* Content area in the middle */}
          <div className="content-area">
            {steps.map((step) => (
              activeStep === step.number && (
                <div key={step.number} className="step-content active">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                  {step.hasUnderReviewBadge && (
                    <div className="badge-under-review">
                      Under review
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
          
          {/* Right side: Illustration container */}
          <div className="illustration-container">
            <div className={`step-illustration step-illustration-${activeStep}`}>
              {activeStepData && (
                <img 
                  src={activeStepData.illustration} 
                  alt={`Step ${activeStep}: ${activeStepData.title}`} 
                  className="step-illustration-image"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Trusted By Global Influencers Section (Black Background) */}
      <section className="trusted-section">
        <div className="container">
          <h2 className="section-title light">Trusted by global influencers</h2>
          
          <div className="stats-grid">
            <div className="stat-item">
              <p className="stat-number">15,000+</p>
              <p className="stat-label">Global crypto affiliates</p>
            </div>
            
            <div className="stat-item">
              <p className="stat-number">120+</p>
              <p className="stat-label">Countries/regions covered</p>
            </div>
            
            <div className="stat-item">
              <p className="stat-number">20,000+</p>
              <p className="stat-label">Average commission (USDT/month)</p>
            </div>
          </div>
          
          <div className="cta-box">
            <div className="cta-content">
              <h2 className="cta-heading">Join us<br />and start earning!</h2>
              <p className="cta-contact">Any questions? Contact us at affiliates@okx.com</p>
            </div>
            <div className="cta-button-wrapper">
              <button className="btn-under-review">
                Under review
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Affiliate;