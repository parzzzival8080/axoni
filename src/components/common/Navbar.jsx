import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {QRCodeSVG} from 'qrcode.react';
import './Navbar.css';

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);

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

  // User menu style
  const userMenuStyle = {
    backgroundColor: 'black',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '20px',
    padding: '5px 15px',
    fontSize: '14px',
    color: 'white',
    textDecoration: 'none',
    marginRight: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  };

  // Check for authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const fullName = localStorage.getItem('fullName');
      const userId = localStorage.getItem('user_id');
      
      if (token) {
        setIsAuthenticated(true);
        
        if (fullName) {
          setUserName(fullName);
        } else if (userId) {
          // If we have a userId but no name, fetch the user information
          try {
            const response = await axios.get(
              `https://django.bhtokens.com/api/user_account/getUserInformation/?user_id=${userId}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              }
            );
            
            if (response.data && response.data.user && response.data.user.name) {
              const name = response.data.user.name;
              setUserName(name);
              localStorage.setItem('fullName', name);
              
              // Check if there's a uid in the response and store it
              if (response.data.user.uid) {
                localStorage.setItem('uid', response.data.user.uid);
                console.log('Stored uid from user info:', response.data.user.uid);
              }
            } else {
              setUserName('User');
            }
          } catch (error) {
            console.error('Error fetching user information:', error);
            setUserName('User');
          }
        } else {
          setUserName('User');
        }
      }
    };
    
    checkAuth();
  }, []);

  const handleLogout = () => {
    // Clear auth data from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user_id');
    localStorage.removeItem('fullName');
    localStorage.removeItem('user');
    
    // Update state
    setIsAuthenticated(false);
    setUserName('');
    setShowUserMenu(false);
    
    // Redirect to home
    window.location.href = '/';
  };
  const appDownloadUrl = "https://download.tradex.com/android/tradex-v2.1.4.apk";
  // ReactDOM.render(
  //   <QRCodeSVG value={appDownloadUrl}/>,
  //   document.getElementById('mountNode')
  // );

 

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
              <div className='dropdown-menu'>
                <Link to="/market" className="dropdown-link">
                  <div className="dropdown-item with-arrow">
                      <div className="dropdown-icon">
                        <i className="fas fa-coins"></i>
                      </div>
                      <div className="dropdown-content">
                        <h3>Markets</h3>
                        <p>View the latest crypto prices, volume, and data</p>
                      </div>
                      <i className="fas fa-chevron-right"></i>
                  </div>
                </Link>
                
                <div className="dropdown-item with-arrow">
                    <div className="dropdown-icon">
                      <i className="fas fa-coins"></i>
                    </div>
                    <div className="dropdown-content">
                      <h3>Opportunities</h3>
                      <p>Discover hot and new crypto</p>
                    </div>
                    <i className="fas fa-chevron-right"></i>
                </div>
                <div className="dropdown-item with-arrow">
                    <div className="dropdown-icon">
                      <i className="fas fa-coins"/>
                    </div>
                    <div className="dropdown-content">
                      <h3>Marketplace</h3>
                      <p>Reap high returns with a community of top traders</p>
                    </div>
                    <i className="fas fa-chevron-right"/>
                </div>
                
              </div>
            </div>
          <div className="nav-item">
            Trade <i className="fas fa-chevron-down"/>
            <div className="dropdown-menu">
              <h2>Trading instruments</h2>

              <Link to="/conversion" className="dropdown-link">
                <div className="dropdown-item with-arrow" style={{position: 'relative'}}>
                  <div className="dropdown-icon">
                    <i className="fas fa-sync-alt"></i>
                  </div>
                  <div className="dropdown-content">
                    <h3>Convert</h3>
                    <p>Quick conversion, zero trading fees, no slippage</p>
                  </div>
                  <i className="fas fa-chevron-right" style={{position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)'}}></i>
                </div>
              </Link>
              
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
            <div className='dropdown-menu'>
              <div className="dropdown-section">
                <Link to='/earn' className='dropdown-link'>
                  <div className="dropdown-item main-item with-arrow">
                    <div className="dropdown-icon">
                      <i className="fas fa-coins"></i>
                    </div>
                    <div className="dropdown-content">
                      <h3>Earn</h3>
                      <p>Don't just HODL. Earn</p>
                    </div>
                    <i className="fas fa-chevron-right"></i>
                </div>
                </Link>
               
                
                {/* Sub-items for Earn */}
                <div className="dropdown-sub-items">
                  <Link to="/earn/simple" className="dropdown-link">
                    <div className="dropdown-sub-item">
                      <div className="dropdown-icon-small">
                        <i className="fas fa-circle"></i>
                      </div>
                      <span>Simple Earn</span>
                    </div>
                  </Link>
                  
                  <Link to="/earn/on-chain" className="dropdown-link">
                    <div className="dropdown-sub-item">
                      <div className="dropdown-icon-small">
                        <i className="fas fa-circle"></i>
                      </div>
                      <span>On-chain Earn</span>
                    </div>
                  </Link>
                  
                  <Link to="/earn/structured" className="dropdown-link">
                    <div className="dropdown-sub-item">
                      <div className="dropdown-icon-small">
                        <i className="fas fa-circle"></i>
                      </div>
                      <span>Structured Products</span>
                    </div>
                  </Link>
                </div>
              </div>
              
              <Link to="/loan" className="dropdown-link">
                <div className="dropdown-item with-arrow">
                  <div className="dropdown-icon">
                    <i className="fas fa-coins"></i>
                  </div>
                  <div className="dropdown-content">
                    <h3>Loan</h3>
                    <p>Borrow to earn, borrow to spend</p>
                  </div>
                  <i className="fas fa-chevron-right"></i>
                </div>
              </Link>
              
              <Link to="/jumpstart" className="dropdown-link">
                <div className="dropdown-item with-arrow">
                  <div className="dropdown-icon">
                    <i className="fas fa-coins"></i>
                  </div>
                  <div className="dropdown-content">
                    <h3>Jumpstart</h3>
                    <p>Discover new, high-quality projects around the world</p>
                  </div>
                  <i className="fas fa-chevron-right"></i>
                </div>
              </Link>
            </div>

        </div>
          <div className="nav-item">
            Build <i className="fas fa-chevron-down"></i>
          </div>
          <div className="nav-item">
            Institutional <i className="fas fa-chevron-down"></i>
          </div>
          <div className="nav-item">Learn</div>
          <div 
            className="nav-item"
            onMouseEnter={() => setShowMoreDropdown(true)}
            onMouseLeave={() => setShowMoreDropdown(false)}
            style={{position: 'relative'}}
          >
            More <i className="fas fa-chevron-down"></i>
            {showMoreDropdown && (
              <div 
                className="dropdown-menu more-dropdown-menu" 
                style={{width: '480px', display: 'flex', padding: '32px 40px', gap: '48px', position: 'absolute', left: 0, top: '100%'}}
                onMouseEnter={() => setShowMoreDropdown(true)}
                onMouseLeave={() => setShowMoreDropdown(false)}
              >
                {/* Left Column: Products */}
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 600, color: '#777', fontSize: '13px', marginBottom: '18px'}}>Products</div>
                  <Link to="/okb" className="dropdown-link">
                    <div className="dropdown-item" style={{gap: '12px'}}>
                      <i className="fas fa-coins"></i> OKB
                    </div>
                  </Link>
                  <Link to="/security-of-funds" className="dropdown-link">
                    <div className="dropdown-item" style={{gap: '12px'}}>
                      <i className="fas fa-shield-alt"></i> Security of funds
                    </div>
                  </Link>
                  <Link to="/status" className="dropdown-link">
                    <div className="dropdown-item" style={{gap: '12px'}}>
                      <i className="fas fa-chart-bar"></i> Status
                    </div>
                  </Link>
                  <Link to="/proof-of-reserves" className="dropdown-link">
                    <div className="dropdown-item" style={{gap: '12px'}}>
                      <i className="fas fa-file-invoice-dollar"></i> Proof of Reserves
                    </div>
                  </Link>
                  <Link to="/okx-protect" className="dropdown-link">
                    <div className="dropdown-item" style={{gap: '12px'}}>
                      <i className="fas fa-user-shield"></i> OKX Protect
                    </div>
                  </Link>
                </div>
                {/* Right Column: Others */}
                <div style={{flex: 1}}>
                  <div style={{fontWeight: 600, color: '#777', fontSize: '13px', marginBottom: '18px'}}>Others</div>
                  <Link to="/pages/morePages/CampaignCenter" className="dropdown-link">
                    <div className="dropdown-item" style={{gap: '12px'}}>
                      <i className="fas fa-bullhorn"></i> Campaign center
                    </div>
                  </Link>
                  <Link to="/pages/morePages/MyRewards" className="dropdown-link">
                    <div className="dropdown-item" style={{gap: '12px'}}>
                      <i className="fas fa-gift"></i> My rewards
                    </div>
                  </Link>
                  <Link to="/pages/morePages/Referral" className="dropdown-link">
                    <div className="dropdown-item" style={{gap: '12px'}}>
                      <i className="fas fa-user-friends"></i> Referral
                    </div>
                  </Link>
                  <Link to="/coming-soon" className="dropdown-link">
                    <div className="dropdown-item" style={{gap: '12px'}}>
                      <i className="fas fa-handshake"></i> Affiliates
                    </div>
                  </Link>
                  <Link to="/okx-ventures" className="dropdown-link">
                    <div className="dropdown-item" style={{gap: '12px'}}>
                      <i className="fas fa-rocket"></i> OKX Ventures
                    </div>
                  </Link>
                  <Link to="/trade-on-tradingview" className="dropdown-link">
                    <div className="dropdown-item" style={{gap: '12px'}}>
                      <i className="fas fa-chart-line"></i> Trade on TradingView
                    </div>
                  </Link>
                  <Link to="/listing-application" className="dropdown-link">
                    <div className="dropdown-item" style={{gap: '12px'}}>
                      <i className="fas fa-list-alt"></i> Listing application
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
      <div className="header-right">
        <div className="search-box">
          <div className='search-icon'>
             <i className="fas fa-search"></i>
          </div>
          <input className='search-input' type="text" placeholder="Search crypto" />
        </div>
        
        {isAuthenticated ? (
          <div className="user-menu-container">
            <div 
              style={userMenuStyle} 
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <i className="fas fa-user-circle"></i>
              Welcome, {userName}
              <i className="fas fa-chevron-down"></i>
            </div>
            {showUserMenu && (
              <div className="user-dropdown-menu">
                <Link to="/account/profile" className="user-menu-item">
                  <i className="fas fa-user"></i> Profile
                </Link>
                <Link to="/Assets" className="user-menu-item">
                  <i className="fas fa-wallet"></i> Assets
                </Link>
                <Link to="/settings" className="user-menu-item">
                  <i className="fas fa-cog"></i> Settings
                </Link>
                <div className="user-menu-divider"></div>
                <div className="user-menu-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Logout
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="login-link">Log in</Link>
            <Link to="/signup" style={signupButtonStyle}>Sign up</Link>
          </>
        )}
        
          <div className="icon-group">
          {/* Download App Icon with QR code dropdown */}
          <div className="right-nav-item">
            <button 
              className="icon-link" 
              type="button" 
              aria-label="Download app" 
              style={{background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer'}}
            >
              <i className="fas fa-download"></i>
            </button>
            
            <div className="right-dropdown-menu download-menu">
              <h3 className="dropdown-title">Download app</h3>
              <div className="qr-code-container">
                {/* QR Code implementation */}
                <QRCodeSVG 
                    value={appDownloadUrl}
                    size={120}
                    level={"H"}
                    includeMargin={true}
                    className="qr-code-image"
                  />
              </div>
              <div className='download-qr-code-container'>
                <button className="dropdown-button">More options</button>
                <p className="dropdown-subtitle">For mobile and desktop</p>
              </div>
            </div>
          </div>
          
          {/* Notifications Icon with announcements dropdown */}
          <div className="right-nav-item">
            <button 
              className="icon-link" 
              type="button" 
              aria-label="Notifications" 
              style={{background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer'}}
            >
              <i className="fas fa-bell"></i>
            </button>
            
            <div className="right-dropdown-menu notifications-menu">
              <div className="notification-item">
                <h4 className="notification-title">TradeX to list perpetual futures for SIGN crypto</h4>
                <p className="notification-time">04/28/2025, 14:00:00</p>
              </div>
              
              <div className="notification-item">
                <h4 className="notification-title">TradeX to delist ZKJ margin trading pair and perpetual future</h4>
                <p className="notification-time">04/28/2025, 11:10:00</p>
              </div>
              
              <div className="notification-item">
                <h4 className="notification-title">TradeX to enable margin trading and Simple Earn for LAYER crypto</h4>
                <p className="notification-time">04/25/2025, 19:20:00</p>
              </div>
              
              <div className="notification-item">
                <h4 className="notification-title">TradeX to list LAYER (Solayer) for spot trading</h4>
                <p className="notification-time">04/25/2025, 14:00:00</p>
              </div>
              
              <div className="notification-item">
                <h4 className="notification-title">TradeX to list perpetual futures for INIT crypto</h4>
                <p className="notification-time">04/24/2025, 14:00:00</p>
              </div>
              
              <Link to="/announcements" className="more-link">
                More announcements
              </Link>
            </div>
          </div>
          
          {/* Help Icon with support dropdown */}
          <div className="right-nav-item">
            <button 
              className="icon-link" 
              type="button" 
              aria-label="Help" 
              style={{background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer'}}
            >
              <i className="fas fa-question-circle"></i>
            </button>
            
            <div className="right-dropdown-menu help-menu">
              <Link to="/support" className="dropdown-menu-item">
                Support center
              </Link>
              <Link to="/tickets" className="dropdown-menu-item">
                My tickets
              </Link>
              <Link to="/connect" className="dropdown-menu-item">
                Connect with TradeX
              </Link>
            </div>
          </div>
          
          {/* Language Icon */}
          {/* <div className="right-nav-item">
            <button 
              className="icon-link" 
              type="button" 
              aria-label="Language" 
              style={{background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer'}}
            >
              <i className="fas fa-globe"></i>
            </button>
            
            <div className="right-dropdown-menu language-menu">
              <div className="dropdown-menu-item">English</div>
              <div className="dropdown-menu-item">Español</div>
              <div className="dropdown-menu-item">Français</div>
              <div className="dropdown-menu-item">Deutsch</div>
              <div className="dropdown-menu-item">中文</div>
              <div className="dropdown-menu-item">日本語</div>
              <div className="dropdown-menu-item">한국어</div>
            </div>
          </div> */}
        </div>
      </div>
    </header>
  );
};

export default Navbar; 