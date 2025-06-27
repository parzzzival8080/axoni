import React, { useState, useEffect } from 'react';
import EarnOverviewImg from '../../assets/assets/Earn overview asset.png';

const EarnOverview = () => {
  const [selectedProduct, setSelectedProduct] = useState('All products');
  const [selectedTerm, setSelectedTerm] = useState('All terms');
  const [searchQuery, setSearchQuery] = useState('');
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch coins on mount
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('https://api.kinecoin.co/api/v1/coins?apikey=A20RqFwVktRxxRqrKBtmi6ud');
        const data = await res.json();
        
        if (Array.isArray(data)) {
          // Add mock APR and earn data to coins
          const coinsWithEarnData = data.slice(0, 15).map((coin, index) => ({
            ...coin,
            marketApr: index === 0 && coin.symbol === 'USDT' ? '50.00%' :
                      coin.symbol === 'USDT' ? '1.50% - 3.95%' :
                      coin.symbol === 'BTC' ? '1.00%' :
                      coin.symbol === 'ETH' ? '1.00% - 3.11%' :
                      coin.symbol === 'MOVE' ? '192.00%' :
                      coin.symbol === 'PRCL' ? '167.00%' :
                      coin.symbol === 'DEGEN' ? '169.00%' :
                      coin.symbol === 'GODS' ? '79.00%' :
                      `${(Math.random() * 200 + 1).toFixed(2)}%`,
            term: index === 0 && coin.symbol === 'USDT' ? '3 days' :
                  coin.symbol === 'USDT' || coin.symbol === 'BTC' || coin.symbol === 'ETH' ? 'Flexible/Fixed' :
                  'Flexible',
            action: index === 0 && coin.symbol === 'USDT' ? 'Subscribe' : '',
            label: index === 0 && coin.symbol === 'USDT' ? 'Savings Starter' : ''
          }));
          setCoins(coinsWithEarnData);
        } else if (Array.isArray(data.data)) {
          const coinsWithEarnData = data.data.slice(0, 15).map((coin, index) => ({
            ...coin,
            marketApr: index === 0 && coin.symbol === 'USDT' ? '50.00%' :
                      coin.symbol === 'USDT' ? '1.50% - 3.95%' :
                      coin.symbol === 'BTC' ? '1.00%' :
                      coin.symbol === 'ETH' ? '1.00% - 3.11%' :
                      coin.symbol === 'MOVE' ? '192.00%' :
                      coin.symbol === 'PRCL' ? '167.00%' :
                      coin.symbol === 'DEGEN' ? '169.00%' :
                      coin.symbol === 'GODS' ? '79.00%' :
                      `${(Math.random() * 200 + 1).toFixed(2)}%`,
            term: index === 0 && coin.symbol === 'USDT' ? '3 days' :
                  coin.symbol === 'USDT' || coin.symbol === 'BTC' || coin.symbol === 'ETH' ? 'Flexible/Fixed' :
                  'Flexible',
            action: index === 0 && coin.symbol === 'USDT' ? 'Subscribe' : '',
            label: index === 0 && coin.symbol === 'USDT' ? 'Savings Starter' : ''
          }));
          setCoins(coinsWithEarnData);
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

  // Filter coins based on search and filters
  const filteredCoins = coins.filter(coin => {
    const matchesSearch = !searchQuery.trim() || 
      coin.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesProduct = selectedProduct === 'All products' || 
      coin.symbol === selectedProduct;
    
    const matchesTerm = selectedTerm === 'All terms' || 
      coin.term?.includes(selectedTerm) || 
      coin.term === selectedTerm;
    
    return matchesSearch && matchesProduct && matchesTerm;
  });

  const [faqItems, setFaqItems] = useState([
    { 
      question: 'What is Earn?', 
      isExpanded: true,
      answer: 'KINE Earn provides you with a way to generate interest on your assets through multiple investment choices. Products include Simple Earn, Loan, and On-chain Earn.'
    },
    { 
      question: 'What is annual percentage rate (APR)?', 
      isExpanded: false,
      answer: 'APR is the annual percentage rate your deposited crypto generates from our Earn products.'
    },
    { 
      question: 'When does revenue calculation/distribution start?', 
      isExpanded: false,
      answer: 'The calculation and distribution time of revenue may be different for different projects. Take our DeFi service for example, we send your deposited funds to the contract addresses of verified third-party DeFi services at around 11:00 am (UTC +8) daily. Revenue calculation starts as soon as funds are successfully delivered on-chain.'
    },
    { 
      question: 'What are the risks?', 
      isExpanded: false,
      answer: 'KINE accesses third party DeFi protocols, and only provides related services such as project display and revenue distribution, and does not take responsibility for any asset losses caused by potential risks such as contract vulnerabilities, hacking incidents, or termination of business.'
    },
  ]);

  const toggleFaqItem = (index) => {
    setFaqItems(faqItems.map((item, i) => {
      if (i === index) {
        return { ...item, isExpanded: !item.isExpanded };
      }
      return item;
    }));
  };

  const earnOptions = [
    { icon: 'fas fa-coins', label: 'Simple Earn' },
    { icon: 'fas fa-chart-line', label: 'Structured Products' },
    { icon: 'fas fa-link', label: 'On-chain Earn' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 lg:py-20 bg-[#000000]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Put your crypto to <span className="text-orange-500">work</span>
              </h1>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Earn daily rewards on 100+ tokens including USDT, USDC and ETH.
              </p>
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors duration-200 shadow-lg">
                Activate Auto-earn
              </button>
          </div>
          
            <div className="flex justify-center lg:justify-end">
              <img 
                src={EarnOverviewImg} 
                alt="Earn Overview" 
                className="max-w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Earn Options Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 bg-[#000000]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {earnOptions.map((option, index) => (
              <div 
                key={index} 
                className="bg-gray-800/50 rounded-xl p-6 text-center hover:bg-gray-800/70 transition-colors border border-gray-700 cursor-pointer"
              >
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className={`${option.icon} text-xl text-orange-500`}></i>
                </div>
                <span className="text-white font-medium">{option.label}</span>
            </div>
          ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 bg-[#000000]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">Products</h2>
        
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <select 
                value={selectedProduct} 
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
              <option value="All products">All products</option>
              <option value="USDT">USDT</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
            </select>
            
              <select 
                value={selectedTerm} 
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-1 focus:ring-orange-500"
              >
              <option value="All terms">All terms</option>
              <option value="3 days">3 days</option>
              <option value="7 days">7 days</option>
              <option value="30 days">30 days</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>
          
            <div className="relative w-full lg:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            <input 
              type="text" 
              placeholder="Search crypto"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg py-2 pl-10 pr-4 w-full focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder-gray-400"
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
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{coin.symbol}</span>
                            {coin.label && (
                              <span className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full">
                                {coin.label}
                              </span>
                            )}
                          </div>
                        </div>
                  </div>
                </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-green-400 font-semibold">{coin.marketApr}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{coin.term}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {coin.action ? (
                        <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg transition-colors">
                          {coin.action}
                        </button>
                  ) : (
                        <button className="text-gray-400 hover:text-white transition-colors p-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        </button>
                  )}
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

      {/* FAQ Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 bg-[#000000]">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8">FAQ</h2>
          <div className="space-y-4">
          {faqItems.map((item, index) => (
              <div key={index} className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                <button 
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-800/70 transition-colors"
                onClick={() => toggleFaqItem(index)}
              >
                  <span className="text-white font-medium text-lg">{item.question}</span>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${item.isExpanded ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              {item.isExpanded && item.answer && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-300 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default EarnOverview