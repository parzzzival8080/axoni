import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import "./Navbar.css";
import { fetchAllCoins } from "../../services/spotTradingApi";
import defaultCoinLogo from "../../assets/coin/btc.webp";
import ComingSoon from "../../components/common/ComingSoon";
import LanguageModal from "./LanguageModal";
import MetaMaskWallet from "./MetaMaskWallet";
import Logo from "../../assets/logo/logo.png";


// Notification data
const notifications = [
  {
    id: 1,
    title: "GLD to list perpetual futures for SIGN crypto",
    time: "04/28/2026, 14:00:00",
    path: "/help/GLD-to-list-perpetual-futures-for-sign-crypto",
  },
  {
    id: 2,
    title: "GLD to delist ZKJ margin trading pair and perpetual future",
    time: "04/28/2026, 11:10:00",
    path: "/help/GLD-to-delist-zkj-margin-trading-pair-and-perpetual-future",
  },
  {
    id: 3,
    title: "GLD to enable margin trading and Simple Earn for LAYER crypto",
    time: "04/25/2026, 19:20:00",
    path: "/help/GLD-to-enable-margin-trading-and-simple-earn-for-layer-crypto",
  },
  {
    id: 4,
    title: "GLD to list LAYER (Solayer) for spot trading",
    time: "04/25/2026, 14:00:00",
    path: "/help/GLD-to-list-layer-solayer-for-spot-trading",
  },
  {
    id: 5,
    title: "GLD to list perpetual futures for INIT crypto",
    time: "04/24/2026, 14:00:00",
    path: "/help/GLD-to-list-perpetual-futures-for-init-crypto",
  },
];

// Mobile menu items
const mobileMenuItems = [
  {
    name: "Trade",
    hasDropdown: true,
    subItems: [
      { name: "Convert", path: "/conversion" },
      { name: "POS", path: "/spot-trading" },
      { name: "POW", path: "/future-trading" },
      { name: "Transfer", path: "/transfer" },
    ],
  },
  {
    name: "Discover",
    hasDropdown: true,
    subItems: [
      { name: "Markets", path: "/market" },
      { name: "About Us", path: "/about-us" },
    ],
  },
  // {
  //   name: 'Grow',
  //   hasDropdown: true,
  //   subItems: [
  //     {
  //       id: 'earn_mobile_expand', // Unique ID for state management
  //       name: 'Earn',
  //       path: '/earn',
  //       hasSubDropdown: true,
  //       subSubItems: [
  //         { name: 'Simple Earn', path: '/earn/simple-earn' }
  //       ]
  //     },
  //     // TODO: Add Loan, Jumpstart if they are primary desktop Grow items
  //   ]
  // },
  // {
  //   name: 'Download App',
  //   path: '/download',
  //   hasDropdown: false
  // },
];

const Navbar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showAssetsMenu, setShowAssetsMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState([]);
  const [expandedSubSubMenus, setExpandedSubSubMenus] = useState([]); // State for sub-sub-menus
  const [coins, setCoins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("spot");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isChatLoaded, setIsChatLoaded] = useState(false);

  const signupButtonStyle = {
    backgroundColor: "black",
    border: "1px solid rgba(255, 255, 255, 0.8)",
    borderRadius: "20px",
    padding: "5px 15px",
    fontSize: "14px",
    color: "white",
    textDecoration: "none",
    marginRight: "16px",
    fontWeight: "500",
  };

  // Check for authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      const fullName = localStorage.getItem("fullName");
      const userId = localStorage.getItem("user_id");

      if (token) {
        setIsAuthenticated(true);

        if (fullName) {
          setUserName(fullName);
        } else if (userId) {
          try {
            const response = await axios.get(
              `https://django.axoni.co/api/user_account/getUserInformation/?user_id=${userId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            if (
              response.data &&
              response.data.user &&
              response.data.user.name
            ) {
              const name = response.data.user.name;
              setUserName(name);
              localStorage.setItem("fullName", name);

              if (response.data.user.uid) {
                localStorage.setItem("uid", response.data.user.uid);
              }
            } else {
              setUserName("User");
            }
          } catch (error) {
            console.error("Error fetching user information:", error);
            setUserName("User");
          }
        } else {
          setUserName("User");
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

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [searchRef]);

  const handleLogout = () => {
    // Clear user-related cache from localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("user_id");
    localStorage.removeItem("fullName");
    localStorage.removeItem("user");
    localStorage.removeItem("uid");
    // Add any other user-related keys here if needed

    // Also clear from sessionStorage (if you store user data there)
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("fullName");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("uid");
    // Add any other user-related keys here if needed

    // If you use a caching library (e.g., React Query, SWR, Redux), reset its cache here
    // Example for React Query:
    // queryClient.clear();

    setIsAuthenticated(false);
    setUserName("");
    setShowUserMenu(false);

    window.location.href = "/";
  };

  const appDownloadUrl =
    "https://api.axoni.co/api/v1/download-axoni-apk";

  const openComingSoon = () => setIsComingSoonOpen(true);
  const closeComingSoon = () => setIsComingSoonOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const toggleSubmenu = (index) => {
    // If the item itself is a link (e.g., 'Earn' main item), clicking it should also navigate
    // For now, let's assume clicking the parent always toggles. Navigation can be handled by sub-items.
    if (expandedMenus.includes(index)) {
      setExpandedMenus(expandedMenus.filter((i) => i !== index));
      // Collapse any open sub-sub-menus when collapsing the parent
      const item = mobileMenuItems[index];
      if (item && item.subItems) {
        item.subItems.forEach((subItem) => {
          if (subItem.id && expandedSubSubMenus.includes(subItem.id)) {
            setExpandedSubSubMenus((prev) =>
              prev.filter((id) => id !== subItem.id),
            );
          }
        });
      }
    } else {
      setExpandedMenus([...expandedMenus, index]);
    }
  };

  const toggleSubSubmenu = (id) => {
    setExpandedSubSubMenus((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Original toggleSubmenu function content starts here, ensure it's correctly placed or integrated.
  // For this replacement, I am providing a new toggleSubmenu that also handles collapsing sub-sub-menus.
  // The original function was:
  // if (expandedMenus.includes(index)) {
  //   setExpandedMenus(expandedMenus.filter((i) => i !== index));
  // } else {
  //   setExpandedMenus([...expandedMenus, index]);
  // }
  // };
  // The new version above replaces this. Ensure this is the intended logic.

  // The actual function to be replaced is the simple toggle, so the replacement should be:
  // const toggleSubmenu = (index) => { ... new logic ... };
  // And then, separately, add toggleSubSubmenu.
  // Correcting the replacement for toggleSubmenu:

  // Handle coin selection
  const handleCoinSelect = (coin) => {
    setIsSearchFocused(false);
    setSearchTerm("");
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    setIsMobileSearchOpen(false);

    if (activeTab === "futures") {
      navigate(`/future-trading?coin_pair_id=${coin.coin_pair}`);
    } else {
      navigate(`/spot-trading?coin_pair_id=${coin.coin_pair}`);
    }
  };

  // Filter coins based on search term and active tab
  const filteredCoins = coins
    .filter((coin) => {
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        return (
          coin.symbol?.toLowerCase().includes(searchLower) ||
          coin.name?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .slice(0, 20);

  const testResults =
    searchTerm.trim() && filteredCoins.length === 0
      ? [
          {
            coin_pair: "1",
            symbol: "BTC",
            name: "Bitcoin",
            price: "64000",
            price_change_24h: 2.5,
            pair_name: "USDT",
          },
          {
            coin_pair: "3",
            symbol: "ETH",
            name: "Ethereum",
            price: "3200",
            price_change_24h: -1.2,
            pair_name: "USDT",
          },
          {
            coin_pair: "15",
            symbol: "SOL",
            name: "Solana",
            price: "150",
            price_change_24h: 5.8,
            pair_name: "USDT",
          },
        ]
      : [];

  const displayResults = filteredCoins.length > 0 ? filteredCoins : testResults;

  // Function to toggle mobile search
  const toggleMobileSearch = () => {
    setIsMobileSearchOpen(!isMobileSearchOpen);
    if (!isMobileSearchOpen) {
      // When opening, focus the search input after a brief delay to allow animation
      setTimeout(() => {
        const searchInput = document.getElementById("mobile-search-input");
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
    setSearchTerm("");
    const searchInput = document.getElementById("mobile-search-input");
    if (searchInput) searchInput.focus();
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="header-left">
        <Link to="/" className="logo">
          <img src={Logo} alt="Logo" />
        </Link>
        <nav className="desktop-nav">
          <div className="nav-item">
            Trade <i className="fas fa-chevron-down" />
            <div className="dropdown-menu">
              <h2>Trading instruments</h2>

              <Link to="/conversion" className="dropdown-link">
                <div
                  className="dropdown-item with-arrow"
                  style={{ position: "relative" }}
                >
                  <div className="dropdown-icon">
                    <i className="fas fa-sync-alt"></i>
                  </div>
                  <div className="dropdown-content">
                    <h3>Convert</h3>
                    <p>Quick conversion, zero trading fees, no slippage</p>
                  </div>
                  <i
                    className="fas fa-chevron-right"
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                    }}
                  ></i>
                </div>
              </Link>

              <Link to="/spot-trading" className="dropdown-link">
                <div className="dropdown-item with-arrow">
                  <div className="dropdown-icon">
                    <i className="fas fa-coins"></i>
                  </div>
                  <div className="dropdown-content">
                    <h3>POS</h3>
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
                    <h3>POW</h3>
                    <p>Trade perpetual and expiry futures with leverage</p>
                  </div>
                  <i className="fas fa-chevron-right"></i>
                </div>
              </Link>
            </div>
          </div>
          <div className="nav-item">
            Discover <i className="fas fa-chevron-down"></i>
            <div className="dropdown-menu">
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

              <Link to="/about-us" className="dropdown-link">
                <div className="dropdown-item with-arrow">
                  <div className="dropdown-icon">
                    <i className="fas fa-info-circle"></i>
                  </div>
                  <div className="dropdown-content">
                    <h3>About Us</h3>
                    <p>Learn more about GLD and our mission</p>
                  </div>
                  <i className="fas fa-chevron-right"></i>
                </div>
              </Link>

              <Link to="/download" className="dropdown-link">
                <div className="dropdown-item with-arrow">
                  <div className="dropdown-icon">
                    <i className="fas fa-download"></i>
                  </div>
                  <div className="dropdown-content">
                    <h3>Download App</h3>
                    <p>Get the GLD app for desktop and mobile</p>
                  </div>
                  <i className="fas fa-chevron-right"></i>
                </div>
              </Link>
            </div>
          </div>

          {/* <div className="nav-item">
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


                <div className="dropdown-sub-items">
                  <Link to="/earn/simple-earn" className="dropdown-link">
                    <div className="dropdown-sub-item">
                      <div className="dropdown-icon-small">
                        <i className="fas fa-circle"></i>
                      </div>
                      <span>Simple Earn</span>
                    </div>
                  </Link>

                </div>
              </div>


            </div>
        </div> */}

          {/* More dropdown removed */}
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
            ref={searchInputRef}
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
                  className={`search-tab ${
                    activeTab === "spot" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("spot")}
                >
                  POS
                </div>
                <div
                  className={`search-tab ${
                    activeTab === "futures" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("futures")}
                >
                  POW
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
                        <img
                          src={coin.logo_path || defaultCoinLogo}
                          alt={coin.symbol}
                        />
                      </div>
                      <div className="search-coin-info">
                        <div className="search-coin-name">
                          {coin.symbol}/{coin.pair_name || "USDT"}
                        </div>
                        <div className="search-coin-price">
                          $
                          {parseFloat(coin.price).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          })}
                          <span
                            className={
                              coin.price_change_24h >= 0
                                ? "positive-change"
                                : "negative-change"
                            }
                          >
                            {coin.price_change_24h >= 0 ? "+" : ""}
                            {(coin.price_change_24h || 0).toFixed(2)}%
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
                  className={`search-tab ${
                    activeTab === "spot" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("spot")}
                >
                  POS
                </div>
                <div
                  className={`search-tab ${
                    activeTab === "futures" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("futures")}
                >
                  POW
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
                        <img
                          src={coin.logo_path || defaultCoinLogo}
                          alt={coin.symbol}
                        />
                      </div>
                      <div className="search-coin-info">
                        <div className="search-coin-name">
                          {coin.symbol}/{coin.pair_name || "USDT"}
                        </div>
                        <div className="search-coin-price">
                          $
                          {parseFloat(coin.price).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          })}
                          <span
                            className={
                              coin.price_change_24h >= 0
                                ? "positive-change"
                                : "negative-change"
                            }
                          >
                            {coin.price_change_24h >= 0 ? "+" : ""}
                            {(coin.price_change_24h || 0).toFixed(2)}%
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
            {/* MetaMask Wallet Component */}
            {/* <MetaMaskWallet /> */}
            {/* Assets Dropdown - hidden on mobile */}
            <div className="dropdown-container">
              <div className="assets-dropdown">
                <span>Assets</span>
                <i className="fas fa-chevron-down"></i>
              </div>
              <div className="assets-dropdown-menu">
                <Link to="/my-assets" className="menu-item">
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
                    <p className="user-id">
                      UID: {localStorage.getItem("uid") || "N/A"} <br />
                      {/* Tier display with badge */}
                      {(() => {
                        const tier = (
                          localStorage.getItem("tier") || "N/A"
                        ).toLowerCase();
                        const tierBadges = {
                          bronze: "🟤", // Bronze — brushed metal texture
                          silver: "⚪", // Silver — metallic card
                          gold: "🟡", // Gold — shiny coin
                          diamond: "💎", // Diamond — crystal icon
                          platinum: "👑", // Platinum — glowing crown
                          "n/a": "⚫", // Inactive or no tier
                        };
                        const badge = tierBadges[tier] || "⚫";

                        return (
                          <strong
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span>{badge}</span>
                            <span style={{ textTransform: "capitalize" }}>
                              {tier}
                            </span>
                            Account
                          </strong>
                        );
                      })()}
                    </p>
                  </div>
                </div>

                <Link to="/account/overview" className="menu-item">
                  <i className="fas fa-clock"></i> Overview
                </Link>
                <Link to="/account/profile" className="menu-item">
                  <i className="fas fa-user"></i> Profile
                </Link>
                <Link to="/account/profile/security" className="menu-item">
                  <i className="fas fa-shield-alt"></i> Security
                </Link>

                <div className="menu-item logout" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i> Log out
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="auth-buttons">
            <Link
              to="/login"
              className="navbar-link login-button hidden sm:inline-block"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              style={signupButtonStyle}
              className="navbar-link hidden sm:inline-block"
            >
              Sign up
            </Link>
          </div>
        )}

        <div className="icon-group desktop-only">
          {/* Download App Icon with QR code dropdown */}

          {/* Notifications Icon with announcements dropdown */}
          <div className="right-nav-item hidden">
            <button
              className="navbar-icon-link"
              type="button"
              aria-label="Notifications"
              style={{
                background: "none",
                border: "none",
                padding: 0,
                margin: 0,
                cursor: "pointer",
              }}
            >
              <i className="far fa-bell"></i>
            </button>

            <div className="right-dropdown-menu notifications-menu">
              {notifications.map((notification) => (
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

          {/* Language icon with support dropdown */}
        </div>

        {/* Mobile-only hamburger menu button */}
        <div className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <i className="fas fa-bars"></i>
        </div>
      </div>
      {/* Language Modal */}
      <LanguageModal isOpen={isModalOpen} onClose={closeModal} />
      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu">
            <div className="mobile-menu-header">
              <div className="mobile-menu-close" onClick={toggleMobileMenu}>
                <i className="fas fa-times"></i>
              </div>
            </div>
            {!isAuthenticated && (
              <div className="mobile-auth-links p-4 border-b border-[#2A2A2A]">
                <Link
                  to="/login"
                  className="block text-center py-3 px-4 mb-2 text-white bg-[#2EBD85] hover:bg-[#259A6C] rounded-md text-sm font-medium transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="block text-center py-3 px-4 text-white bg-[#252525] hover:bg-[#2A2A2A] rounded-md text-sm font-medium transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Sign Up
                </Link>
              </div>
            )}
            <div className="mobile-menu-items">
              {mobileMenuItems.map((item, index) => (
                <div key={index} className="mobile-menu-item-container">
                  {item.hasDropdown ? (
                    <div
                      className="mobile-menu-item"
                      onClick={() => toggleSubmenu(index)}
                    >
                      <span>{item.name}</span>
                      <i
                        className={`fas fa-chevron-down ${
                          expandedMenus.includes(index) ? "rotated" : ""
                        }`}
                      ></i>
                    </div>
                  ) : (
                    <a href={item.path} className="mobile-menu-item">
                      <span>{item.name}</span>
                    </a>
                  )}

                  {item.hasDropdown &&
                    item.subItems &&
                    item.subItems.length > 0 &&
                    expandedMenus.includes(index) && (
                      <div className="mobile-submenu">
                        {item.subItems.map((subItem, subIndex) => {
                          if (subItem.hasSubDropdown) {
                            return (
                              <div
                                key={subIndex}
                                className="mobile-submenu-item-container"
                              >
                                <div
                                  className="mobile-submenu-item as-header"
                                  onClick={() =>
                                    subItem.id && toggleSubSubmenu(subItem.id)
                                  }
                                >
                                  <span>{subItem.name}</span>
                                  <i
                                    className={`fas fa-chevron-down ${
                                      subItem.id &&
                                      expandedSubSubMenus.includes(subItem.id)
                                        ? "rotated"
                                        : ""
                                    }`}
                                  ></i>
                                </div>
                                {subItem.id &&
                                  expandedSubSubMenus.includes(subItem.id) &&
                                  subItem.subSubItems && (
                                    <div className="mobile-sub-submenu">
                                      {subItem.subSubItems.map(
                                        (subSubItem, subSubIndex) => (
                                          <a
                                            key={subSubIndex}
                                            href={subSubItem.path}
                                            className="mobile-sub-submenu-item"
                                          >
                                            {subSubItem.name}
                                          </a>
                                        ),
                                      )}
                                    </div>
                                  )}
                              </div>
                            );
                          } else {
                            return (
                              <a
                                key={subIndex}
                                href={subItem.path}
                                className="mobile-submenu-item"
                              >
                                {subItem.name}
                              </a>
                            );
                          }
                        })}
                      </div>
                    )}
                </div>
              ))}
            </div>
            <div className="mobile-menu-footer">
              <Link
                to="/download"
                className="footer-download-button"
                onClick={toggleMobileMenu}
              >
                Download GLD app
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Floating chat FAB + popup */}
      <div className="hidden sm:block">
        {/* Chat panel */}
        {showChat && (
          <div
            className="fixed bottom-24 right-6 z-[9998] flex flex-col shadow-2xl"
            style={{ borderRadius: 14, overflow: 'hidden', width: 380 }}
          >
            <div className="flex items-center justify-between px-4 py-3" style={{ background: '#1E1E1E', borderBottom: '1px solid #2A2A2A' }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#2EBD85]" style={{ boxShadow: '0 0 6px #2EBD85' }}></div>
                <span className="text-white text-sm font-semibold">Customer Support</span>
              </div>
              <button onClick={() => { setShowChat(false); setIsChatLoaded(false); }} className="text-[#5E6673] hover:text-white transition-colors p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Loading skeleton */}
            {!isChatLoaded && (
              <div className="flex flex-col items-center justify-center gap-4 bg-[#0a0a0a]" style={{ width: 380, height: 560 }}>
                <div className="w-12 h-12 rounded-full border-2 border-[#2A2A2A] border-t-[#2EBD85] animate-spin" />
                <span className="text-sm text-[#5E6673]">Connecting to support...</span>
              </div>
            )}

            <iframe
              src="https://bot-chatter.vercel.app/livechat/widget?color=2EBD85&source=axoni.co"
              width="380"
              height="560"
              style={{ border: 'none', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', display: isChatLoaded ? 'block' : 'none' }}
              title="Customer Support Chat"
              onLoad={() => setIsChatLoaded(true)}
            />
          </div>
        )}

        {/* FAB button */}
        <button
          onClick={() => setShowChat(v => !v)}
          title="Customer Support"
          className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200"
          style={{ background: '#2EBD85', boxShadow: '0 4px 20px rgba(46,189,133,0.4)' }}
        >
          {showChat ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
