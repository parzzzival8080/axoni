import React from 'react';

const FavoritesBar = () => {
  return (
    <div className="favorites-bar">
      <div className="favorite-item active">BTC/USDT</div>
      <div className="favorite-item">ETH/USDT</div>
      <div className="favorite-item">OKB/USDT</div>
      <div className="favorite-item">XRP/USDT</div>
      <div className="favorite-item">SOL/USDT</div>
      <div className="favorite-item">DOGE/USDT</div>
      <div className="favorite-item">TRX/USDT</div>
      <div className="favorite-item">ADA/USDT</div>
      <div className="favorite-item add">Add to Favorites</div>
    </div>
  );
};

export default FavoritesBar; 