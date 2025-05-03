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
      
      {showDownloadModal && (
        <DownloadApp onClose={() => setShowDownloadModal(false)} />
      )}
    </div>
  );
};

export default Overview;