import React, { useState, useEffect } from 'react';
import './SimpleEarn.css';
import EarnNavBar from './EarnNavBar';
import SimpleEarnImg from '../../assets/assets/Simple Earn Asset.png';

const SimpleEarn = () => {
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch coins on mount
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('https://api.fluxcoin.tech/api/v1/coins?apikey=A20RqFwVktRxxRqrKBtmi6ud');
        const data = await res.json();
        
        if (Array.isArray(data)) {
          // Add mock APR data to coins for earn products
          const coinsWithAPR = data.slice(0, 20).map(coin => ({
            ...coin,
            marketApr: coin.symbol === 'VRA' ? '225.00%' : 
                      coin.symbol === 'MOVE' ? '195.00%' :
                      coin.symbol === 'USDT' ? '1.50%' :
                      coin.symbol === 'USDC' ? '1.00%' :
                      coin.symbol === 'BTC' ? '1.00%' :
                      coin.symbol === 'ETH' ? '1.00%' :
                      coin.symbol === 'OKB' ? '1.00%' :
                      `${(Math.random() * 200 + 1).toFixed(2)}%`,
            term: coin.symbol === 'USDT' ? 'Flexible/Fixed' : 'Flexible'
          }));
          setCoins(coinsWithAPR);
        } else if (Array.isArray(data.data)) {
          const coinsWithAPR = data.data.slice(0, 20).map(coin => ({
            ...coin,
            marketApr: coin.symbol === 'VRA' ? '225.00%' : 
                      coin.symbol === 'MOVE' ? '195.00%' :
                      coin.symbol === 'USDT' ? '1.50%' :
                      coin.symbol === 'USDC' ? '1.00%' :
                      coin.symbol === 'BTC' ? '1.00%' :
                      coin.symbol === 'ETH' ? '1.00%' :
                      coin.symbol === 'OKB' ? '1.00%' :
                      `${(Math.random() * 200 + 1).toFixed(2)}%`,
            term: coin.symbol === 'USDT' ? 'Flexible/Fixed' : 'Flexible'
          }));
          setCoins(coinsWithAPR);
        } else {
          setCoins([]);
        }
      } catch (err) {
        setError('Failed to fetch coin data.');
        console.error('Error fetching coins:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  // Filter coins by search
  const filteredCoins = coins.filter(
    coin =>
      coin.symbol?.toLowerCase().includes(search.toLowerCase()) ||
      coin.name?.toLowerCase().includes(search.toLowerCase())
  );

  const alternativeOptions = [
    {
      title: 'Structured Products',
      description: 'Earn potentially high APRs on current market trends',
      icon: 'fas fa-chart-line'
    },
    {
      title: 'On-chain Earn',
      description: 'Participate with on the chain',
      icon: 'fas fa-link'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <EarnNavBar/>
      
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 lg:py-20 bg-[#000000]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Grow crypto effortlessly on<br />
                <span className="text-orange-500">Simple Earn</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Entrust your crypto assets to our highly secure platform, while enjoying
              attractive returns
            </p>
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 shadow-lg">
                What is Simple Earn?
              </button>
          </div>
          
            <div className="flex justify-center lg:justify-end">
              <img 
                src={SimpleEarnImg} 
                alt="Simple Earn" 
                className="max-w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 bg-[#000000]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold text-white">Products</h2>
            <div className="relative w-full sm:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            <input 
              type="text"
              placeholder="Search crypto"
                className="bg-gray-800 text-white border border-gray-700 rounded-lg py-3 pl-10 pr-4 w-full focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder-gray-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

          <div className="overflow-x-auto rounded-lg shadow-md bg-black/70">
            <table className="min-w-full divide-y divide-gray-800">
          <thead>
            <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Token</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Market APR 
                    <svg className="inline-block w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                    </svg>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Term</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
              <tbody className="divide-y divide-gray-800">
                {loading && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        <span className="ml-3">Loading products...</span>
                      </div>
                    </td>
                  </tr>
                )}
                
                {error && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-red-500">{error}</td>
                  </tr>
                )}
                
                {!loading && !error && filteredCoins.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400">No products found.</td>
                  </tr>
                )}
                
                {!loading && !error && filteredCoins.map((coin, index) => (
                  <tr key={coin.symbol || index} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {coin.logo_path ? (
                          <img 
                            src={coin.logo_path} 
                            alt={coin.symbol} 
                            className="w-8 h-8 rounded-full bg-gray-800 object-contain shadow"
                            onError={(e) => { 
                              e.target.onerror = null; 
                              e.target.src = 'https://via.placeholder.com/32/444/fff?text=' + (coin.symbol?.charAt(0) || '?'); 
                            }} 
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-white">{coin.symbol?.charAt(0) || '?'}</span>
                          </div>
                        )}
                        <span className="text-white font-medium">{coin.symbol}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-green-400 font-semibold">{coin.marketApr}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{coin.term}</span>
                </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-gray-400 hover:text-white transition-colors p-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

            {!loading && !error && filteredCoins.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-800 text-center">
                <button className="text-orange-500 hover:text-orange-400 font-medium transition-colors">
                  View more
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Alternative Options Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 bg-[#000000]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Not quite what you're looking for?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {alternativeOptions.map((option, index) => (
              <div key={index} className="bg-gray-800/50 rounded-2xl p-8 text-center hover:bg-gray-800/70 transition-colors border border-gray-700">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className={`${option.icon} text-2xl text-orange-500`}></i>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{option.title}</h3>
                <p className="text-gray-300 leading-relaxed">{option.description}</p>
            </div>
          ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default SimpleEarn;