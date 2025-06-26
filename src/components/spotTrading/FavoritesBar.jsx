import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faStar, faPlus, faSync, faHeart, faEllipsisH, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';

const USER_WALLETS_API_URL = 'https://api.kinecoin.co/api/v1/user-wallets';
const API_KEY = 'A20RqFwVktRxxRqrKBtmi6ud';
const CACHE_KEY = 'favorites_bar_data';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

const FavoriteItem = ({ coin, isActive, onClick, compact = false }) => {
  // Handle wallet data structure from user-wallets API
  const symbol = coin.crypto_symbol;
  const pairName = 'USDT'; // All pairs are against USDT
  const logoPath = coin.logo_path;
  const price = parseFloat(coin.price) || 0;
  const priceChange = parseFloat(coin.price_change_24h?.toString() || '0');
  const coinId = coin.coin_id;
  
  const changeClass = priceChange > 0 ? 'text-green-500' : priceChange < 0 ? 'text-red-500' : 'text-gray-400';
  const changeSign = priceChange > 0 ? '+' : '';
  const [imageError, setImageError] = useState(false);
  
  // Handle image loading error
  const handleImageError = () => setImageError(true);
  
  if (compact) {
    return (
      <div className="flex items-center space-x-2 w-full">
        {/* Coin Logo with Fallback */}
        {imageError ? (
          <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {symbol?.charAt(0) || 'C'}
          </div>
        ) : (
          <img 
            src={logoPath} 
            alt={symbol} 
            className="w-5 h-5 rounded-full object-cover flex-shrink-0" 
            onError={handleImageError}
            loading="lazy"
          />
        )}
        
        {/* Pair Name and Price */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center text-sm font-medium text-white">
            {symbol}/{pairName}
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className={`font-medium ${changeClass}`}>
              {changeSign}{priceChange.toFixed(2)}%
            </span>
            <span className="text-gray-400">
              {parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
            </span>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div
      className={`flex items-center space-x-3 py-2 px-3 transition-colors duration-150 hover:bg-[#131722] ${isActive ? 'border-b-2 border-blue-500' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Coin Logo with Fallback */}
      {imageError ? (
        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
          {symbol?.charAt(0) || 'C'}
        </div>
      ) : (
        <img 
          src={logoPath} 
          alt={symbol} 
          className="w-6 h-6 rounded-full object-cover" 
          onError={handleImageError}
          loading="lazy"
        />
      )}
      
      {/* Pair Name */}
      <div className="flex items-center text-sm font-medium text-white">
        {symbol}/{pairName}
        <span className="ml-1 text-xs py-0.5 px-1 bg-[#F88726] rounded text-white font-medium">10x</span>
      </div>
      
  
      
      {/* Current Price */}
      <span className="text-sm font-medium text-white">
       ${parseFloat(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
      </span>
    </div>
  );
};

// --- Skeleton Loader for Favorites ---
const FavoritesSkeleton = () => (
  <div className="flex items-center space-x-4 py-2 px-4 bg-black overflow-x-auto scrollbar-hide">
    <span className="text-sm font-medium text-gray-300 whitespace-nowrap">Favorites:</span>
    {Array.from({ length: 8 }).map((_, i) => (
      <div className="flex items-center space-x-3 py-2 px-3 animate-pulse" key={i}>
        <div className="w-6 h-6 rounded-full bg-gray-800" />
        <div className="h-4 w-20 bg-gray-800 rounded" />
        <div className="h-4 w-12 bg-gray-800 rounded" />
        <div className="h-4 w-16 bg-gray-800 rounded" />
      </div>
    ))}
  </div>
);

// --- Empty Favorites Component ---
const EmptyFavorites = () => (
  <div className="flex items-center justify-center py-4 px-6 bg-black">
    <div className="flex items-center space-x-3 text-gray-400">
      <FontAwesomeIcon icon={faHeart} className="w-5 h-5 text-gray-500" />
      <span className="text-sm font-medium">No favorites yet</span>
      <div className="flex items-center space-x-2 ml-4">
        <FontAwesomeIcon icon={faStar} className="w-4 h-4 text-yellow-500" />
        <span className="text-xs text-gray-500">Click the star icon to add coins to your favorites</span>
      </div>
    </div>
  </div>
);

// --- More Modal Component ---
const MoreModal = ({ remainingCoins, activeId, onCoinSelect, isOpen, onClose }) => {
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      style={{ zIndex: 2147483647 }}
    >
      <div 
        ref={modalRef}
        className="bg-[#0c0c0c] border border-[#2a2a2a] rounded-lg shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <h3 className="text-white font-semibold text-lg">More Favorites</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded"
          >
            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="max-h-96 overflow-y-auto">
          {remainingCoins.map((coin) => (
            <div
              key={coin.crypto_symbol + 'USDT'}
              className={`flex items-center space-x-3 py-3 px-4 cursor-pointer transition-colors duration-150 hover:bg-[#131722] border-b border-[#1a1a1a] last:border-b-0 ${
                coin.coin_id === activeId ? 'bg-[#131722] border-l-4 border-blue-500' : ''
              }`}
              onClick={() => {
                onCoinSelect(coin);
                onClose();
              }}
            >
              <FavoriteItem coin={coin} isActive={coin.coin_id === activeId} onClick={() => {}} compact={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- More Button Component ---
const MoreButton = ({ remainingCoins, activeId, onCoinSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center space-x-2 py-2 px-3 transition-colors duration-150 hover:bg-[#131722] text-gray-400 hover:text-white rounded"
        title={`${remainingCoins.length} more favorites`}
      >
        <FontAwesomeIcon icon={faEllipsisH} className="w-4 h-4" />
        <span className="text-sm font-medium">+{remainingCoins.length}</span>
      </button>

      <MoreModal
        remainingCoins={remainingCoins}
        activeId={activeId}
        onCoinSelect={onCoinSelect}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

const FavoritesBar = ({ activeCoinPairId }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const activeId = Number(activeCoinPairId) || 1;
  const navigate = useNavigate();
  const location = useLocation();
  const lastFetchRef = useRef(0);
  
  // Constants for display limits
  const MAX_VISIBLE_COINS = 4;

  // Function to clear favorites cache
  const clearFavoritesCache = useCallback(() => {
    try {
      localStorage.removeItem(CACHE_KEY);
      console.log('Favorites cache cleared');
    } catch (e) {
      console.error('Error clearing favorites cache:', e);
    }
  }, []);
  
  // Fetch user's favorite coins
  const fetchFavorites = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Try to get from cache first if not forcing refresh
    if (!forceRefresh) {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          
          // Use cache if it's less than 5 minutes old AND we have data
          if (now - timestamp < CACHE_EXPIRY && Array.isArray(data)) {
            console.log('Using cached favorites data:', data.length, 'items');
            setFavorites(data);
            setLoading(false);
            
            // If cache is getting old (>4 minutes), refresh in background
            if (now - timestamp > CACHE_EXPIRY * 0.8 && now - lastFetchRef.current > CACHE_EXPIRY) {
              console.log('Cache getting stale, refreshing in background');
              lastFetchRef.current = now;
              fetchFavorites(true);
            }
            
            return;
          }
        }
      } catch (e) {
        console.error('Error reading from cache:', e);
      }
    }
    
    // If we're here, we need to fetch fresh data
    if (forceRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      console.log('Fetching fresh favorites data from API...');
      
      // Get user ID
      const uid = localStorage.getItem('uid') || localStorage.getItem('userId') || '1';
      console.log('Using UID:', uid);
      
      // Get user wallets from the API
      const walletsResponse = await fetch(`${USER_WALLETS_API_URL}/${uid}?apikey=${API_KEY}`);
      const walletsData = await walletsResponse.json();
      
      console.log('Raw wallets response:', walletsData);
      
      // Extract wallets array from the response (API returns {0: [wallets]})
      const userWallets = walletsData["0"] || walletsData[0] || walletsData || [];
      
      console.log('Total wallets received:', userWallets.length);
      
      // Filter wallets that are marked as favorites
      const favoriteCoins = userWallets.filter(wallet => wallet.is_favorite === true);
      
      console.log('Favorite coins found:', favoriteCoins.length, favoriteCoins.map(c => c.crypto_symbol || c.symbol));
      
      // Save to cache
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: favoriteCoins,
          timestamp: now
        }));
        console.log('Favorites cached successfully');
      } catch (e) {
        console.error('Error saving to cache:', e);
      }
      
      setFavorites(favoriteCoins);
    } catch (e) {
      console.error('Error fetching favorites:', e);
      // Don't clear existing favorites on refresh error
      if (!forceRefresh) {
        setFavorites([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      lastFetchRef.current = now;
    }
  }, []);
  
  // Initial load
  useEffect(() => {
    fetchFavorites();
    
    // Set up periodic refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchFavorites(true);
    }, CACHE_EXPIRY);
    
    return () => clearInterval(refreshInterval);
  }, [fetchFavorites]);

  // Listen for favorite changes from other components
  useEffect(() => {
    const handleFavoriteChange = () => {
      console.log('Favorite change detected, refreshing favorites...');
      clearFavoritesCache();
      fetchFavorites(true);
    };

    // Listen for custom events
    window.addEventListener('favoriteChanged', handleFavoriteChange);
    
    // Also listen for storage changes (in case of multiple tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === 'favoriteChanged') {
        handleFavoriteChange();
      }
    });

    return () => {
      window.removeEventListener('favoriteChanged', handleFavoriteChange);
      window.removeEventListener('storage', handleFavoriteChange);
    };
  }, [clearFavoritesCache, fetchFavorites]);

  if (loading) return <FavoritesSkeleton />;

  // Show empty state if no favorites
  if (favorites.length === 0) {
    return <EmptyFavorites />;
  }

  // Split favorites into visible and remaining
  const visibleFavorites = favorites.slice(0, MAX_VISIBLE_COINS);
  const remainingFavorites = favorites.slice(MAX_VISIBLE_COINS);
  
  // Handle coin selection
  const handleCoinSelect = (coin) => {
    const params = new URLSearchParams(location.search);
    params.set('coin_pair_id', coin.coin_id);
    navigate({ search: params.toString() });
  };

  return (
    <div className="favorites-bar-container flex items-center space-x-4 py-2 px-4 bg-black overflow-x-auto scrollbar-hide relative">
      <span className="text-sm font-medium text-gray-300 whitespace-nowrap">Favorites:</span>
      
      {/* Show first 4 favorites */}
      {visibleFavorites.map((coin) => (
        <FavoriteItem
          key={coin.crypto_symbol + 'USDT'}
          coin={coin}
          isActive={coin.coin_id === activeId}
          onClick={() => handleCoinSelect(coin)}
        />
      ))}
      
      {/* Show "More" button if there are more than 4 favorites */}
      {remainingFavorites.length > 0 && (
        <MoreButton
          remainingCoins={remainingFavorites}
          activeId={activeId}
          onCoinSelect={handleCoinSelect}
        />
      )}
      
      {/* Refresh button */}
      <button 
        onClick={() => fetchFavorites(true)} 
        disabled={refreshing}
        className="ml-auto flex-shrink-0 text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-[#131722]"
        title="Refresh favorites"
      >
        <FontAwesomeIcon 
          icon={faSync} 
          className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} 
        />
      </button>
    </div>
  );
};

// Add CSS for scrollbar hiding
const style = document.createElement('style');
style.textContent = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Only add style once when in browser environment
if (typeof document !== 'undefined' && !document.getElementById('favorites-bar-style')) {
  style.id = 'favorites-bar-style';
  document.head.appendChild(style);
}

export default FavoritesBar;