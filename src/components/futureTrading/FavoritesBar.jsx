import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp, faStar, faPlus } from '@fortawesome/free-solid-svg-icons';

const FavoritesBar = ({ activeCoinPairId, availableCoins = [], onCoinSelect }) => {
  const [showAllCoins, setShowAllCoins] = useState(false);
  
  // Convert to number for comparison
  const activeId = Number(activeCoinPairId) || 1;
  
  // Use the coins from the API if available, otherwise use the hardcoded list
  const allCoinPairs = availableCoins.length > 0 
    ? availableCoins.filter(coin => coin.is_tradable).map(coin => ({
        id: coin.coin_pair,
        symbol: `${coin.symbol}/${coin.pair_name}`,
        logo: coin.logo_path
      }))
    : [
        { id: 1, symbol: 'BTC/USDT' },
        { id: 4, symbol: 'ETH/USDT' },
        { id: 13, symbol: 'XRP/USDT' },
        { id: 15, symbol: 'SOL/USDT' },
        { id: 16, symbol: 'DOGE/USDT' },
        { id: 14, symbol: 'ADA/USDT' },
        { id: 17, symbol: 'PEPE/USDT' },
        { id: 19, symbol: 'NAI/USDT' },
        { id: 20, symbol: 'PNM/USDT' },
        { id: 21, symbol: 'COL/USDT' },
        { id: 22, symbol: 'ONT/USDT' },
        { id: 23, symbol: 'CHD/USDT' },
        { id: 24, symbol: 'THAI/USDT' },
        { id: 25, symbol: 'JAM/USDT' },
        { id: 26, symbol: 'MOS/USDT' },
        { id: 3, symbol: 'USDC/USDT' }
      ];
  
  // Ensure the active coin is always shown, even if it's not in the top 10
  const activeCoin = allCoinPairs.find(pair => pair.id === activeId);
  
  // Display logic - ensure active coin is in the first 10
  let coinsToDisplay = [...allCoinPairs];
  
  if (!showAllCoins && coinsToDisplay.length > 10) {
    // If active coin exists and is not in the first 9 coins
    const activeIndex = coinsToDisplay.findIndex(pair => pair.id === activeId);
    
    if (activeIndex >= 0 && activeIndex >= 9) {
      // Remove the active coin from its current position
      const [activeCoinItem] = coinsToDisplay.splice(activeIndex, 1);
      // Insert it at position 9 (making it the 10th item)
      coinsToDisplay.splice(9, 0, activeCoinItem);
    }
    
    // Only show first 10 coins
    coinsToDisplay = coinsToDisplay.slice(0, 10);
  }
  
  const hasMoreCoins = allCoinPairs.length > 10;
  
  // Handle coin selection
  const handleCoinClick = (coinPairId, e) => {
    // Only call onCoinSelect if it's provided and the coin is not already active
    if (onCoinSelect && coinPairId !== activeId) {
      e.preventDefault(); // Prevent default Link behavior
      onCoinSelect(coinPairId);
    }
  };
  
  return (
    <div className="favorites-bar">
      {coinsToDisplay.map((pair) => (
        <Link 
          key={pair.id}
          to={`/future-trading?coin_pair_id=${pair.id}`} 
          className={`favorite-item ${activeId === pair.id ? 'active' : ''}`}
          onClick={(e) => handleCoinClick(pair.id, e)}
        >
          {pair.symbol}
        </Link>
      ))}
      
      {hasMoreCoins && (
        <div 
          className="favorite-item more"
          onClick={() => setShowAllCoins(!showAllCoins)}
        >
          {showAllCoins ? 'Show Less' : 'More'} <FontAwesomeIcon icon={showAllCoins ? faChevronUp : faChevronDown} />
        </div>
      )}
      
      <div className="favorite-item add">
        Add to favorites <FontAwesomeIcon icon={faStar} />
      </div>
    </div>
  );
};

export default FavoritesBar;