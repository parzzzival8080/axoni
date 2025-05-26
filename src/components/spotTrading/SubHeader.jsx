import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { 
  faExternalLinkAlt, 
  faChartLine, 
  faCog, 
  faChevronDown, 
  faSearch 
} from '@fortawesome/free-solid-svg-icons';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';
import defaultCoinLogo from '../../assets/coin/bitcoin-2136339_640.webp';
import './SubHeader.css';

const SubHeader = ({ cryptoData, coinPairId, availableCoins, onCoinSelect, loading, error }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

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
  const filteredCoins = useMemo(() => {
    if (!availableCoins) return [];
    const searchLower = searchTerm.toLowerCase();
    return availableCoins.filter(coin => {
      return (
        coin.symbol?.toLowerCase().includes(searchLower) ||
        coin.name?.toLowerCase().includes(searchLower)
      );
    });
  }, [availableCoins, searchTerm]);

  // Handle coin selection
  const handleCoinSelect = useCallback((coin) => {
    setIsDropdownOpen(false);
    setSearchTerm(''); // Reset search term
    onCoinSelect(coin.coin_pair);
  }, [onCoinSelect]);

  // Render skeleton loading items
  const renderSkeletonItems = useCallback(() => {
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
        <div style={{ flex: 1, minWidth: 0, paddingRight: '16px' }}>
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
  }, []);

  if (loading) {
    return (
      <div className="sub-header skeleton-loading">
        <div className="loading-message">Loading coin data...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="sub-header error">
        <div className="error-message">{error}</div>
      </div>
    );
  }
  if (!cryptoData) {
    return (
      <div className="sub-header skeleton-loading">
        <div className="loading-message">Loading coin data...</div>
      </div>
    );
  }

  // Extract data from cryptoData with proper fallbacks
  const cryptoSymbol = cryptoData.crypto_symbol || cryptoData.cryptoSymbol || 'BTC';
  const cryptoName = cryptoData.crypto_name || cryptoData.cryptoName || 'Bitcoin';
  const usdtSymbol = cryptoData.usdt_symbol || cryptoData.usdtSymbol || 'USDT';
  const price = cryptoData.price || cryptoData.cryptoPrice || 0;
  const cryptoLogoPath = cryptoData.crypto_logo_path || cryptoData.cryptoLogoPath || null;
  const priceChange24h = cryptoData.priceChange24h || 0;
  
  const high24h = cryptoData['24_high'] || 20500;
  const low24h = cryptoData['24_low'] || 19500;
  const volume24h = cryptoData.volume_24h || 1250.75;

  const formattedPrice = parseFloat(price).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
  });

  const logoSrc = cryptoLogoPath || defaultCoinLogo;

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
              {cryptoSymbol}/{usdtSymbol}
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
              <div className="spot-coins-list okx-custom-scrollbar">
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
                        }}>{parseFloat(coin.price || 0).toLocaleString(undefined, {
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
                            color: (coin.price_change_24h || 0) >= 0 ? '#00b574' : '#f23645'
                          }}
                        >
                          {(coin.price_change_24h || 0) >= 0 ? '+' : ''}{(coin.price_change_24h || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="price-stats">
        <div className="stat">
          <div className="value">
            <div className="flex items-center">
              <span 
                className={priceChange24h >= 0 ? 'text-[#00b574]' : 'text-[#f23645]'} 
                style={{ fontSize: '24px', fontWeight: '500' }}
              >
                {formattedPrice}
              </span>
            </div>
          </div>
          <div className="label">
            {cryptoName} price <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1" />
          </div>
        </div>

        <div className="stat">
          <div className="value">
            <span className={`text ${priceChange24h >= 0 ? 'text-[#00b574]' : 'text-[#f23645]'}`}>
              {priceChange24h >= 0 ? '+' : ''}{priceChange24h?.toFixed(2)}%
            </span>
          </div>
          <div className="label">24h change</div>
        </div>

        <div className="stat">
          <div className="value blue">
            {parseFloat(low24h).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
          <div className="label">24h low</div>
        </div>
        
        <div className="stat">
          <div className="value green">
            {parseFloat(high24h).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
          <div className="label">24h high</div>
        </div>
        
        <div className="stat">
          <div className="value">
            {parseFloat(volume24h).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
          <div className="label">24h volume ({cryptoSymbol})</div>
        </div>
      </div>
      
      <div className="leverage">10x</div>
      <div className="favorite">
        <FontAwesomeIcon icon={farStar} />
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

export default React.memo(SubHeader);