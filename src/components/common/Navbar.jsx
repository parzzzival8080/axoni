import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const signupButtonStyle = {
    backgroundColor: 'black',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '20px',
    padding: '5px 15px',
    fontSize: '14px',
    color: 'white',
    textDecoration: 'none',
    marginRight: '16px',
    fontWeight: '500'
  };

  return (
    <header>
      <div className="header-left">
        <Link to="/" className="logo">
          <img src="/assets/logo/tradex-icon.png" alt="Logo" />
        </Link>
        <nav>
          <div className="nav-item">
            crypto <i className="fas fa-chevron-down"></i>
          </div>
          <div className="nav-item">
            Discover <i className="fas fa-chevron-down"></i>
          </div>
          <div className="nav-item">
            Trade <i className="fas fa-chevron-down"></i>
            <div className="dropdown-menu">
              <h2>Trading instruments</h2>
              
              <div className="dropdown-item">
                <div className="dropdown-icon">
                  <i className="fas fa-sync-alt"></i>
                </div>
                <div className="dropdown-content">
                  <h3>Convert</h3>
                  <p>Quick conversion, zero trading fees, no slippage</p>
                </div>
              </div>
              
              <Link to="/spot-trading" className="dropdown-link">
                <div className="dropdown-item with-arrow">
                  <div className="dropdown-icon">
                    <i className="fas fa-coins"></i>
                  </div>
                  <div className="dropdown-content">
                    <h3>Spot</h3>
                    <p>Buy and sell crypto with ease</p>
                  </div>
                  <i className="fas fa-chevron-right"></i>
                </div>
              </Link>
              
              <Link to="/future-trading" className="dropdown-link">
                <div className="dropdown-item with-arrow">
                  <div className="dropdown-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="dropdown-content">
                    <h3>Futures</h3>
                    <p>Trade perpetual and expiry futures with leverage</p>
                  </div>
                  <i className="fas fa-chevron-right"></i>
                </div>
              </Link>
              
              <div className="dropdown-item with-arrow">
                <div className="dropdown-icon">
                  <i className="fas fa-layer-group"></i>
                </div>
                <div className="dropdown-content">
                  <h3>Options</h3>
                  <p>Capitalize on market volatility with options</p>
                </div>
                <i className="fas fa-chevron-right"></i>
              </div>
              
              <div className="dropdown-item with-arrow">
                <div className="dropdown-icon">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div className="dropdown-content">
                  <h3>Pre-market Futures</h3>
                  <p>Get early access and trade upcoming crypto</p>
                </div>
                <i className="fas fa-chevron-right"></i>
              </div>
              
              <h2>Powerful tools</h2>
              
              <div className="dropdown-item with-arrow">
                <div className="dropdown-icon">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="dropdown-content">
                  <h3>Trading bots</h3>
                  <p>Multiple strategies to help you trade with ease</p>
                </div>
                <i className="fas fa-chevron-right"></i>
              </div>
              
              <div className="dropdown-item with-arrow">
                <div className="dropdown-icon">
                  <i className="fas fa-store"></i>
                </div>
                <div className="dropdown-content">
                  <h3>Marketplace</h3>
                  <p>Reap high returns with a community of top traders</p>
                </div>
                <i className="fas fa-chevron-right"></i>
              </div>
              
              <div className="dropdown-item">
                <div className="dropdown-icon">
                  <i className="fas fa-bolt"></i>
                </div>
                <div className="dropdown-content">
                  <h3>Nitro Spreads</h3>
                  <p>Deep liquidity for futures spreads</p>
                </div>
              </div>
              
              <div className="dropdown-item">
                <div className="dropdown-icon">
                  <i className="fas fa-sliders-h"></i>
                </div>
                <div className="dropdown-content">
                  <h3>RFQ</h3>
                  <p>Custom multi-leg strategies and block trades</p>
                </div>
              </div>
            </div>
          </div>
          <div className="nav-item">
            Grow <i className="fas fa-chevron-down"></i>
        </div>
          <div className="nav-item">
            Build <i className="fas fa-chevron-down"></i>
          </div>
          <div className="nav-item">
            Institutional <i className="fas fa-chevron-down"></i>
          </div>
          <div className="nav-item">Learn</div>
          <div className="nav-item">
            More <i className="fas fa-chevron-down"></i>
          </div>
        </nav>
      </div>
      <div className="header-right">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Search crypto" />
        </div>
        <Link to="/login" className="login-link">Log in</Link>
        <Link to="/signup" style={signupButtonStyle}>Sign up</Link>
        <div className="icon-group">
          <a href="#" className="icon-link"><i className="fas fa-download"></i></a>
          <a href="#" className="icon-link"><i className="fas fa-bell"></i></a>
          <a href="#" className="icon-link"><i className="fas fa-question-circle"></i></a>
          <a href="#" className="icon-link"><i className="fas fa-globe"></i></a>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 