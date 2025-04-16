import React, { useState } from 'react';

const LoginForm = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [email, setEmail] = useState('');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt with:', activeTab);
  };

  return (
    <div className="login-container">
      <h2>Log in</h2>
      
      <div className="login-tabs">
        <div 
          className={`tab ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => handleTabChange('email')}
        >
          Email / Sub-account
        </div>
        <div 
          className={`tab ${activeTab === 'qr' ? 'active' : ''}`}
          onClick={() => handleTabChange('qr')}
        >
          QR code
        </div>
      </div>
      
      {activeTab !== 'qr' ? (
        <form onSubmit={handleSubmit}>
          <div className="email-input">
            <div className="email-field">
              <input 
                type="email" 
                placeholder="Email address"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </div>
          </div>
          
          <button type="submit" className="next-btn">Next</button>
          
          <div className="signup-prompt">
            <p>Don't have an account? <a href="/signup">Sign up</a></p>
          </div>
          
          <div className="continue-text">
            <p>or continue with</p>
          </div>
          
          <div className="social-logins">
            <div className="social-btn">
              <div className="icon-circle">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
              </div>
              <span>Google</span>
            </div>
            <div className="social-btn">
              <div className="icon-circle">
                <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" />
              </div>
              <span>Apple</span>
            </div>
            <div className="social-btn">
              <div className="icon-circle">
                <img src="https://telegram.org/img/t_logo.svg" alt="Telegram" />
              </div>
              <span>Telegram</span>
            </div>
            <div className="social-btn">
              <div className="icon-circle">
                <img src="https://static.okx.com/cdn/assets/imgs/2210/620F94C9C684246B.png" alt="Wallet" />
              </div>
              <span>Wallet</span>
            </div>
          </div>
        </form>
      ) : (
        <div className="qr-code-container">
          <img src="/assets/login/qr-code.png" alt="Login QR Code" className="qr-code" />
          <p>Scan with the TradeX App to log in</p>
        </div>
      )}
      
      <div className="recaptcha-notice">
        <p>This site is protected by Google reCAPTCHA to ensure you're not a bot. <a href="#">Learn more</a></p>
      </div>
    </div>
  );
};

export default LoginForm; 