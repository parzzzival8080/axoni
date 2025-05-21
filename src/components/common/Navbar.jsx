import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {QRCodeSVG} from 'qrcode.react';
import './Navbar.css';
import { fetchAllCoins } from '../../services/spotTradingApi';
import defaultCoinLogo from '../../assets/coin/bitcoin-2136339_640.webp';
import ComingSoon from '../../components/common/ComingSoon';
import LanguageModal from './LanguageModal';

// Notification data
const notifications = [
  {
    id: 1,
    title: "TradeX to list perpetual futures for SIGN crypto",
    time: "04/28/2025, 14:00:00",
    path: "/help/tradex-to-list-perpetual-futures-for-sign-crypto"
  },
  {
    id: 2,
    title: "TradeX to delist ZKJ margin trading pair and perpetual future",
    time: "04/28/2025, 11:10:00",
    path: "/help/tradex-to-delist-zkj-margin-trading-pair-and-perpetual-future"
  },
  {
    id: 3,
    title: "TradeX to enable margin trading and Simple Earn for LAYER crypto",
    time: "04/25/2025, 19:20:00",
    path: "/help/tradex-to-enable-margin-trading-and-simple-earn-for-layer-crypto"
  },
  {
    id: 4,
    title: "TradeX to list LAYER (Solayer) for spot trading",
    time: "04/25/2025, 14:00:00",
    path: "/help/tradex-to-list-layer-solayer-for-spot-trading"
  },
  {
    id: 5,
    title: "TradeX to list perpetual futures for INIT crypto",
    time: "04/24/2025, 14:00:00",
    path: "/help/tradex-to-list-perpetual-futures-for-init-crypto"
  }
];

// Mobile menu items
const mobileMenuItems = [
  { 
    name: 'Buy crypto', 
    hasDropdown: true,
    subItems: [
      { name: 'P2P trading', path: '/p2p-trading' },
    ]
  },
  { 
    name: 'Discover', 
    hasDropdown: true,
    subItems: [
      { name: 'Markets', path: '/market' },
      { name: 'Opportunities', path: '/opportunities' },
      { name: 'Marketplace', path: '/marketplace' },
    ]
  },
  { 
    name: 'Trade', 
    hasDropdown: true,
    subItems: [
      { name: 'Convert', path: '/conversion' },
      { name: 'Spot', path: '/spot-trading' },
      { name: 'Future', path: '/future-trading' },
      { name: 'Options', path: '/options' },
      { name: 'Pre-markets Futures', path: '/pre-market-futures'},
      { name: 'Trading bots', path: '/trading-bots'},
      { name: 'Marketplace', path: '/marketplace' },
      { name: 'Nitro Spreads', path: '/nitro-spreads' },
      { name: 'RFQ', path: '/rfq' },
      { name: 'Demo trading', path: '/demo-trading' },
    ]
  },
  { 
    name: 'Grow', 
    hasDropdown: true,
    subItems: [
      { name: 'Earn', path: '/earn' },
      { name: 'Loan', path: '/loan' },
      { name: 'Jumpstart', path: '/jumpstart' }
    ]
  },
  { 
    name: 'Build', 
    hasDropdown: true,
    subItems: [
      { name: 'X Layer network', path: '/earn' },
    ]
  },
  { 
    name: 'Institutional', 
    hasDropdown: true,
    subItems: [
      { name: 'Institutional home', path: '/institutional/home' },
      { name: 'Liquid Marketplace', path: '/institutional/marketplace' },
      { name: 'APIs', path: '/institutional/apis' },
      { name: 'Broker Program', path: '/institutional/broker-program' },
      { name: 'Managed Trading Sub-accounts', path: '/institutional/trading-sub-accounts' },
      { name: 'Historical market data', path: '/institutional/market-data' },
    ]
  },
  { name: 'Learn', path: '/learn', hasDropdown: false },
  { 
    name: 'More', 
    hasDropdown: true,
    subItems: [
      { name: 'OKB', path: '/okb' },
      { name: 'Security of funds', path: '/security-of-funds' },
      { name: 'Status', path: '/status' },
      { name: 'Proof of Reserves', path: '/proof-of-reserves'},
      { name: 'TradeX Protect', path: '/tradex-protect' },
      { name: 'Web3', path: '/web3' },
      { name: 'Campaign center', path: '/campaign-center' },
      { name: 'My rewards', path: '/my-rewards' },
      { name: 'Referral', path: '/referral' },
      { name: 'Affiliates', path: '/affiliates' },
      { name: 'TradeX Ventures', path: '/tradex-ventures' },
      { name: 'Trade on TradingView', path: '/trade-on-tradingview' },
      { name: 'Listing application', path: '/listing-application' },
    ]
  },
  { 
    name: 'Support', 
    hasDropdown: true,
    subItems: [
      { name: 'Support center', path: '/support-center' },
      { name: 'My tickets', path: '/my-tickets' },
      { name: 'Connect with TradeX', path: '/connect-with-tradex' },
    ]
  },
  ];

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showAssetsMenu, setShowAssetsMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState([]);
  const [coins, setCoins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('spot');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
              
              if (response.data.user.uid) {
                localStorage.setItem('uid', response.data.user.uid);
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

  // Load coins for search dropdown
  useEffect(() => {
    const loadCoins = async () => {
      setIsLoading(true);
      const result = await fetchAllCoins();
      if (result.success) {
        setCoins(result.coins);
      }
      setIsLoading(false);
    };
    
    loadCoins();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [searchRef]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user_id');
    localStorage.removeItem('fullName');
    localStorage.removeItem('user');
    
    setIsAuthenticated(false);
    setUserName('');
    setShowUserMenu(false);
    
    window.location.href = '/';
  };

  const appDownloadUrl = "https://download.tradex.com/android/tradex-v2.1.4.apk";
  
  const openComingSoon = () => setIsComingSoonOpen(true);
  const closeComingSoon = () => setIsComingSoonOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  
  const toggleSubmenu = (index) => {
    if (expandedMenus.includes(index)) {
      setExpandedMenus(expandedMenus.filter(item => item !== index));
    } else {
      setExpandedMenus([...expandedMenus, index]);
    }
  };

  // Handle coin selection
  const handleCoinSelect = (coin) => {
    setIsSearchFocused(false);
    setSearchTerm('');
    
    if (activeTab === 'futures') {
      navigate(`/future-trading?coin_pair_id=${coin.coin_pair}`);
    } else {
      navigate(`/spot-trading?coin_pair_id=${coin.coin_pair}`);
    }
  };

  // Filter coins based on search term and active tab
  const filteredCoins = coins.filter(coin => {
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      return (
        coin.symbol?.toLowerCase().includes(searchLower) ||
        coin.name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  }).slice(0, 20);

  const testResults = searchTerm.trim() && filteredCoins.length === 0 ? [
    { coin_pair: '1', symbol: 'BTC', name: 'Bitcoin', price: '64000', price_change_24h: 2.5, pair_name: 'USDT' },
    { coin_pair: '3', symbol: 'ETH', name: 'Ethereum', price: '3200', price_change_24h: -1.2, pair_name: 'USDT' },
    { coin_pair: '15', symbol: 'SOL', name: 'Solana', price: '150', price_change_24h: 5.8, pair_name: 'USDT' }
  ] : [];
  
  const displayResults = filteredCoins.length > 0 ? filteredCoins : testResults;

  // Function to toggle mobile search
  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    if (!isMobileSearchOpen) {
      // When opening, focus the search input after a brief delay to allow animation
      setTimeout(() => {
        const searchInput = document.getElementById('mobile-search-input');
        if (searchInput) searchInput.focus();
      }, 100);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Clear search input
  const clearSearch = () => {
    setSearchTerm('');
    const searchInput = document.getElementById('mobile-search-input');
    if (searchInput) searchInput.focus();
  };
  

  
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };


  return (
    <header>
      <div className="header-left">
        <Link to="/" className="logo">
          <img src="/assets/logo/tradex-icon.png" alt="Logo" />
        </Link>
        <nav className="desktop-nav">
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
                      <i className="fa-solid fa-bitcoin-sign"></i>
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
                  <Link to="/earn/simple-earn" className="dropdown-link">
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
                    <i className="fa-solid fa-hand-holding-dollar"></i>
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
                  
                  <div className="dropdown-item" onClick={openComingSoon} style={{gap: '12px'}}>
                      <i className="fas fa-handshake"></i> Affiliates
                  </div>
                  <ComingSoon isOpen={isComingSoonOpen} onClose={closeComingSoon} />
                  
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

      {/* Header right section */}
      <div className="header-right">
          {/* Mobile search icon - only visible on mobile */}
          <div className="mobile-search-icon-wrapper">
            <button 
              className="mobile-search-icon" 
              onClick={toggleMobileSearch}
              aria-label="Search"
            >
              <i className="fas fa-search"></i>
            </button>
        </div>
        {/* Desktop search box - hidden on mobile */}
        <div className="desktop-search okx-navbar-search-box" ref={searchRef}>
          <i className="fas fa-search" aria-hidden="true"></i>
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
          />
          {isSearchFocused && (
            <div className="search-dropdown-menu wide-dropdown">
              <div className="search-tabs">
                <div 
                  className={`search-tab ${activeTab === 'spot' ? 'active' : ''}`}
                  onClick={() => setActiveTab('spot')}
                >
                  Spot
                </div>
                <div 
                  className={`search-tab ${activeTab === 'futures' ? 'active' : ''}`}
                  onClick={() => setActiveTab('futures')}
                >
                  Futures
                </div>
              </div>
              
              {isLoading ? (
                <div className="search-loading-item">
                  <div className="search-spinner"></div>
                  <span>Loading coins...</span>
                </div>
              ) : displayResults.length > 0 ? (
                <div className="search-coins-container">
                  {displayResults.map((coin) => (
                    <div 
                      key={coin.coin_pair} 
                      className="search-coin-item" 
                      onClick={() => handleCoinSelect(coin)}
                    >
                      <div className="search-coin-logo">
                        <img src={coin.logo_path || defaultCoinLogo} alt={coin.symbol} />
                      </div>
                      <div className="search-coin-info">
                        <div className="search-coin-name">{coin.symbol}/{coin.pair_name || 'USDT'}</div>
                        <div className="search-coin-price">
                          ${parseFloat(coin.price).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8
                          })}
                          <span className={coin.price_change_24h >= 0 ? 'positive-change' : 'negative-change'}>
                            {coin.price_change_24h >= 0 ? '+' : ''}{(coin.price_change_24h || 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm.trim() ? (
                <div className="search-no-results-item">
                  No coins found matching "{searchTerm}"
                </div>
              ) : (
                <div className="search-info-item">
                  Start typing to search for coins
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile search container */}
        {isMobileSearchOpen && (
          <div className="mobile-search-container" ref={mobileSearchRef}>
            <div className="mobile-search-header">
              <div className="mobile-search-input-wrapper">
                <i className="fas fa-search" aria-hidden="true"></i>
                <input
                  id="mobile-search-input"
                  type="text"
                  placeholder="Search..."
                  aria-label="Search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  autoFocus
                />
                {searchTerm && (
                  <button 
                    className="mobile-search-clear" 
                    onClick={clearSearch}
                    aria-label="Clear search"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <button 
                className="mobile-search-close" 
                onClick={toggleMobileSearch}
                aria-label="Close search"
              >
                Cancel
              </button>
            </div>
            
            <div className="mobile-search-content">
              <div className="search-tabs">
                <div 
                  className={`search-tab ${activeTab === 'spot' ? 'active' : ''}`}
                  onClick={() => setActiveTab('spot')}
                >
                  Spot
                </div>
                <div 
                  className={`search-tab ${activeTab === 'futures' ? 'active' : ''}`}
                  onClick={() => setActiveTab('futures')}
                >
                  Futures
                </div>
              </div>
              
              {isLoading ? (
                <div className="search-loading-item">
                  <div className="search-spinner"></div>
                  <span>Loading coins...</span>
                </div>
              ) : displayResults.length > 0 ? (
                <div className="search-coins-container">
                  {displayResults.map((coin) => (
                    <div 
                      key={coin.coin_pair} 
                      className="search-coin-item" 
                      onClick={() => handleCoinSelect(coin)}
                    >
                      <div className="search-coin-logo">
                        <img src={coin.logo_path || defaultCoinLogo} alt={coin.symbol} />
                      </div>
                      <div className="search-coin-info">
                        <div className="search-coin-name">{coin.symbol}/{coin.pair_name || 'USDT'}</div>
                        <div className="search-coin-price">
                          ${parseFloat(coin.price).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8
                          })}
                          <span className={coin.price_change_24h >= 0 ? 'positive-change' : 'negative-change'}>
                            {coin.price_change_24h >= 0 ? '+' : ''}{(coin.price_change_24h || 0).toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchTerm.trim() ? (
                <div className="search-no-results-item">
                  No coins found matching "{searchTerm}"
                </div>
              ) : (
                <div className="search-info-item">
                  Start typing to search for coins
                </div>
              )}
            </div>
          </div>
        )}
                      
        {isAuthenticated ? (
          <div className="auth-menu-container">
            {/* Assets Dropdown - hidden on mobile */}
            <div className="dropdown-container">
              <div className="assets-dropdown">
                <span>Assets</span>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="assets-dropdown-menu">
                <Link to="/assets" className="menu-item">
                  <i className="fas fa-wallet"></i> My assets
                </Link>
                <Link to="/deposit" className="menu-item">
                  <i className="fas fa-arrow-circle-down"></i> Deposit
                </Link>
                <Link to="/withdraw" className="menu-item">
                  <i className="fas fa-arrow-circle-up"></i> Withdraw
                </Link>
                <Link to="/transfer" className="menu-item">
                  <i className="fas fa-exchange-alt"></i> Transfer
                </Link>
                <Link to="/analysis" className="menu-item">
                  <i className="fas fa-chart-line"></i> Analysis
                </Link>
                <Link to="/order-center" className="menu-item">
                  <i className="fas fa-clipboard-list"></i> Order center
                </Link>
                <Link to="/trading-fees" className="menu-item">
                  <i className="fas fa-tags"></i> My trading fees
                </Link>
                <Link to="/por-reports" className="menu-item">
                  <i className="fas fa-file-alt"></i> PoR reports
                </Link>
              </div>
            </div>

            {/* User Profile Dropdown */}
            <div className="dropdown-container">
              <div className="profile-dropdown">
                <i className="far fa-user user-icon-small"></i>
              </div>
              <div className="profile-dropdown-menu">
                <div className="user-info">
                  <div className="user-avatar">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <div className="user-details">
                    <p className="user-email">{userName}</p>
                    <p className="user-id">UID: {localStorage.getItem('uid') || 'N/A'}</p>
                  </div>
                </div>
                <div className="switch-account-button">
                  <button>Switch sub-account</button>
                </div>
                <Link to="/account/overview" className="menu-item">
                  <i className="fas fa-clock"></i> Overview
                </Link>
                <Link to="/account/profile" className="menu-item">
                  <i className="fas fa-user"></i> Profile
                </Link>
                <Link to="/security" className="menu-item">
                  <i className="fas fa-shield-alt"></i> Security
                </Link>
                <Link to="/account/profile/verify" className="menu-item">
                  <i className="fas fa-id-card"></i> Verification
                </Link>
                <Link to="/country-region" className="menu-item">
                  <i className="fas fa-globe"></i> Country/Region
                </Link>
                <Link to="/preferences" className="menu-item">
                  <i className="fas fa-cog"></i> Preferences
                </Link>
                <Link to="/sub-accounts" className="menu-item">
                  <i className="fas fa-users"></i> Sub-accounts
                </Link>
                <Link to="/api" className="menu-item">
                  <i className="fas fa-code"></i> API
                </Link>
                <Link to="/third-party" className="menu-item">
                  <i className="fas fa-plug"></i> Third-party authorization
                </Link>
                <div className="menu-item logout" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Log out
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="login-link">Log in</Link>
            <Link to="/signup" style={signupButtonStyle}>Sign up</Link>
          </div>
        )}
        
        <div className="icon-group desktop-only">
          {/* Download App Icon with QR code dropdown */}
          <div className="right-nav-item">
            <button 
              className="navbar-icon-link" 
              type="button" 
              aria-label="Download app" 
              style={{background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer'}}
            >
              <i className="far fa-arrow-alt-circle-down"></i>
            </button>
            
            <div className="right-dropdown-menu download-menu">
              <h3 className="dropdown-title">Download app</h3>
              <div className="qr-code-container">
                <QRCodeSVG 
                    value={appDownloadUrl}
                    size={120}
                    level={"H"}
                    includeMargin={true}
                    className="qr-code-image"
                  />
              </div>
              <div className='download-qr-code-container'>
                <Link to="/download">
                  <button className="dropdown-button">More options</button>
                </Link>
                
                <p className="dropdown-subtitle">For mobile and desktop</p>
              </div>
            </div>
          </div>
          
            {/* Notifications Icon with announcements dropdown */}
              <div className="right-nav-item">
                <button 
                  className="navbar-icon-link" 
                  type="button" 
                  aria-label="Notifications" 
                  style={{background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer'}}
                >
                  <i className="far fa-bell"></i>
                </button>
                
              <div className="right-dropdown-menu notifications-menu">
                {notifications.map(notification => (
                  <Link to={notification.path} key={notification.id}>
                    <div className="notification-item">
                      <h4 className="notification-title">{notification.title}</h4>
                      <p className="notification-time">{notification.time}</p>
                    </div>
                  </Link>
                ))}
                
                <Link to="/help/category/announcements" className="more-link">
                  More announcements
                </Link>
              </div>
            </div>
          
          {/* Help Icon with support dropdown */}
          <div className="right-nav-item">
            <button 
              className="navbar-icon-link" 
              type="button" 
              aria-label="Help" 
              style={{background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer'}}
            >
              <i className="far fa-question-circle"></i>
            </button>
            
            <div className="right-dropdown-menu help-menu">
              <Link to="/support" className="dropdown-menu-item">
                Support center
              </Link>
              <Link to="/support-center/history" className="dropdown-menu-item">
                My tickets
              </Link>
              <Link to="/connect" className="dropdown-menu-item">
                Connect with TradeX
              </Link>
            </div>
          </div>

          {/* Language icon with support dropdown */}
          <div className="right-nav-item">
            <button 
              className="navbar-icon-link" 
              type="button" 
              aria-label="Language" 
              style={{background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer'}}
              onClick={openModal}
            >
              <i className="fas fa-globe"></i>
            </button>
          </div>
        </div>
        
        {/* Mobile-only hamburger menu button */}
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <i className="fas fa-bars"></i>
        </div>
      </div>
      {/* Language Modal */}
      <LanguageModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
      />
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu">
            <div className="mobile-menu-header">
              <div className="mobile-menu-close" onClick={toggleMobileMenu}>
                <i className="fas fa-times"></i>
              </div>
            </div>
            <div className="mobile-menu-items">
              {mobileMenuItems.map((item, index) => (
                <div key={index} className="mobile-menu-item-container">
                  {item.hasDropdown ? (
                    <div 
                      className="mobile-menu-item"
                      onClick={() => toggleSubmenu(index)}
                    >
                      <span>{item.name}</span>
                      <i className={`fas fa-chevron-down ${expandedMenus.includes(index) ? 'rotated' : ''}`}></i>
                    </div>
                  ) : (
                    <a href={item.path} className="mobile-menu-item">
                      <span>{item.name}</span>
                    </a>
                  )}
                  
                  {item.hasDropdown && item.subItems && item.subItems.length > 0 && expandedMenus.includes(index) && (
                    <div className="mobile-submenu">
                      {item.subItems.map((subItem, subIndex) => (
                        <a key={subIndex} href={subItem.path} className="mobile-submenu-item">
                          {subItem.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mobile-menu-footer">
              <a href="/download" className="footer-download-button">
                Download TradeX app
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;