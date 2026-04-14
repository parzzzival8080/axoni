import React from 'react';

const LoginLeftPanel = () => {
  return (
    <div className="left-section">
      <div className="content">
        <h1>Trade with confidence</h1>
        <p>Your funds are always backed 1:1 on GLD with our regularly published audits on our Proof of Reserves</p>

        <div className="chart-container" style={{ background: '#121212', borderRadius: 16, padding: '32px 24px', border: '1px solid #1E1E1E' }}>
          {/* Trading illustration */}
          <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto' }}>
            {/* Grid lines */}
            <line x1="40" y1="20" x2="40" y2="180" stroke="#1E1E1E" strokeWidth="1" />
            <line x1="40" y1="180" x2="380" y2="180" stroke="#1E1E1E" strokeWidth="1" />
            <line x1="40" y1="60" x2="380" y2="60" stroke="#1E1E1E" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="40" y1="100" x2="380" y2="100" stroke="#1E1E1E" strokeWidth="0.5" strokeDasharray="4 4" />
            <line x1="40" y1="140" x2="380" y2="140" stroke="#1E1E1E" strokeWidth="0.5" strokeDasharray="4 4" />

            {/* Candlesticks */}
            {/* Green candles */}
            <rect x="55" y="110" width="8" height="40" rx="1" fill="#2EBD85" opacity="0.8" />
            <line x1="59" y1="100" x2="59" y2="155" stroke="#2EBD85" strokeWidth="1.5" />

            <rect x="80" y="90" width="8" height="35" rx="1" fill="#2EBD85" opacity="0.8" />
            <line x1="84" y1="80" x2="84" y2="130" stroke="#2EBD85" strokeWidth="1.5" />

            {/* Red candle */}
            <rect x="105" y="85" width="8" height="30" rx="1" fill="#F6465D" opacity="0.8" />
            <line x1="109" y1="75" x2="109" y2="120" stroke="#F6465D" strokeWidth="1.5" />

            <rect x="130" y="95" width="8" height="25" rx="1" fill="#F6465D" opacity="0.8" />
            <line x1="134" y1="85" x2="134" y2="125" stroke="#F6465D" strokeWidth="1.5" />

            {/* Green candles - uptrend */}
            <rect x="155" y="80" width="8" height="30" rx="1" fill="#2EBD85" opacity="0.8" />
            <line x1="159" y1="70" x2="159" y2="115" stroke="#2EBD85" strokeWidth="1.5" />

            <rect x="180" y="65" width="8" height="35" rx="1" fill="#2EBD85" opacity="0.8" />
            <line x1="184" y1="55" x2="184" y2="105" stroke="#2EBD85" strokeWidth="1.5" />

            <rect x="205" y="55" width="8" height="25" rx="1" fill="#2EBD85" opacity="0.8" />
            <line x1="209" y1="45" x2="209" y2="85" stroke="#2EBD85" strokeWidth="1.5" />

            {/* Red dip */}
            <rect x="230" y="60" width="8" height="20" rx="1" fill="#F6465D" opacity="0.8" />
            <line x1="234" y1="50" x2="234" y2="85" stroke="#F6465D" strokeWidth="1.5" />

            {/* Recovery */}
            <rect x="255" y="50" width="8" height="25" rx="1" fill="#2EBD85" opacity="0.8" />
            <line x1="259" y1="40" x2="259" y2="80" stroke="#2EBD85" strokeWidth="1.5" />

            <rect x="280" y="40" width="8" height="30" rx="1" fill="#2EBD85" opacity="0.8" />
            <line x1="284" y1="30" x2="284" y2="75" stroke="#2EBD85" strokeWidth="1.5" />

            <rect x="305" y="35" width="8" height="25" rx="1" fill="#2EBD85" opacity="0.8" />
            <line x1="309" y1="25" x2="309" y2="65" stroke="#2EBD85" strokeWidth="1.5" />

            <rect x="330" y="30" width="8" height="20" rx="1" fill="#2EBD85" opacity="0.9" />
            <line x1="334" y1="22" x2="334" y2="55" stroke="#2EBD85" strokeWidth="1.5" />

            <rect x="355" y="25" width="8" height="22" rx="1" fill="#2EBD85" opacity="0.9" />
            <line x1="359" y1="18" x2="359" y2="52" stroke="#2EBD85" strokeWidth="1.5" />

            {/* Moving average line */}
            <path d="M 59 130 Q 109 105 159 90 Q 209 65 259 55 Q 309 40 359 30" stroke="#2EBD85" strokeWidth="2" fill="none" opacity="0.4" />

            {/* Glow under the line */}
            <path d="M 59 130 Q 109 105 159 90 Q 209 65 259 55 Q 309 40 359 30 L 359 180 L 59 180 Z" fill="url(#greenGradient)" opacity="0.15" />

            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2EBD85" />
                <stop offset="100%" stopColor="#2EBD85" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Price label */}
            <rect x="340" y="12" width="50" height="18" rx="4" fill="#2EBD85" opacity="0.2" />
            <text x="365" y="24" textAnchor="middle" fill="#2EBD85" fontSize="9" fontFamily="monospace" fontWeight="600">+12.4%</text>
          </svg>

          {/* Stats row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid #1E1E1E' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#2EBD85' }}>50+</div>
              <div style={{ fontSize: 10, color: '#5E6673', marginTop: 2 }}>Trading Pairs</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>&lt;10ms</div>
              <div style={{ fontSize: 10, color: '#5E6673', marginTop: 2 }}>Execution</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>0.1%</div>
              <div style={{ fontSize: 10, color: '#5E6673', marginTop: 2 }}>Trading Fee</div>
            </div>
          </div>
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
