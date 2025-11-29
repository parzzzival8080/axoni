import React from 'react';

const LoginLeftPanel = () => {
  return (
    <div className="left-section">
      <div className="content">
        <h1>Trade with confidence</h1>
        <p>Your funds are always backed 1:1 on AXONI with our regularly published audits on our Proof of Reserves</p>
        
        <div className="chart-container">
          <img src="/assets/login/login.png" alt="BTC/USDT Chart" className="chart-img" />
        </div>
        
        <div className="telegram-box">
          <h3>Join our Telegram group</h3>
          <p>Ask questions, get answers, and chat with other traders to shape the crypto future together</p>
        </div>
      </div>
    </div>
  );
};

export default LoginLeftPanel; 
