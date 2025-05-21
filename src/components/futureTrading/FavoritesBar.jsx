import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faSpinner, faSync } from '@fortawesome/free-solid-svg-icons';

// Cache key for local storage
const CACHE_KEY = 'future_favorites_bar_data';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;
/**
 * Individual favorite item component
 */
const FavoriteItem = ({ coin, isActive, onClick }) => {
  const priceChange = parseFloat(coin.price_change_24h?.toString() || '0');
  const changeClass = priceChange > 0 ? 'text-green-500' : priceChange < 0 ? 'text-red-500' : 'text-gray-400';
  const changeSign = priceChange > 0 ? '+' : '';
  const [imageError, setImageError] = useState(false);
  
  // Handle image loading error
  const handleImageError = () => setImageError(true);
  
  return (
    <div
      className={`flex items-center space-x-3 py-2 px-3 transition-colors duration-150 hover:bg-[#131722] ${isActive ? 'border-b-2 border-blue-500' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Coin Logo with Fallback */}
      {imageError ? (
        <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-white">
          {coin.symbol.charAt(0)}
        </div>
      ) : (
        <img 
          src={coin.logo_path} 
          alt={coin.symbol} 
          className="w-6 h-6 rounded-full object-cover" 
          onError={handleImageError}
          loading="lazy"
        />
      )}
      
      {/* Pair Name */}
      <div className="flex items-center text-sm font-medium text-white">
        {coin.symbol}/{coin.pair_name}
      </div>
      
      {/* Price Change */}
      <span className={`text-sm font-medium ${changeClass}`}>
        {changeSign}{priceChange.toFixed(2)}%
      </span>
      
      {/* Current Price */}
      <span className="text-sm font-medium text-white">
        {parseFloat(coin.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
      </span>
    </div>
  );
};

/**
 * Loading skeleton for favorites bar
 */
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

/**
 * Favorites Bar Component
 * Displays a horizontal scrollable list of favorite/tradable coins
 */
const FavoritesBar = ({ activeCoinPairId, tradableCoins = [], onCoinSelect }) => {
  const [favorites, setFavorites] = useState(tradableCoins);
  const [loading, setLoading] = useState(tradableCoins.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const activeId = Number(activeCoinPairId) || 1;
  const navigate = useNavigate();
  const location = useLocation();
  const lastFetchRef = useRef(0);
  
  // Cache the tradable coins
  useEffect(() => {
    if (tradableCoins && tradableCoins.length > 0) {
      setFavorites(tradableCoins);
      setLoading(false);
      
      // Save to cache
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: tradableCoins,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Error saving to cache:', e);
      }
    } else {
      // Try to load from cache if no tradable coins provided
      loadFromCache();
    }
  }, [tradableCoins]);
  
  // Load coins from cache
  const loadFromCache = useCallback(() => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = Date.now();
        
        // Use cache if it's less than 5 minutes old
        if (now - timestamp < CACHE_EXPIRY && Array.isArray(data) && data.length > 0) {
          console.log('Using cached future favorites data');
          setFavorites(data);
          setLoading(false);
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error('Error loading from cache:', e);
      return false;
    }
  }, []);
  
  // Handle coin selection
  const handleCoinSelect = (coin) => {
    console.log(`Selecting coin: ${coin.symbol}, coin_pair: ${coin.coin_pair}, coin_id: ${coin.coin_id}`);
    
    // Update URL params
    const params = new URLSearchParams(location.search);
    params.set('coin_pair_id', coin.coin_pair);
    navigate({ search: params.toString() });
    
    // Call the parent's onCoinSelect callback
    if (typeof onCoinSelect === 'function') {
      onCoinSelect(coin.coin_pair);
    }
  };
  
  // Refresh favorites (for manual refresh button)
  const refreshFavorites = () => {
    setRefreshing(true);
    // This would typically call an API, but in this case we just simulate a refresh
    setTimeout(() => {
      loadFromCache();
      setRefreshing(false);
    }, 500);
  };

  // Show loading state if no coins available
  if (loading) {
    return <FavoritesSkeleton />;
  }

  return (
    <div className="flex items-center space-x-4 py-2 px-4 bg-black overflow-x-auto scrollbar-hide relative">
      <span className="text-sm font-medium text-gray-300 whitespace-nowrap">Favorites:</span>
      
      {favorites.length === 0 ? (
        <span className="text-sm text-gray-400">No favorites available</span>
      ) : (
        <>
          {/* Display up to 8 coins */}
          {favorites.slice(0, 8).map((coin) => (
            <FavoriteItem
              key={coin.symbol + coin.pair_name}
              coin={coin}
              isActive={coin.coin_pair === activeId}
              onClick={() => handleCoinSelect(coin)}
            />
          ))}
        </>
      )}
      
      {/* Refresh button */}
      <button 
        onClick={refreshFavorites} 
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
if (typeof document !== 'undefined' && !document.getElementById('future-favorites-bar-style')) {
  style.id = 'future-favorites-bar-style';
  document.head.appendChild(style);
}

export default FavoritesBar;