import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faStar, faPlus } from '@fortawesome/free-solid-svg-icons';

const API_URL = 'https://apiv2.bhtokens.com/api/v1/coins?apikey=A20RqFwVktRxxRqrKBtmi6ud';

const FavoriteItem = ({ coin, isActive }) => {
  const priceChange = parseFloat(coin.price_change_24h?.toString() || '0');
  const changeClass = priceChange > 0 ? 'green' : priceChange < 0 ? 'red' : '';
  const changeSign = priceChange > 0 ? '+' : '';
  return (
    <div className={`favorite-item-atomic${isActive ? ' active' : ''}`}>
      <img src={coin.logo_path} alt={coin.symbol} className="fav-coin-logo" />
      <span className="fav-pair">{coin.symbol}/{coin.pair_name} <span className="fav-leverage">10x</span></span>
      <span className={`fav-change ${changeClass}`}>{changeSign}{priceChange.toFixed(2)}%</span>
      <span className="fav-price">{parseFloat(coin.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
    </div>
  );
};

const FavoritesBar = ({ activeCoinPairId }) => {
  const [favorites, setFavorites] = useState([]);
  const activeId = Number(activeCoinPairId) || 1;

  useEffect(() => {
    async function fetchCoins() {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        // Show only tradable coins, fallback to first 8
        const tradable = data.filter(coin => coin.is_tradable);
        setFavorites(tradable.slice(0, 8));
      } catch (e) {
        setFavorites([]);
      }
    }
    fetchCoins();
  }, []);

  return (
    <div className="favorites-bar-atomic">
      <span className="fav-label">Favorites:</span>
      {favorites.length === 0 ? (
        <span className="fav-empty">No favorites available</span>
      ) : (
        favorites.map((coin) => (
          <FavoriteItem key={coin.symbol + coin.pair_name} coin={coin} isActive={coin.coin_pair === activeId} />
        ))
      )}
    </div>
  );
};

export default FavoritesBar;