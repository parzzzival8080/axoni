import React, { useState } from 'react';
import './Referral.css';
import referralImage1 from '../../assets/referral/0DEDDD03AB730CD5.webp';
import referralImage2 from '../../assets/referral/D664C8EB85A43D97.webp';
import referralImage3 from '../../assets/referral/F5935075AB7CA066.webp';
import inviteImage from '../../assets/referral/invite.webp';

const Referral = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const referralLink = "https://www.okx.com/join/12345";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqItems = [
    {
      question: "What is the referral reward?",
      answer: "When you refer friends to our platform, you can earn up to 10 USDT for each friend who signs up and completes the required actions."
    },
    {
      question: "How do I share my referral code/link?",
      answer: "You can share your unique referral link via social media, email, or messaging apps. Simply copy the link provided on this page and share it with your friends."
    },
    {
      question: "What must I do to be eligible for rewards?",
      answer: "To be eligible for referral rewards, you must have a verified account and your referred friends must sign up using your referral link and complete the required actions."
    },
    {
      question: "Why haven't I received my reward?",
      answer: "Rewards are typically processed within 24-48 hours after your friend completes the required actions. If you haven't received your reward after this time, please contact our support team."
    },
    {
      question: "What is the time frame for my friends to complete the requirements to earn the reward?",
      answer: "Your friends have 30 days from the time they sign up using your referral link to complete the required actions for you to earn the reward."
    },
    {
      question: "Is there a limit?",
      answer: "There is no limit to how many friends you can refer, but there may be a maximum amount of rewards you can earn per month. Please check our terms and conditions for more details."
    }
  ];

  return (
    <main className="referral-main">
      {/* Hero Section */}
      <div className="referral-hero">
        <div className="container">
          <h1>Earn up to <span className="highlight">10 USDT</span> for each friend you invite</h1>
          <div className="referral-status">SPONSORED</div>
          <div className="referral-code-box">
            <input type="text" value={referralLink} readOnly />
            <button onClick={copyToClipboard}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div className="how-it-works">
        <div className="container">
          <div className="time-limit">
            <p>Your friends have until 12:00 PM on Apr 30 to</p>
          </div>
          
          <div className="steps-container">
            <div className="step">
              <img src={referralImage1} alt="Sign up" />
              <h3>Sign up</h3>
              <p>Easy access to crypto with a few clicks on your mobile or web</p>
            </div>
            
            <div className="step">
              <img src={referralImage2} alt="Get verified" />
              <h3>Get verified</h3>
              <p>We have simplified KYC to make it faster than ever before</p>
            </div>
            
            <div className="step">
              <img src={referralImage3} alt="Deposit" />
              <h3>Deposit</h3>
              <p>The fastest crypto deposit experience available on mobile</p>
            </div>
          </div>
          
          <div className="reward-summary">
            <p>That's it – you'll get up to <span className="highlight">10 USDT</span> worth of BTC.</p>
            <p className="terms">Learn more about the <a href="#">referral terms</a></p>
          </div>
        </div>
      </div>
      
      {/* Invites Section */}
      <div className="invites-section">
        <div className="container">
          <h2>Your invites</h2>
          
          <div className="invites-card">
            <h3>You've earned</h3>
            <div className="amount">0 USDT</div>
            
            <div className="tabs">
              <button 
                className={activeTab === 'all' ? 'active' : ''} 
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
              <button 
                className={activeTab === 'pending' ? 'active' : ''} 
                onClick={() => setActiveTab('pending')}
              >
                Pending
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Illustration Section */}
      <div className="illustration-section">
        <div className="container">
          <div className="illustration">
            <img src={inviteImage} alt="Invite friends" className="invite-image" />
          </div>
          <div className="illustration-text">
            <p>Together, let's make crypto real, and</p>
            <p>enjoy the rewards.</p>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="faq-section">
        <div className="container">
          <h2>Questions? We've got answers.</h2>
          
          <div className="faq-list">
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className={`faq-item ${expandedFaq === index ? 'expanded' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question">
                  <h3>{item.question}</h3>
                  <span className="toggle-icon">
                    {expandedFaq === index ? '-' : '+'}
                  </span>
                </div>
                {expandedFaq === index && (
                  <div className="faq-answer">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Referral;
