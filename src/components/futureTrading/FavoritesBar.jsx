import React, { useState } from 'react'

function FavoritesBar({ onSelectCoin }) {
  const [activeCoin, setActiveCoin] = useState('BTC');
  
  const coinPairs = [
    { symbol: 'BTC', pair: 'BTC/USDT' },
    { symbol: 'ETH', pair: 'ETH/USDT' },
    { symbol: 'OKB', pair: 'OKB/USDT' },
    { symbol: 'XRP', pair: 'XRP/USDT' },
    { symbol: 'SOL', pair: 'SOL/USDT' },
    { symbol: 'DOGE', pair: 'DOGE/USDT' },
    { symbol: 'TRX', pair: 'TRX/USDT' },
    { symbol: 'ADA', pair: 'ADA/USDT' }
  ];
  
  const handleCoinSelect = (symbol) => {
    setActiveCoin(symbol);
    if (onSelectCoin) {
      onSelectCoin(symbol);
    }
  };
  
  return (
    <div className="favorites-bar">
      {coinPairs.map((coin) => (
        <div 
          key={coin.symbol}
          className={`favorite-item ${activeCoin === coin.symbol ? 'active' : ''}`}
          onClick={() => handleCoinSelect(coin.symbol)}
        >
          {coin.pair}
        </div>
      ))}
      <div className="favorite-item add">Add to Favorites</div>
    </div>
  )
}

export default FavoritesBar