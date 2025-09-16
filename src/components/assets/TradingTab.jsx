import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useCurrency } from "../../context/CurrencyContext";
import assetIcon from "../../assets/assets/411B1865A7B26122.webp";
import { Link } from "react-router-dom";

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
  overviewData,
}) => {
  const [activeSubTab, setActiveSubTab] = useState("coins");
  const { selectedCurrency, formatCurrency } = useCurrency();

  // Filter coins based on search term and zero balance filter
  const filteredCoins = coins.filter((coin) => {
    // Filter by search term
    if (
      searchTerm &&
      !coin.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
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
    return formatCurrency(num, "USD", true);
  };

  return (
    <div className="bg-gray-50 text-gray-900 p-3 sm:p-6 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">
        <span className="text-gray-900 font-medium">Trading</span>
        <span className="mx-1 sm:mx-2">/</span>
        <span>{selectedCurrency}</span>
      </div>

      {/* Assets Cards */}
      {!loading && !error && coins.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="text-gray-600 mb-2 text-sm sm:text-base">
              Assets value
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {formatNumber(overviewData.overview)}
            </div>
            <div className="text-gray-500 text-sm sm:text-base">
              Total assets value in account
            </div>
          </div>
        </div>
      ) : !loading && !error ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex flex-col items-center text-center py-6 sm:py-8">
              <img
                src={assetIcon}
                alt="Assets icon"
                className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 opacity-50"
              />
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Add assets to start trading
              </h3>
              <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base px-2">
                Your assets will appear once you make a deposit or buy crypto
                with cash.
              </p>
              <Link
                to="/deposit"
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 sm:px-6 rounded-lg font-medium transition-colors text-sm sm:text-base "
              >
                <span>Deposit</span>
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 sm:px-6 py-3 font-medium transition-colors text-sm sm:text-base ${
              activeSubTab === "coins"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveSubTab("coins")}
          >
            Coins
          </button>
          <button
            className={`px-4 sm:px-6 py-3 font-medium transition-colors text-sm sm:text-base ${
              activeSubTab === "earn"
                ? "text-blue-500 border-b-2 border-blue-500"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveSubTab("earn")}
          >
            Earn
          </button>
        </div>

        {activeSubTab === "coins" && (
          <div className="p-3 sm:p-6">
            {/* Filters */}
            <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Search Input */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search coin"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 sm:py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm sm:text-base"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-2 sm:gap-3">
                <button
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors border text-sm sm:text-base ${
                    showZeroBalance
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300"
                  }`}
                  onClick={() => setShowZeroBalance(true)}
                >
                  All assets
                </button>
                <button
                  className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors border text-sm sm:text-base ${
                    !showZeroBalance
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-300"
                  }`}
                  onClick={() => setShowZeroBalance(false)}
                >
                  Hide zero balance
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2 text-sm sm:text-base">
                    Loading assets...
                  </p>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center py-8 text-sm sm:text-base">
                  {error}
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                            Coin
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                            Full Name
                          </th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">
                            Last Price
                          </th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">
                            Balance
                          </th>
                          <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm">
                            Value
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedCoins.map((coin) => (
                          <tr
                            key={coin.symbol}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                {coin.logo ? (
                                  <img
                                    src={coin.logo}
                                    alt={coin.symbol}
                                    className="w-8 h-8 rounded-full mr-3"
                                  />
                                ) : (
                                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                    {coin.symbol.charAt(0)}
                                  </div>
                                )}
                                <span className="font-medium text-gray-900">
                                  {coin.symbol}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600">
                              {coin.name}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-900">
                              {formatCurrency(coin.price, "USD", true)}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-900">
                              {coin.balance.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 8,
                              })}
                            </td>
                            <td className="py-3 px-4 text-right font-medium text-gray-900">
                              {formatCurrency(coin.value, "USD", true)}
                            </td>
                          </tr>
                        ))}
                        {filteredCoins.length === 0 && !loading && (
                          <tr>
                            <td
                              colSpan="5"
                              className="py-8 text-center text-gray-500"
                            >
                              {searchTerm
                                ? `No coins found matching "${searchTerm}"`
                                : "No assets found"}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card Layout */}
                  <div className="sm:hidden space-y-3">
                    {paginatedCoins.map((coin) => (
                      <div
                        key={coin.symbol}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        {/* Header Row */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            {coin.logo ? (
                              <img
                                src={coin.logo}
                                alt={coin.symbol}
                                className="w-10 h-10 rounded-full mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                                {coin.symbol.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-gray-900 text-base">
                                {coin.symbol}
                              </div>
                              <div className="text-gray-600 text-sm truncate max-w-[120px]">
                                {coin.name}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900 text-base">
                              {formatCurrency(coin.value, "USD", true)}
                            </div>
                            <div className="text-gray-600 text-sm">Value</div>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                          <div>
                            <div className="text-gray-600 text-xs mb-1">
                              Price
                            </div>
                            <div className="font-medium text-gray-900 text-sm">
                              {formatCurrency(coin.price, "USD", true)}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-600 text-xs mb-1">
                              Balance
                            </div>
                            <div className="font-medium text-gray-900 text-sm">
                              {coin.balance.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 8,
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredCoins.length === 0 && !loading && (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        {searchTerm
                          ? `No coins found matching "${searchTerm}"`
                          : "No assets found"}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <div className="flex justify-center items-center gap-1 sm:gap-2 mt-4 sm:mt-6">
                <button
                  className="px-2 sm:px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  &lt;
                </button>

                {[
                  ...Array(
                    Math.min(totalPages, window.innerWidth < 640 ? 3 : 5)
                  ).keys(),
                ].map((i) => {
                  let pageNum;
                  const maxPages = window.innerWidth < 640 ? 3 : 5;

                  if (totalPages <= maxPages) {
                    pageNum = i + 1;
                  } else if (page <= Math.ceil(maxPages / 2)) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - Math.floor(maxPages / 2)) {
                    pageNum = totalPages - maxPages + 1 + i;
                  } else {
                    pageNum = page - Math.floor(maxPages / 2) + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      className={`px-2 sm:px-3 py-2 rounded-lg border transition-colors text-sm ${
                        page === pageNum
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  className="px-2 sm:px-3 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
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
          <div className="p-4 sm:p-6">
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-500 mb-2 text-sm sm:text-base">
                Earn features
              </div>
              <div className="text-gray-400 text-sm sm:text-base">
                Coming soon...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingTab;
