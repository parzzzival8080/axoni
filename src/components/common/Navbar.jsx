import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';
import MoreDropdown from './MoreDropdown';

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
          <div
            className="nav-item"
            onMouseEnter={() => setShowMoreDropdown(true)}
            onMouseLeave={() => setShowMoreDropdown(false)}
            style={{ position: 'relative' }}
          >
            More <i className="fas fa-chevron-down"></i>
            <MoreDropdown visible={showMoreDropdown} />
          </div>
        </nav>
      </div>
      <div className="header-right">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Search crypto" />
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
                <Link to="/profile" className="user-menu-item">
                  <i className="fas fa-user"></i> Profile
                </Link>
                <Link to="/wallet" className="user-menu-item">
                  <i className="fas fa-wallet"></i> Wallet
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