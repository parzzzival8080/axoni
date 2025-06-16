import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import ProfileNavBar from "../../components/profile/ProfileNavBar";
import {
  FiEye,
  FiEyeOff,
  FiTrendingUp,
  FiTrendingDown,
  FiArrowRight,
  FiCopy,
  FiCheck,
  FiShield,
} from "react-icons/fi";

const Overview = () => {
  const [profileData, setProfileData] = useState(null);
  const [walletData, setWalletData] = useState([]);
  const [overviewData, setOverviewData] = useState({
    overview: 0,
    spot_wallet: 0,
    future_wallet: 0,
    funding_wallet: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBalance, setShowBalance] = useState(true);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user ID from localStorage
        const uid =
          localStorage.getItem("uid") || localStorage.getItem("user_id");

        if (!uid) {
          setError("User ID not found. Please log in again.");
          setIsLoading(false);
          return;
        }

        console.log("Fetching data for userId:", uid);

        // Fetch profile data with better error handling
        try {
          console.log("Fetching profile data...");
          const profileResponse = await axios.get(
            `https://django.bhtokens.com/api/user_account/getUserInformation/?user_id=${uid}`,
          );

          if (
            profileResponse.data &&
            profileResponse.data.user &&
            profileResponse.data.user_detail
          ) {
            setProfileData(profileResponse.data);
            console.log("Profile data set successfully");
          } else {
            console.warn(
              "Profile data format unexpected:",
              profileResponse.data,
            );
          }
        } catch (profileError) {
          console.error("Profile API error:", profileError);
          // Don't fail the entire page for profile errors
        }

        // Fetch wallet data - using the same approach as Assets.jsx
        try {
          // API key - same as used in Assets.jsx
          const apiKey = "A20RqFwVktRxxRqrKBtmi6ud";
          const apiUrl = `https://apiv2.bhtokens.com/api/v1/user-wallets/${uid}?apikey=${apiKey}`;

          console.log("Fetching wallet data from:", apiUrl);
          const walletResponse = await axios.get(apiUrl);

          // Process wallet data in the same way as Assets.jsx
          if (walletResponse.data && walletResponse.data["0"]) {
            // Format the coin data consistently with Assets.jsx
            const formattedCoins = walletResponse.data["0"].map((coin) => ({
              id: coin.coin_id,
              symbol: coin.crypto_symbol,
              name: coin.crypto_name,
              logo: coin.logo_path,
              price: parseFloat(coin.price),
              spot_balance: parseFloat(coin.spot_wallet),
              future_balance: parseFloat(coin.future_wallet),
              funding_balance: parseFloat(coin.funding_wallet),
              spot_value: parseFloat(coin.price) * parseFloat(coin.spot_wallet),
              future_value:
                parseFloat(coin.price) * parseFloat(coin.future_wallet),
              funding_value:
                parseFloat(coin.price) * parseFloat(coin.funding_wallet),
              // Format as in Assets.jsx for consistency
              price_formatted: parseFloat(coin.price).toLocaleString(),
              balance: parseFloat(coin.spot_wallet).toLocaleString(),
              value: (
                parseFloat(coin.price) * parseFloat(coin.spot_wallet)
              ).toLocaleString(),
              raw_balance: parseFloat(coin.spot_wallet),
              raw_value: parseFloat(coin.price) * parseFloat(coin.spot_wallet),
            }));

            setWalletData(formattedCoins);
            console.log(
              "Wallet data set successfully, coins:",
              formattedCoins.length,
            );

            // Calculate totals
            const totals = formattedCoins.reduce(
              (acc, coin) => ({
                spot_wallet: acc.spot_wallet + coin.spot_value,
                future_wallet: acc.future_wallet + coin.future_value,
                funding_wallet: acc.funding_wallet + coin.funding_value,
              }),
              { spot_wallet: 0, future_wallet: 0, funding_wallet: 0 },
            );

            // Set overview data - with the same structure as in Assets.jsx
            const overview =
              totals.spot_wallet + totals.future_wallet + totals.funding_wallet;
            setOverviewData({
              overview: overview,
              spot_wallet: totals.spot_wallet,
              future_wallet: totals.future_wallet,
              funding_wallet: totals.funding_wallet,
            });

            // Handle overview data from API response as well (as a fallback)
            if (walletResponse.data.overview) {
              console.log("Using overview data from API response");
              // Overwrite with API values if present
              setOverviewData({
                overview: walletResponse.data.overview || overview,
                spot_wallet:
                  walletResponse.data.spot_wallet || totals.spot_wallet,
                future_wallet:
                  walletResponse.data.future_wallet || totals.future_wallet,
                funding_wallet:
                  walletResponse.data.funding_wallet || totals.funding_wallet,
              });
            }
          } else {
            console.log("No wallet data found in response");
            setWalletData([]);
            setOverviewData({
              overview: 0,
              spot_wallet: 0,
              future_wallet: 0,
              funding_wallet: 0,
            });
          }
        } catch (walletError) {
          console.error("Wallet API error:", walletError);

          // Handle API errors gracefully - empty data instead of error
          setWalletData([]);
          setOverviewData({
            overview: 0,
            spot_wallet: 0,
            future_wallet: 0,
            funding_wallet: 0,
          });

          // Only set error if we have no profile data either
          if (!profileData) {
            setError("Failed to load wallet data. Please try again later.");
          }
        }

        console.log("Data fetching completed successfully");
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(`Failed to load data. Please try again later.`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Extract user data
  const user = profileData?.user || {};
  const userDetail = profileData?.user_detail || {};
  const isVerified =
    userDetail.is_verified === true ||
    localStorage.getItem("is_verified") === "true";

  // Get top assets by value
  const topAssets = walletData
    .filter(
      (coin) => coin.spot_value + coin.future_value + coin.funding_value > 0,
    )
    .sort(
      (a, b) =>
        b.spot_value +
        b.future_value +
        b.funding_value -
        (a.spot_value + a.future_value + a.funding_value),
    )
    .slice(0, 5);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value, decimals = 8) => {
    if (value === 0) return "0.00";
    if (value < 0.01) return value.toFixed(decimals);
    return value.toFixed(2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ProfileNavBar currentPath="/profile/overview" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FE7400]"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-300">
              Loading overview...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <ProfileNavBar currentPath="/profile/overview" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-red-500 mb-2">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
              Error loading overview
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#FE7400] text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white relative">
      <ProfileNavBar currentPath="/profile/overview" />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        {/* <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h1>
            <p className="text-gray-600 dark:text-gray-400">Welcome back, {user.name || 'User'}!</p>
          </div>
          {!isVerified && (
            <Link
              to="/account/verify"
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-[#FE7400] text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <FiShield className="mr-2" />
              Verify Account
            </Link>
          )}
        </div> */}

        {/* Main Grid */}
        <div className="grid grid-cols-1  gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Portfolio Overview
                </h2>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showBalance ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {showBalance
                    ? formatCurrency(overviewData.overview)
                    : "••••••"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total Portfolio Value
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-[#FE7400] rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Spot Wallet
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {showBalance
                      ? formatCurrency(overviewData.spot_wallet)
                      : "••••••"}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Future Wallet
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {showBalance
                      ? formatCurrency(overviewData.future_wallet)
                      : "••••••"}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Funding Wallet
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {showBalance
                      ? formatCurrency(overviewData.funding_wallet)
                      : "••••••"}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link
                  to="/deposit"
                  className="flex flex-col items-center p-4 bg-[#FE7400] text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                  </svg>
                  <span className="text-sm font-medium">Deposit</span>
                </Link>

                <Link
                  to="/withdraw"
                  className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M20 12H4"
                    ></path>
                  </svg>
                  <span className="text-sm font-medium">Withdraw</span>
                </Link>

                <Link
                  to="/transfer"
                  className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    ></path>
                  </svg>
                  <span className="text-sm font-medium">Transfer</span>
                </Link>

                <Link
                  to="/spot-trading"
                  className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    ></path>
                  </svg>
                  <span className="text-sm font-medium">Trade</span>
                </Link>
              </div>
            </div>

            {/* Top Assets */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top Assets
                </h2>
                <Link
                  to="/my-assets"
                  className="text-[#FE7400] hover:text-orange-600 text-sm font-medium flex items-center"
                >
                  View All <FiArrowRight className="ml-1" />
                </Link>
              </div>

              {topAssets.length > 0 ? (
                <div className="space-y-3">
                  {topAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center">
                        {asset.logo ? (
                          <img
                            src={asset.logo}
                            alt={asset.symbol}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full mr-3 flex items-center justify-center">
                            <span className="text-xs font-bold">
                              {asset.symbol.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {asset.symbol}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {asset.name}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {showBalance
                            ? formatNumber(
                                asset.spot_balance +
                                  asset.future_balance +
                                  asset.funding_balance,
                              )
                            : "••••••"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {showBalance
                            ? formatCurrency(
                                asset.spot_value +
                                  asset.future_value +
                                  asset.funding_value,
                              )
                            : "••••••"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">🪙</div>
                  <p>No assets found</p>
                  <p className="text-sm">Start by depositing some crypto</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
