import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faStar, faPlus, faSync } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = 'https://apiv2.bhtokens.com/api/v1/coins?apikey=A20RqFwVktRxxRqrKBtmi6ud';
const CACHE_KEY = 'favorites_bar_data';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

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
        <span className="ml-1 text-xs py-0.5 px-1 bg-[#F88726] rounded text-white font-medium">10x</span>
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

const FavoritesBar = ({ activeCoinPairId }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const activeId = Number(activeCoinPairId) || 1;
  const navigate = useNavigate();
  const location = useLocation();
  const lastFetchRef = useRef(0);
  
  // Fetch coins with caching
  const fetchCoins = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    
    // Try to get from cache first if not forcing refresh
    if (!forceRefresh) {
      try {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          
          // Use cache if it's less than 5 minutes old
          if (now - timestamp < CACHE_EXPIRY && Array.isArray(data) && data.length > 0) {
            console.log('Using cached favorites data');
            setFavorites(data);
            setLoading(false);
            
            // If cache is getting old (>4 minutes), refresh in background
            if (now - timestamp > CACHE_EXPIRY * 0.8 && now - lastFetchRef.current > CACHE_EXPIRY) {
              console.log('Cache getting stale, refreshing in background');
              lastFetchRef.current = now;
              fetchCoins(true);
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
      const response = await fetch(API_URL);
      const data = await response.json();
      
      // Show only tradable coins, fallback to first 8
      const tradable = data.filter(coin => coin.is_tradable);
      const favorites = tradable.slice(0, 8);
      
      // Save to cache
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: favorites,
          timestamp: now
        }));
      } catch (e) {
        console.error('Error saving to cache:', e);
      }
      
      setFavorites(favorites);
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
    fetchCoins();
    
    // Set up periodic refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchCoins(true);
    }, CACHE_EXPIRY);
    
    return () => clearInterval(refreshInterval);
  }, [fetchCoins]);

  if (loading) return <FavoritesSkeleton />;

  return (
    <div className="flex items-center space-x-4 py-2 px-4 bg-black overflow-x-auto scrollbar-hide relative">
      <span className="text-sm font-medium text-gray-300 whitespace-nowrap">Favorites:</span>
      
      {favorites.length === 0 ? (
        <span className="text-sm text-gray-400">No favorites available</span>
      ) : (
        <>
          {favorites.map((coin) => (
            <FavoriteItem
              key={coin.symbol + coin.pair_name}
              coin={coin}
              isActive={coin.coin_pair === activeId}
              onClick={() => {
                // Update URL param for coin_pair_id (preserve other params)
                const params = new URLSearchParams(location.search);
                params.set('coin_pair_id', coin.coin_pair);
                navigate({ search: params.toString() });
              }}
            />
          ))}
        </>
      )}
      
      {/* Refresh button */}
      <button 
        onClick={() => fetchCoins(true)} 
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