import React from 'react';
import laptop from '../../assets/homepage/laptop.png';
import background from '../../assets/homepage/background.png';

const TradingGame = () => {
  return (
    <div
      className="relative py-20"
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '600px',
        width: '100%',
        height: '100vh'
      }}
    >
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Level up your trading game
        </h2>
        <p className="text-gray-300 mb-8">
          Access low costs, high-speed transactions, powerful developer tools, and more.
        </p>
        <div className="flex justify-center">
          <img src={laptop} alt="Trading Platform" className="w-full max-w-3xl" />
        </div>
      </div>
    </div>
  );
};

export default TradingGame;