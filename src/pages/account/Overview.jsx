import React from 'react'
import ProfileNavBar from '../../components/profile/ProfileNavBar'
import ProfileSection from '../../components/profile/overview/ProfileSection'
import PortfolioOverview from '../../components/profile/overview/PortfolioOverview'
import ReigniteBanner from '../../components/profile/overview/ReigniteBanner'
import Announcements from '../../components/profile/overview/Announcement'
import DownloadApp from '../../components/profile/overview/Download'
import CryptoPrices from '../../components/profile/overview/CryptoPrices'
import './Overview.css'

const Overview = () => {
  const [showDownloadModal, setShowDownloadModal] = React.useState(false);

  return (
    <div className="overview-page">
      <ProfileNavBar currentPath="/profile/overview" />
      
      <div className="overview-container">
        <div className="main-content">
          <ProfileSection />
          <PortfolioOverview />
          
          {/* Mobile-only ReigniteBanner */}
          <div className="mobile-reignite">
            <ReigniteBanner />
          </div>
          
          <CryptoPrices />
        </div>
        
        <div className="sidebar-content">
          {/* Desktop-only ReigniteBanner */}
          <div className="desktop-reignite">
            <ReigniteBanner />
          </div>
          
          <Announcements />
          
          {/* Download App Section */}
          <div className="download-app-section">
            <button 
              className="download-app-button"
              onClick={() => setShowDownloadModal(true)}
            >
              <span className="download-app-text">Download app and trade on the go</span>
              <div className="qr-code-preview">
                <div className="qr-code-small">
                  <div className="qr-pattern-small"></div>
                  <div className="qr-pattern-small"></div>
                  <div className="qr-pattern-small"></div>
                  <div className="qr-pattern-small"></div>
                </div>
              </div>
              <div className="download-app-info">
                <span className="app-name-small">OKX App</span>
                <span className="scan-text">Scan to download</span>
              </div>
            </button>
          </div>
        </div>
      </div>
<<<<<<< Updated upstream
      
      {showDownloadModal && (
        <DownloadApp onClose={() => setShowDownloadModal(false)} />
      )}
    </div>
=======
    );
  }

  // Check localStorage for pending status
  const localStatus = localStorage.getItem('is_verified');
  const isPending = localStatus === 'pending';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ProfileNavBar currentPath="/profile/overview" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Verification Pending Banner */}
        {isPending && (
          <div className="flex items-center justify-center mb-8">
            <span className="inline-flex items-center px-6 py-2 rounded-full bg-orange-100 text-orange-700 font-semibold text-base border border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700 animate-pulse shadow-lg">
              <FiShield className="mr-2 text-orange-500" size={20}/>
              Verification Pending: Your information is under review. You will be notified by email when your account is verified.
            </span>
          </div>
        )}
        {/* Header */}
  
        
        {/* Main Grid */}
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Portfolio Overview</h2>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {showBalance ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
              
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {showBalance ? formatCurrency(overviewData.overview) : '••••••'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Portfolio Value</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-[#FE7400] rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Spot Wallet</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {showBalance ? formatCurrency(overviewData.spot_wallet) : '••••••'}
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Future Wallet</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {showBalance ? formatCurrency(overviewData.future_wallet) : '••••••'}
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Funding Wallet</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {showBalance ? formatCurrency(overviewData.funding_wallet) : '••••••'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Link to="/deposit" className="flex flex-col items-center p-4 bg-[#FE7400] text-white rounded-lg hover:bg-orange-600 transition-colors">
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  <span className="text-sm font-medium">Deposit</span>
                </Link>
                
                <Link to="/withdraw" className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                  </svg>
                  <span className="text-sm font-medium">Withdraw</span>
                </Link>
                
                <Link to="/account/transfer" className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
                  </svg>
                  <span className="text-sm font-medium">Transfer</span>
                </Link>
                
                <Link to="/trading" className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                  </svg>
                  <span className="text-sm font-medium">Trade</span>
                </Link>
              </div>
            </div>

            {/* Top Assets */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Assets</h2>
                <Link to="/assets" className="text-[#FE7400] hover:text-orange-600 text-sm font-medium flex items-center">
                  View All <FiArrowRight className="ml-1" />
                </Link>
              </div>
              
              {topAssets.length > 0 ? (
                <div className="space-y-3">
                  {topAssets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        {asset.logo ? (
                          <img src={asset.logo} alt={asset.symbol} className="w-8 h-8 rounded-full mr-3" />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full mr-3 flex items-center justify-center">
                            <span className="text-xs font-bold">{asset.symbol.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{asset.symbol}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{asset.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {showBalance ? formatNumber(asset.spot_balance + asset.future_balance + asset.funding_balance) : '••••••'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {showBalance ? formatCurrency(asset.spot_value + asset.future_value + asset.funding_value) : '••••••'}
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
>>>>>>> Stashed changes
  );
};

export default Overview;