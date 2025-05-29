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
import defaultCoinLogo from '../../assets/coin/btc.webp';
import './SubHeader.css';

const SubHeader = ({ cryptoData, coinPairId, availableCoins, onCoinSelect, loading, error, statsLoading }) => {
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
        className="flex items-center p-4 md:p-5 border-b border-okx-border last:border-b-0"
      >
        <div className="w-8 h-8 md:w-8 md:h-8 mr-4 rounded-full bg-okx-secondary animate-pulse-slow flex-shrink-0"></div>
        <div className="flex-1 min-w-0 pr-4">
          <div className="h-4 w-20 bg-okx-secondary rounded mb-2 animate-pulse-slow"></div>
          <div className="h-3 w-28 bg-okx-secondary rounded animate-pulse-slow"></div>
        </div>
        <div className="text-right ml-4 flex-shrink-0 min-w-[100px]">
          <div className="h-4 w-14 bg-okx-secondary rounded mb-2 ml-auto animate-pulse-slow"></div>
          <div className="h-3 w-10 bg-okx-secondary rounded ml-auto animate-pulse-slow"></div>
        </div>
      </div>
    ));
  }, []);
  
  if (loading) {
    return (
      <div className="sub-header bg-okx-primary border-b border-okx-border">
        {/* Desktop Skeleton */}
        <div className="hidden md:flex desktop-skeleton">
          <div className="desktop-skeleton-left">
            <div className="desktop-skeleton-coin">
              <div className="desktop-skeleton-logo"></div>
              <div className="desktop-skeleton-name"></div>
            </div>
            
            <div className="desktop-skeleton-stats">
              {/* Price */}
              <div className="desktop-skeleton-stat">
                <div className="desktop-skeleton-value" style={{ width: '120px' }}></div>
                <div className="desktop-skeleton-label" style={{ width: '80px' }}></div>
              </div>
              
              {/* 24h Change */}
              <div className="desktop-skeleton-stat">
                <div className="desktop-skeleton-value"></div>
                <div className="desktop-skeleton-label"></div>
              </div>
              
              {/* 24h Low */}
              <div className="desktop-skeleton-stat">
                <div className="desktop-skeleton-value"></div>
                <div className="desktop-skeleton-label"></div>
              </div>
              
              {/* 24h High */}
              <div className="desktop-skeleton-stat">
                <div className="desktop-skeleton-value"></div>
                <div className="desktop-skeleton-label"></div>
              </div>
              
              {/* 24h Volume */}
              <div className="desktop-skeleton-stat">
                <div className="desktop-skeleton-value" style={{ width: '100px' }}></div>
                <div className="desktop-skeleton-label" style={{ width: '90px' }}></div>
              </div>
            </div>
          </div>
          
          <div className="desktop-skeleton-actions">
            <div className="desktop-skeleton-button"></div>
            <div className="desktop-skeleton-button"></div>
            <div className="desktop-skeleton-logo" style={{ width: '28px', height: '28px', marginLeft: '8px' }}></div>
          </div>
        </div>
        
        {/* Mobile Skeleton */}
        <div className="md:hidden w-full">
          <div className="flex items-center mb-4 p-4">
            <div className="w-8 h-8 rounded-full bg-okx-secondary animate-pulse-slow mr-3"></div>
            <div className="h-5 w-28 bg-okx-secondary rounded animate-pulse-slow"></div>
            <div className="ml-auto h-6 w-16 bg-okx-secondary rounded animate-pulse-slow"></div>
          </div>
          <div className="flex overflow-x-auto pb-2 px-4 gap-4 scrollbar-hide">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-20">
                <div className="h-4 w-16 bg-okx-secondary rounded mb-2 animate-pulse-slow"></div>
                <div className="h-3 w-12 bg-okx-secondary rounded animate-pulse-slow"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="sub-header-error-card">
        <div className="sub-header-error-title">Error</div>
        <div className="sub-header-error-message">{error}</div>
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
            <div className="coin-icon" style={{background: 'none', boxShadow: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0}}>
              <img 
                src={logoSrc} 
                alt={cryptoSymbol} 
                style={{width: 32, height: 32, objectFit: 'contain', background: 'none', boxShadow: 'none', borderRadius: '50%', padding: 0}}
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
                          className="coin-icon"
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
        {statsLoading ? (
          <div className="price-stats-skeleton">
            <div className="skeleton-stat" />
            <div className="skeleton-stat" />
            <div className="skeleton-stat" />
            <div className="skeleton-stat" />
            <div className="skeleton-stat" />
          </div>
        ) : (
        <>
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
        </>
        )}
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