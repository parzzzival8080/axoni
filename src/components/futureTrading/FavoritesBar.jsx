import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const API_URL = 'https://apiv2.bhtokens.com/api/v1/coins?apikey=A20RqFwVktRxxRqrKBtmi6ud';

const FavoriteItem = ({ coin, isActive, onClick }) => {
  const priceChange = parseFloat(coin.price_change_24h?.toString() || '0');
  const changeClass = priceChange > 0 ? 'green' : priceChange < 0 ? 'red' : '';
  const changeSign = priceChange > 0 ? '+' : '';
  return (
    <div
      className={`favorite-item-atomic${isActive ? ' active' : ''}`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <img src={coin.logo_path} alt={coin.symbol} className="fav-coin-logo" />
      <span className="fav-pair">{coin.symbol}/{coin.pair_name} </span>
      <span className={`fav-change ${changeClass}`}>{changeSign}{priceChange.toFixed(2)}%</span>
      <span className="fav-price">{parseFloat(coin.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
    </div>
  );
};

const FavoritesSkeleton = () => (
  <div className="favorites-bar-atomic">
    <span className="fav-label">Favorites:</span>
    {Array.from({ length: 8 }).map((_, i) => (
      <div className="favorite-item-atomic fav-skeleton" key={i}>
        <span className="skeleton-logo" />
        <span className="skeleton-text short" />
        <span className="skeleton-text" />
        <span className="skeleton-text" />
      </div>
    ))}
  </div>
);

const FavoritesBar = ({ activeCoinPairId, onCoinSelect }) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const activeId = Number(activeCoinPairId) || 1;
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch coins on mount
  useEffect(() => {
    console.log('FavoritesBar: Mounting component, fetching coins');
    fetchCoins();
  }, []);

  // Log when activeCoinPairId changes
  useEffect(() => {
    console.log('FavoritesBar: activeCoinPairId changed to', activeCoinPairId);
  }, [activeCoinPairId]);

  async function fetchCoins() {
    console.log('FavoritesBar: Fetching coins from API');
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      console.log('FavoritesBar: Received coins data:', data);
      
      // Filter tradable coins
      const tradable = data.filter(coin => coin.is_tradable);
      
      // Sort coins to ensure BTC is first
      const sortedCoins = [...tradable].sort((a, b) => {
        // BTC always comes first
        if (a.symbol === 'BTC') return -1;
        if (b.symbol === 'BTC') return 1;
        
        // Then sort by coin_pair for consistency
        return a.coin_pair - b.coin_pair;
      });
      
      console.log('FavoritesBar: Sorted coins with BTC first:', sortedCoins.map(c => c.symbol).join(', '));
      
      // Take the first 8 coins
      setFavorites(sortedCoins.slice(0, 8));
    } catch (e) {
      console.error('FavoritesBar: Error fetching coins:', e);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }

  const handleCoinSelect = (coin) => {
    console.log(`FavoritesBar: Selecting coin: ${coin.symbol}, coin_pair: ${coin.coin_pair}, coin_id: ${coin.coin_id}`);
    
    // Update URL params
    const params = new URLSearchParams(location.search);
    params.set('coin_pair_id', coin.coin_pair);
    navigate({ search: params.toString() });
    
    // Call the parent's onCoinSelect callback if provided
    if (typeof onCoinSelect === 'function') {
      onCoinSelect(coin.coin_pair);
    }
  };

  if (loading) return <FavoritesSkeleton />;

  return (
    <div className="favorites-bar-atomic">
      <span className="fav-label">Favorites:</span>
      {favorites.length === 0 ? (
        <span className="fav-empty">No favorites available</span>
      ) : (
        favorites.map((coin) => (
          <FavoriteItem
            key={coin.symbol + coin.pair_name}
            coin={coin}
            isActive={coin.coin_pair === activeId}
            onClick={() => handleCoinSelect(coin)}
          />
        ))
      )}
    </div>
  );
};

export default FavoritesBar;