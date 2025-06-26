import React, { useState } from 'react';

const CryptoPriceSection = ({ cryptoData, isLoading }) => {
      // Current page state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 12; // Based on the pagination shown in the image

  // Navigation functions
  const goToPage = (page) => setCurrentPage(page);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-gray-300 border-t-[#F88726] rounded-full animate-spin mb-4"></div>
      <p className="text-gray-400">Loading cryptocurrency data...</p>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="flex items-center justify-center py-20">
      <p className="text-gray-400">No cryptocurrencies match the selected filters.</p>
    </div>
  );

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-white mb-2">Today's cryptocurrency prices</h2>
      <p className="text-gray-400 mb-6">
        View the latest prices for the hundreds of digital assets listed on OKX, alongside their daily price change and market cap statistics.
      </p>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        {isLoading ? (
          <LoadingIndicator />
        ) : cryptoData.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-900 text-left">
                  <th className="py-3 px-4 text-gray-400 font-medium">Name</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">Price</th>
                  <th className="py-3 px-4 text-gray-400 font-medium">
                    <div className="flex items-center">
                      Change
                      <svg className="ml-1 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 15l7-7 7 7" />
                      </svg>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-gray-400 font-medium">
                    <div className="flex items-center">
                      Market cap
                      <svg className="ml-1 w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </th>
                  <th className="py-3 px-4 text-gray-400 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {cryptoData.map((crypto, index) => (
                  <tr key={crypto.id} className="hover:bg-gray-750 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div className="text-gray-500 mr-4 w-6 text-right">{index + 1}</div>
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center mr-3">
                          {crypto.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-white">{crypto.name}</div>
                          <div className="text-xs text-gray-400">{crypto.fullName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-white">
                      ${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                    </td>
                    <td className={`py-4 px-4 font-medium ${crypto.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                    </td>
                    <td className="py-4 px-4 text-white">${crypto.marketCap.toFixed(3)}B</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center space-x-2">
                        <button className="py-1 px-3 bg-[#F88726] hover:bg-[#FF8C24] text-white text-sm rounded transition-colors font-medium">
                          Trade
                        </button>
                        <button className="py-1 px-3 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors font-medium">
                          Convert
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!isLoading && cryptoData.length > 0 && (
        <div className="flex justify-center mt-6 space-x-1">
          <button 
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors"
            onClick={goToPrevPage}
          >
            ‹
          </button>
          <button 
            className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors
              ${currentPage === 1 ? 'bg-[#F88726] text-white' : 'border border-gray-700 text-gray-400 hover:bg-gray-800'}`}
            onClick={() => goToPage(1)}
          >
            1
          </button>
          <button 
            className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors
              ${currentPage === 2 ? 'bg-[#F88726] text-white' : 'border border-gray-700 text-gray-400 hover:bg-gray-800'}`}
            onClick={() => goToPage(2)}
          >
            2
          </button>
          <button 
            className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors
              ${currentPage === 3 ? 'bg-[#F88726] text-white' : 'border border-gray-700 text-gray-400 hover:bg-gray-800'}`}
            onClick={() => goToPage(3)}
          >
            3
          </button>
          <button 
            className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors
              ${currentPage === 4 ? 'bg-[#F88726] text-white' : 'border border-gray-700 text-gray-400 hover:bg-gray-800'}`}
            onClick={() => goToPage(4)}
          >
            4
          </button>
          <span className="w-8 h-8 flex items-center justify-center text-gray-400">...</span>
          <button 
            className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors
              ${currentPage === 12 ? 'bg-[#F88726] text-white' : 'border border-gray-700 text-gray-400 hover:bg-gray-800'}`}
            onClick={() => goToPage(12)}
          >
            12
          </button>
          <button 
            className="w-8 h-8 flex items-center justify-center rounded border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors"
            onClick={goToNextPage}
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
};

export default CryptoPriceSection;