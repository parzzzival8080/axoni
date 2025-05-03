import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { faExternalLinkAlt, faChartLine, faCog, faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';
import defaultCoinLogo from '../../assets/coin/bitcoin-2136339_640.webp';
import { fetchTradableCoins } from '../../services/futureTradingApi';
import { useNavigate } from 'react-router-dom';
import './SubHeader.css';

/**
 * SubHeader Component
 * Displays coin information and trading statistics in the OKX dark mode style
 * 
 * @param {Object} props 
 * @param {Object} props.cryptoData - Coin data object
 * @param {string} props.cryptoData.cryptoName - Coin name
 * @param {string} props.cryptoData.cryptoSymbol - Coin symbol
 * @param {string} props.cryptoData.cryptoPrice - Coin price
 * @param {string} props.cryptoData.cryptoLogoPath - Coin logo path
 * @param {string} props.cryptoData.usdtSymbol - USDT symbol
 * @param {string} props.coinPairId - Coin pair ID
 */
const SubHeader = ({ cryptoData, coinPairId }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [coins, setCoins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch all available coins
  useEffect(() => {
    const loadCoins = async () => {
      setIsLoading(true);
      const tradableCoins = await fetchTradableCoins();
      if (tradableCoins && tradableCoins.length > 0) {
        setCoins(tradableCoins);
      }
      setIsLoading(false);
    };
    
    loadCoins();
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter coins based on search term
  const filteredCoins = coins.filter(coin => {
    const searchLower = searchTerm.toLowerCase();
    return (
      coin.symbol.toLowerCase().includes(searchLower) ||
      coin.name.toLowerCase().includes(searchLower)
    );
  });

  // Handle coin selection
  const handleCoinSelect = (coin) => {
    setIsDropdownOpen(false);
    navigate(`/future-trading?coin_pair_id=${coin.coin_pair}`);
  };

  // Render skeleton loading items
  const renderSkeletonItems = () => {
    return Array(8).fill(0).map((_, index) => (
      <div 
        key={`skeleton-${index}`} 
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: index < 7 ? '1px solid #1a1a1a' : 'none'
        }}
      >
        <div style={{
          width: '32px',
          height: '32px',
          marginRight: '16px',
          borderRadius: '50%',
          backgroundColor: '#1a1a1a',
          animation: 'pulse 1.5s infinite ease-in-out'
        }}></div>
        <div style={{
          flex: 1,
          minWidth: 0,
          paddingRight: '16px'
        }}>
          <div style={{
            height: '16px',
            width: '80px',
            backgroundColor: '#1a1a1a',
            marginBottom: '8px',
            borderRadius: '2px',
            animation: 'pulse 1.5s infinite ease-in-out'
          }}></div>
          <div style={{
            height: '12px',
            width: '120px',
            backgroundColor: '#1a1a1a',
            borderRadius: '2px',
            animation: 'pulse 1.5s infinite ease-in-out'
          }}></div>
        </div>
        <div style={{
          textAlign: 'right',
          marginLeft: '16px',
          flexShrink: 0,
          minWidth: '100px'
        }}>
          <div style={{
            height: '16px',
            width: '60px',
            backgroundColor: '#1a1a1a',
            marginBottom: '8px',
            borderRadius: '2px',
            marginLeft: 'auto',
            animation: 'pulse 1.5s infinite ease-in-out'
          }}></div>
          <div style={{
            height: '12px',
            width: '40px',
            backgroundColor: '#1a1a1a',
            borderRadius: '2px',
            marginLeft: 'auto',
            animation: 'pulse 1.5s infinite ease-in-out'
          }}></div>
        </div>
      </div>
    ));
  };

  // Show loading state if no data is available
  if (!cryptoData) {
    return (
      <div className="sub-header skeleton-loading">
        <div className="loading-message">Loading coin data...</div>
      </div>
    );
  }

  const { 
    cryptoName, 
    cryptoSymbol, 
    cryptoPrice, 
    cryptoLogoPath,
    usdtSymbol 
  } = cryptoData;
  
  // Format the price for display
  const formattedPrice = parseFloat(cryptoPrice).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Use the logo from API or default to the static image
  const logoSrc = cryptoLogoPath || defaultCoinLogo;
  
  // Calculate derived values for 24h stats (placeholder data)
  const price = parseFloat(cryptoPrice) || 0;
  const low24h = (price * 0.97).toFixed(2);
  const high24h = (price * 1.03).toFixed(2);
  const volumeK = ((Math.random() * 100) + 50).toFixed(2);
  const turnoverM = ((price * (Math.random() * 100) + 50) / 1000).toFixed(2);

  return (
    <div className="sub-header">
      <div className="coin-info">
        <div className="coin-selector" ref={dropdownRef}>
          <div 
            className="selected-coin" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="coin-icon">
              <img 
                src={logoSrc} 
                alt={cryptoSymbol} 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = defaultCoinLogo;
                }}
              />
            </div>
            <span className="coin-pair">
              {cryptoSymbol}/{usdtSymbol || 'USDT'}
            </span>
            <FontAwesomeIcon icon={faChevronDown} className="spot-dropdown-icon" />
          </div>
          
          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '-10px',
              width: '420px',
              maxHeight: '600px',
              backgroundColor: '#0c0c0c',
              border: '1px solid #2a2a2a',
              borderRadius: '4px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)',
              zIndex: 1000,
              marginTop: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid #1a1a1a',
                backgroundColor: '#121212'
              }}>
                <FontAwesomeIcon icon={faSearch} style={{
                  color: '#666',
                  marginRight: '12px',
                  fontSize: '14px'
                }} />
                <input 
                  type="text" 
                  placeholder="Search coin" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    padding: '6px 0',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
                  }}
                />
              </div>
              <div style={{
                maxHeight: '540px',
                overflowY: 'auto',
                padding: '8px 0'
              }}>
                {isLoading ? (
                  renderSkeletonItems()
                ) : (
                  filteredCoins.map(coin => (
                    <div 
                      key={coin.coin_pair} 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '16px 20px',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s'
                      }}
                      onClick={() => handleCoinSelect(coin)}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{
                        width: '32px',
                        height: '32px',
                        marginRight: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <img 
                          src={coin.logo_path} 
                          alt={coin.symbol}
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = defaultCoinLogo;
                          }}
                        />
                      </div>
                      <div style={{
                        flex: 1,
                        minWidth: 0,
                        paddingRight: '16px'
                      }}>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: 600,
                          color: '#fff',
                          marginBottom: '6px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>{coin.symbol}/{coin.pair_name || 'USDT'}</div>
                        <div style={{
                          fontSize: '13px',
                          color: '#666',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>{coin.name}</div>
                      </div>
                      <div style={{
                        textAlign: 'right',
                        marginLeft: '16px',
                        flexShrink: 0,
                        minWidth: '100px'
                      }}>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: 500,
                          color: '#fff',
                          fontFamily: 'Roboto Mono, monospace',
                          marginBottom: '6px',
                          textAlign: 'right'
                        }}>{parseFloat(coin.price).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 8
                        })}</div>
                        <div 
                          style={{
                            fontSize: '12px',
                            fontWeight: 500,
                            borderRadius: '2px',
                            padding: '2px 8px',
                            display: 'inline-block',
                            minWidth: '70px',
                            textAlign: 'right',
                            color: coin.price_change_24h >= 0 ? '#00b574' : '#f23645'
                          }}
                        >
                          {coin.price_change_24h >= 0 ? '+' : ''}{(coin.price_change_24h || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <div className="leverage">20x</div>
        <div className="favorite">
          <FontAwesomeIcon icon={farStar} />
        </div>
      </div>
      <div className="price-stats">
        <div className="stat">
          <div className="value green">{formattedPrice}</div>
          <div className="label">
            {cryptoName || cryptoSymbol} price <FontAwesomeIcon icon={faExternalLinkAlt} />
          </div>
          <div className="sub-value">${formattedPrice}</div>
        </div>
        <div className="stat">
          <div className="value">{low24h}</div>
          <div className="label">24h low</div>
        </div>
        <div className="stat">
          <div className="value">{high24h}</div>
          <div className="label">24h high</div>
        </div>
        <div className="stat">
          <div className="value">{volumeK}K</div>
          <div className="label">24h volume ({cryptoSymbol})</div>
        </div>
        <div className="stat">
          <div className="value">{turnoverM}M</div>
          <div className="label">24h turnover ({usdtSymbol || 'USDT'})</div>
        </div>
      </div>
      <div className="trading-actions">
        <button className="data-btn">
          <FontAwesomeIcon icon={faChartLine} /> Trading data
        </button>
        <button className="info-btn">
          <FontAwesomeIcon icon={faFileAlt} /> Information
        </button>
        <div className="settings">
          <FontAwesomeIcon icon={faCog} />
        </div>
      </div>
    </div>
  );
};

export default SubHeader;