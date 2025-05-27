import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { faExternalLinkAlt, faChartLine, faCog, faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';
import defaultCoinLogo from '../../assets/coin/btc.webp';
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
 * @param {Array} props.tradableCoins - List of tradable coins passed from parent
 */
const SubHeader = ({ cryptoData, coinPairId, tradableCoins }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true); 
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (tradableCoins && tradableCoins.length > 0) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [tradableCoins]);

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

  const filteredCoins = (tradableCoins || []).filter(coin => {
    const searchLower = searchTerm.toLowerCase();
    return (
      coin.symbol.toLowerCase().includes(searchLower) ||
      coin.name.toLowerCase().includes(searchLower)
    );
  });

  const handleCoinSelect = (coin) => {
    setIsDropdownOpen(false);
    navigate(`/future-trading?coin_pair_id=${coin.coin_pair}`);
  };

  const renderSkeletonItems = () => {
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
  };
  
  if (isLoading) {
    return (
      <div className="sub-header flex flex-col md:flex-row items-center justify-center p-4 bg-okx-primary border-b border-okx-border">
        <div className="w-full max-w-md">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 rounded-full bg-okx-secondary animate-pulse-slow mr-3"></div>
            <div className="h-5 w-28 bg-okx-secondary rounded animate-pulse-slow"></div>
            <div className="ml-auto h-6 w-16 bg-okx-secondary rounded animate-pulse-slow"></div>
          </div>
          <div className="flex overflow-x-auto pb-2 gap-4 scrollbar-hide">
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

  if (!cryptoData) {
    return (
      <div className="sub-header bg-okx-primary border-b border-okx-border">
        <div className="skeleton-loading">
          <div className="loading-message">Loading...</div>
        </div>
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
  
  const formattedPrice = parseFloat(cryptoPrice).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const logoSrc = cryptoLogoPath || defaultCoinLogo;
  
  const price = parseFloat(cryptoPrice) || 0;
  const low24h = (price * 0.97).toFixed(2);
  const high24h = (price * 1.03).toFixed(2);
  const volumeK = ((Math.random() * 100) + 50).toFixed(2);
  const turnoverM = ((price * (Math.random() * 100) + 50) / 1000).toFixed(2);

  return (
    <div className="sub-header md:flex md:justify-between md:items-center md:flex-nowrap flex-wrap bg-okx-primary border-b border-okx-border">
      <div className="coin-info md:w-auto w-full flex items-center justify-between">
        <div className="coin-selector" ref={dropdownRef}>
          <div 
            className="selected-coin flex items-center bg-transparent border-0 rounded-none p-1 cursor-pointer" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="w-6 h-6 md:w-6 md:h-6 mr-2 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center bg-transparent">
              <img 
                src={logoSrc} 
                alt={cryptoSymbol} 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = defaultCoinLogo;
                }}
                className="w-full h-full rounded-full object-cover bg-transparent"
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
      <div className="price-stats w-full md:w-auto overflow-x-auto md:overflow-visible scrollbar-hide flex md:justify-center justify-start pb-2 md:pb-0 pt-2 md:pt-0 gap-5 md:gap-8">
        <div className="stat flex-shrink-0 min-w-[80px] md:min-w-0 md:text-center text-left">
          <div className="value green text-sm md:text-base font-semibold">{formattedPrice}</div>
          <div className="label text-xs md:text-xs text-gray-400 whitespace-nowrap flex md:justify-center justify-start items-center">
            {cryptoName || cryptoSymbol} price <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1 text-[10px]" />
          </div>
          <div className="sub-value text-xs text-gray-500">${formattedPrice}</div>
        </div>
        <div className="stat flex-shrink-0 min-w-[80px] md:min-w-0 md:text-center text-left">
          <div className="value text-sm md:text-base font-semibold">{low24h}</div>
          <div className="label text-xs md:text-xs text-gray-400 whitespace-nowrap">24h low</div>
        </div>
        <div className="stat flex-shrink-0 min-w-[80px] md:min-w-0 md:text-center text-left">
          <div className="value text-sm md:text-base font-semibold">{high24h}</div>
          <div className="label text-xs md:text-xs text-gray-400 whitespace-nowrap">24h high</div>
        </div>
        <div className="stat flex-shrink-0 min-w-[80px] md:min-w-0 md:text-center text-left">
          <div className="value text-sm md:text-base font-semibold">{volumeK}K</div>
          <div className="label text-xs md:text-xs text-gray-400 whitespace-nowrap">24h volume ({cryptoSymbol})</div>
        </div>
        <div className="stat flex-shrink-0 min-w-[80px] md:min-w-0 md:text-center text-left">
          <div className="value text-sm md:text-base font-semibold">{turnoverM}M</div>
          <div className="label text-xs md:text-xs text-gray-400 whitespace-nowrap">24h turnover ({usdtSymbol || 'USDT'})</div>
        </div>
      </div>
      <div className="trading-actions w-full md:w-auto flex items-center justify-start md:justify-end gap-2 mt-2 md:mt-0 pb-1 md:pb-0">
        <button className="data-btn text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2 bg-okx-secondary hover:bg-okx-secondary-hover rounded flex items-center">
          <FontAwesomeIcon icon={faChartLine} className="mr-1.5" /> <span className="whitespace-nowrap">Trading data</span>
        </button>
        <button className="info-btn text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2 bg-okx-secondary hover:bg-okx-secondary-hover rounded flex items-center">
          <FontAwesomeIcon icon={faFileAlt} className="mr-1.5" /> <span className="whitespace-nowrap">Information</span>
        </button>
        <div className="settings w-8 h-8 flex items-center justify-center bg-okx-secondary hover:bg-okx-secondary-hover rounded cursor-pointer ml-1">
          <FontAwesomeIcon icon={faCog} />
        </div>
      </div>
    </div>
  );
};

export default SubHeader;