import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faSpinner } from '@fortawesome/free-solid-svg-icons';

/**
 * Individual favorite item component
 */
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
      <img 
        src={coin.logo_path} 
        alt={coin.symbol} 
        className="fav-coin-logo"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=024';
        }}
      />
      <span className="fav-pair">{coin.symbol}/{coin.pair_name}</span>
      <span className={`fav-change ${changeClass}`}>{changeSign}{priceChange.toFixed(2)}%</span>
      <span className="fav-price">{parseFloat(coin.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
    </div>
  );
};

/**
 * Loading skeleton for favorites bar
 */
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

/**
 * Favorites Bar Component
 * Displays a horizontal scrollable list of favorite/tradable coins
 */
const FavoritesBar = ({ activeCoinPairId, tradableCoins = [], onCoinSelect }) => {
  const activeId = Number(activeCoinPairId) || 1;
  const navigate = useNavigate();
  const location = useLocation();
  
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

  // Show loading state if no coins available
  if (!tradableCoins || tradableCoins.length === 0) {
    return <FavoritesSkeleton />;
  }

  return (
    <div className="favorites-bar-atomic">
      <span className="fav-label">Favorites:</span>
      {tradableCoins.length === 0 ? (
        <span className="fav-empty">No favorites available</span>
      ) : (
        // Display up to 8 coins
        tradableCoins.slice(0, 8).map((coin) => (
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