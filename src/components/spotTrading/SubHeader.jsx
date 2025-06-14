import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as farStar, faStar as fasStar } from '@fortawesome/free-regular-svg-icons';
import { faStar as solidStar } from '@fortawesome/free-solid-svg-icons';
import { 
  faExternalLinkAlt, 
  faChartLine, 
  faCog, 
  faChevronDown, 
  faSearch,
  faTimes 
} from '@fortawesome/free-solid-svg-icons';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';
import defaultCoinLogo from '../../assets/coin/btc.webp';
import './SubHeader.css';

const SubHeader = ({ cryptoData, coinPairId, availableCoins, onCoinSelect, loading, error, statsLoading, pricePollingError, isPolling }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFavoriteModal, setShowFavoriteModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  // Handle click outside to close dropdown and modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowFavoriteModal(false);
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

  // Check if coin is favorited
  const checkCoinFavoriteStatus = useCallback(async () => {
    try {
      let uid = localStorage.getItem('uid') || localStorage.getItem('userId') || '1';
      const coin_id = coinPairId || cryptoData?.coin_pair_id || cryptoData?.id;
      
      if (!coin_id) return;

      // Get user wallets to check if current coin is in favorites
      const response = await fetch(`https://apiv2.bhtokens.com/api/v1/user-wallets/${uid}?apikey=A20RqFwVktRxxRqrKBtmi6ud`, {
        method: 'GET'
      });

      if (response.ok) {
        const walletsData = await response.json();
        const userWallets = walletsData["0"] || walletsData[0] || walletsData || [];
        
        // Find the current coin in the wallets and check if it's favorited
        const currentCoinWallet = userWallets.find(wallet => wallet.coin_id == coin_id);
        setIsFavorite(currentCoinWallet?.is_favorite || false);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  }, [coinPairId, cryptoData]);

  // Handle favorite toggle
  const handleFavoriteClick = useCallback((e) => {
    e.stopPropagation(); // Prevent dropdown from opening
    setShowFavoriteModal(true);
  }, []);

  // Handle add to favorites
  const handleAddToFavorites = useCallback(async () => {
    setIsUpdatingFavorite(true);
    try {
      let uid = localStorage.getItem('uid') || localStorage.getItem('userId') || '1';
      const coin_id = coinPairId || cryptoData?.coin_pair_id || cryptoData?.id;
      
      if (!coin_id) {
        console.error('No coin ID available for favorites');
        setIsUpdatingFavorite(false);
        return;
      }

            const response = await fetch('https://apiv2.bhtokens.com/api/v1/set-favorite?apikey=A20RqFwVktRxxRqrKBtmi6ud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: uid,
          coin_id: coin_id
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Successfully added to favorites:', result);
        setIsFavorite(true);
        setShowFavoriteModal(false);
        
        // Notify other components about the favorite change
        window.dispatchEvent(new CustomEvent('favoriteChanged', { 
          detail: { action: 'add', coinId: coin_id } 
        }));
        localStorage.setItem('favoriteChanged', Date.now().toString());
      } else {
        console.error('Failed to add to favorites:', response.statusText);
        // Still update UI optimistically
        setIsFavorite(true);
        setShowFavoriteModal(false);
        
        // Still notify in case of optimistic update
        window.dispatchEvent(new CustomEvent('favoriteChanged', { 
          detail: { action: 'add', coinId: coin_id } 
        }));
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
      // Still update UI optimistically
      setIsFavorite(true);
      setShowFavoriteModal(false);
    } finally {
      setIsUpdatingFavorite(false);
    }
  }, [cryptoData, coinPairId]);

  // Handle remove from favorites - Under Development
  const handleRemoveFromFavorites = useCallback(async () => {
    setIsUpdatingFavorite(true);
    
    // Show "Under Development" message
    setTimeout(() => {
      alert('Remove from favorites feature is under development.');
      setIsUpdatingFavorite(false);
      setShowFavoriteModal(false);
    }, 500);
  }, []);

  // Check favorite status when coin changes
  useEffect(() => {
    if (cryptoData && coinPairId) {
      checkCoinFavoriteStatus();
    }
  }, [cryptoData, coinPairId, checkCoinFavoriteStatus]);

  // Defensive: extract live price and price change from cryptoData
  const livePrice = cryptoData?.price ?? cryptoData?.cryptoPrice ?? 0;
  const liveChange = cryptoData?.price_change_24h ?? cryptoData?.priceChange24h ?? 0;

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
            style={{display: 'flex', alignItems: 'center'}}
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
        
        {/* Separate Star Icon */}
        <div 
          className="favorite-star" 
          style={{
            marginLeft: '12px', 
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '4px',
            transition: 'background-color 0.2s, color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={handleFavoriteClick}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#1a1a1a';
            e.currentTarget.style.color = '#00b574';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = isFavorite ? '#ffd700' : '#666';
          }}
        >
          <FontAwesomeIcon 
            icon={isFavorite ? solidStar : farStar} 
            style={{
              fontSize: '18px',
              color: isFavorite ? '#ffd700' : '#666'
            }}
          />
        </div>
      </div>
      
      {/* Favorites Modal */}
      {showFavoriteModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
                     <div 
             ref={modalRef}
             className="favorites-modal"
             style={{
               backgroundColor: '#1a1a1a',
               borderRadius: '8px',
               padding: '24px',
               minWidth: '400px',
               maxWidth: '90vw',
               border: '1px solid #333',
               boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)'
             }}
           >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h3 style={{
                color: '#fff',
                fontSize: '18px',
                fontWeight: '600',
                margin: 0
              }}>
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </h3>
              <button
                onClick={() => setShowFavoriteModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#666',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = '#fff'}
                onMouseOut={(e) => e.target.style.color = '#666'}
              >
                <FontAwesomeIcon icon={faTimes} style={{fontSize: '16px'}} />
              </button>
            </div>
            
                         <div 
               className="favorites-modal-coin"
               style={{
                 display: 'flex',
                 alignItems: 'center',
                 marginBottom: '24px'
               }}
             >
                             <div 
                 className="w-12 h-12 mr-4 flex items-center justify-center rounded-full overflow-hidden bg-gray-700 flex-shrink-0"
                 style={{
                   width: '48px !important',
                   height: '48px !important',
                   borderRadius: '50% !important',
                   overflow: 'hidden !important',
                   display: 'flex !important',
                   alignItems: 'center !important',
                   justifyContent: 'center !important'
                 }}
               >
                 <img 
                   src={logoSrc} 
                   alt={cryptoSymbol} 
                   className="w-full h-full object-cover rounded-full"
                   style={{ 
                     width: '48px !important',
                     height: '48px !important',
                     borderRadius: '50% !important',
                     objectFit: 'cover !important',
                     display: 'block !important'
                   }}
                   onError={(e) => {
                     e.target.onerror = null; 
                     e.target.src = defaultCoinLogo;
                   }}
                 />
               </div>
              <div>
                <div style={{
                  color: '#fff',
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '4px'
                }}>
                  {cryptoSymbol}/{usdtSymbol}
                </div>
                <div style={{
                  color: '#666',
                  fontSize: '14px'
                }}>
                  {cryptoName}
                </div>
              </div>
            </div>
            
            <div style={{
              color: '#ccc',
              fontSize: '14px',
              lineHeight: '1.5',
              marginBottom: '24px'
            }}>
              {isFavorite 
                ? `Remove ${cryptoSymbol}/${usdtSymbol} from your favorites list?`
                : `Add ${cryptoSymbol}/${usdtSymbol} to your favorites for quick access.`
              }
            </div>
            
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowFavoriteModal(false)}
                style={{
                  background: 'none',
                  border: '1px solid #333',
                  color: '#ccc',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.target.style.borderColor = '#555';
                  e.target.style.color = '#fff';
                }}
                onMouseOut={(e) => {
                  e.target.style.borderColor = '#333';
                  e.target.style.color = '#ccc';
                }}
              >
                Cancel
              </button>
                             <button
                 onClick={isFavorite ? handleRemoveFromFavorites : handleAddToFavorites}
                 disabled={isUpdatingFavorite}
                 style={{
                   background: isUpdatingFavorite ? '#666' : (isFavorite ? '#f23645' : '#00b574'),
                   border: 'none',
                   color: '#fff',
                   padding: '10px 20px',
                   borderRadius: '4px',
                   cursor: isUpdatingFavorite ? 'not-allowed' : 'pointer',
                   fontSize: '14px',
                   fontWeight: '500',
                   transition: 'background-color 0.2s',
                   opacity: isUpdatingFavorite ? 0.7 : 1,
                   display: 'flex',
                   alignItems: 'center',
                   gap: '8px'
                 }}
                 onMouseOver={(e) => {
                   if (!isUpdatingFavorite) {
                     e.target.style.backgroundColor = isFavorite ? '#d63031' : '#00a65a';
                   }
                 }}
                 onMouseOut={(e) => {
                   if (!isUpdatingFavorite) {
                     e.target.style.backgroundColor = isFavorite ? '#f23645' : '#00b574';
                   }
                 }}
               >
                 {isUpdatingFavorite && (
                   <div style={{
                     width: '14px',
                     height: '14px',
                     border: '2px solid #fff',
                     borderTop: '2px solid transparent',
                     borderRadius: '50%',
                     animation: 'spin 1s linear infinite'
                   }}></div>
                 )}
                 {isUpdatingFavorite 
                   ? (isFavorite ? 'Removing...' : 'Adding...') 
                   : (isFavorite ? 'Remove' : 'Add to Favorites')
                 }
               </button>
            </div>
          </div>
        </div>
      )}
      
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
                {livePrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
              </span>
              {/* Price polling status indicator */}
              {isPolling && !pricePollingError && (
                <span style={{marginLeft:8}} title="Live price updating">
                  <i className="fas fa-sync fa-spin" style={{color:'#aaa', fontSize:'16px'}}></i>
                </span>
              )}
              {pricePollingError && (
                <span style={{marginLeft:8}} title={pricePollingError}>
                  <i className="fas fa-exclamation-triangle" style={{color:'#f23645', fontSize:'16px'}}></i>
                </span>
              )}
            </div>
          </div>
          <div className="label">
            {cryptoName} price <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1" />
          </div>
        </div>
        <div className="stat">
          <div className="value">
            <span className={`text ${priceChange24h >= 0 ? 'text-[#00b574]' : 'text-[#f23645]'}`}> 
              {liveChange >= 0 ? '+' : ''}{liveChange?.toFixed(2)}%
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
    
      
      <div className="trading-actions">
       
      </div>
    </div>
  );
};

export default React.memo(SubHeader);