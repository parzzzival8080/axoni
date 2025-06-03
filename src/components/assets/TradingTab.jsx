import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import assetIcon from "../../assets/assets/411B1865A7B26122.webp";

const TradingTab = ({ 
  coins, 
  searchTerm, 
  setSearchTerm, 
  showZeroBalance, 
  setShowZeroBalance, 
  page, 
  setPage, 
  loading, 
  error, 
  overviewData 
}) => {
  const [activeSubTab, setActiveSubTab] = useState("coins");

  // Filter coins based on search term and zero balance filter
  const filteredCoins = coins
    .filter(coin => {
      // Filter by search term
      if (searchTerm && !coin.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by zero balance
      if (!showZeroBalance && coin.raw_balance <= 0) {
        return false;
      }
      
      return true;
    });
    
  // Calculate pagination
  const coinsPerPage = 10;
  const totalPages = Math.ceil(filteredCoins.length / coinsPerPage);
  const startIndex = (page - 1) * coinsPerPage;
  const endIndex = startIndex + coinsPerPage;
  const paginatedCoins = filteredCoins.slice(startIndex, endIndex);

  const formatNumber = (num) => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-gray-50 text-gray-900 p-6 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center text-gray-500 text-sm mb-6">
        <span className="text-gray-900 font-medium">Trading</span>
        <span className="mx-2">/</span>
        <span>Assets</span>
      </div>

      {/* Assets Cards */}
      {!loading && !error && coins.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-gray-600 mb-2">Assets value</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              ${formatNumber(overviewData.overview)}
            </div>
            <div className="text-gray-500">Total assets value in account</div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="text-gray-600 mb-2">Recent transactions</div>
            <div className="text-gray-500">No recent transactions</div>
          </div>
        </div>
      ) : !loading && !error ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col items-center text-center py-8">
              <img src={assetIcon} alt="Assets icon" className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Add assets to start trading</h3>
              <p className="text-gray-500 mb-4">Your assets will appear once you make a deposit or buy crypto with cash.</p>
              <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-lg font-medium transition-colors">
                Deposit
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col items-center text-center py-8">
              <img src={assetIcon} alt="Assets icon" className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent transactions</h3>
              <p className="text-gray-500">Your recent transactions will appear here.</p>
            </div>
          </div>
        </div>
      ) : null}
      
      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button 
            className={`px-6 py-3 font-medium transition-colors ${
              activeSubTab === "coins" 
                ? "text-orange-500 border-b-2 border-orange-500" 
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveSubTab("coins")}
          >
            Coins
          </button>
          <button 
            className={`px-6 py-3 font-medium transition-colors ${
              activeSubTab === "earn" 
                ? "text-orange-500 border-b-2 border-orange-500" 
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveSubTab("earn")}
          >
            Earn
          </button>
        </div>
        
        {activeSubTab === "coins" && (
          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
  <input 
    type="text" 
    placeholder="Search coin" 
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
  />
</div>
              <div className="flex gap-2">
                <button 
                  className={`px-4 py-2 rounded-lg font-medium transition-colors border ${
                    showZeroBalance 
                      ? "bg-orange-500 text-white border-orange-500" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300"
                  }`}
                  onClick={() => setShowZeroBalance(true)}
                >
                  All assets
                </button>
                <button 
                  className={`px-4 py-2 rounded-lg font-medium transition-colors border ${
                    !showZeroBalance 
                      ? "bg-orange-500 text-white border-orange-500" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300"
                  }`}
                  onClick={() => setShowZeroBalance(false)}
                >
                  Hide zero balance
                </button>
              </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading assets...</p>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-8">{error}</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Coin</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Full Name</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Last Price</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Balance</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCoins.map((coin) => (
                      <tr key={coin.symbol} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {coin.logo ? (
                              <img src={coin.logo} alt={coin.symbol} className="w-8 h-8 rounded-full mr-3" />
                            ) : (
                              <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                {coin.symbol.charAt(0)}
                              </div>
                            )}
                            <span className="font-medium text-gray-900">{coin.symbol}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{coin.name}</td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          ${coin.formatted_price || coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900">
                          {coin.formatted_balance || coin.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-gray-900">
                          ${coin.formatted_value || coin.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                    {filteredCoins.length === 0 && !loading && (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-gray-500">
                          {searchTerm ? `No coins found matching "${searchTerm}"` : 'No assets found'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button 
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  &lt;
                </button>
                
                {[...Array(Math.min(totalPages, 5)).keys()].map(i => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button 
                      key={pageNum} 
                      className={`px-3 py-2 rounded-lg border transition-colors ${
                        page === pageNum 
                          ? "bg-orange-500 text-white border-orange-500" 
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        )}

        {activeSubTab === "earn" && (
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-gray-500 mb-2">Earn features</div>
              <div className="text-gray-400">Coming soon...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingTab;