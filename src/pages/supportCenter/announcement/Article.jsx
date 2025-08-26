import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Article.css';
import { FaSearch, FaTwitter, FaFacebook, FaLinkedin, FaTelegram, FaLink } from 'react-icons/fa';

// Shared notifications data - move this to a separate file that both NavBar and Article can import
export const notifications = [
  {
    id: 1,
    title: "FLUX to list perpetual futures for SIGN crypto",
    time: "04/28/2025, 14:00:00",
    path: "/help/flux-to-list-perpetual-futures-for-sign-crypto",
    publishDate: "Apr 28, 2025",
    readTime: "2 min read",
    // You can add more article-specific content here
  },
  {
    id: 2,
    title: "FLUX to delist ZKJ margin trading pair and perpetual future",
    time: "04/28/2025, 11:10:00",
    path: "/help/flux-to-delist-zkj-margin-trading-pair-and-perpetual-future",
    publishDate: "Apr 28, 2025",
    readTime: "1 min read",
  },
  {
    id: 3,
    title: "FLUX to enable margin trading and Simple Earn for LAYER crypto",
    time: "04/25/2025, 19:20:00",
    path: "/help/flux-to-enable-margin-trading-and-simple-earn-for-layer-crypto",
    publishDate: "Apr 25, 2025",
    readTime: "3 min read",
  },
  {
    id: 4,
    title: "FLUX to list LAYER (Solayer) for spot trading",
    time: "04/25/2025, 14:00:00",
    path: "/help/flux-to-list-layer-solayer-for-spot-trading",
    publishDate: "Apr 25, 2025",
    readTime: "2 min read",
  },
  {
    id: 5,
    title: "FLUX to list perpetual futures for INIT crypto",
    time: "04/24/2025, 14:00:00",
    path: "/help/flux-to-list-perpetual-futures-for-init-crypto",
    publishDate: "Apr 24, 2025",
    readTime: "2 min read",
  }
];

const Article = () => {
  const { articleSlug } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    // Find the matching article from notifications data
    const foundArticle = notifications.find(notification => {
      return notification.path === `/help/${articleSlug}`;
    });
    
    if (foundArticle) {
      setArticle(foundArticle);
    }
  }, [articleSlug]);

  if (!article) {
    return <div className="not-found">Article not found</div>;
  }

  return (
    <div className="article-container">
      {/* Header with breadcrumb and search */}
      <div className="header">
        <div className="breadcrumb">
          <span>Support center</span>
          <span className="separator"> &gt; </span>
          <span>Announcements</span>
          <span className="separator"> &gt; </span>
          <span>New listings</span>
          <span className="separator"> &gt; </span>
          <span>Article</span>
        </div>
        <div className="search-container">
          <input type="text" placeholder="Search announcements" className="search-input" />
          <FaSearch className="search-icon" />
        </div>
      </div>

      {/* Article main content */}
      <div className="article-content">
        {/* Title and meta */}
        <h1 className="article-title">{article.title}</h1>
        
        <div className="article-meta">
          <span className="publish-date">Published on {article.publishDate}</span>
          <span className="read-time-separator">·</span>
          <span className="read-time">{article.readTime}</span>
        </div>
        
        {/* Social sharing */}
        <div className="social-sharing">
          <button className="share-button"><FaTwitter /></button>
          <button className="share-button"><FaFacebook /></button>
          <button className="share-button"><FaLinkedin /></button>
          <button className="share-button"><FaTelegram /></button>
          <button className="share-button"><FaLink /></button>
        </div>

        {/* Article content - This will need to be customized per article or loaded dynamically */}
        {article.path === "/help/flux-to-list-perpetual-futures-for-sign-crypto" && (
          <>
            {/* Introduction paragraph */}
            <div className="article-section">
              <p>
                We are pleased to announce that USDT-margined perpetual futures for SIGN will be enabled at 11:30 am UTC on April 28, 2025. 
                The updates will cover both the web and app interfaces as well as the API. The details are as follows:
              </p>
            </div>
            
            {/* Listing schedule */}
            <div className="article-section">
              <h2 className="section-title">I. Listing schedule</h2>
              <ul className="bullet-list">
                <li>SIGN/USDT perpetual futures trading will open at 11:30 am UTC on April 28, 2025.</li>
              </ul>
            </div>
            
            {/* Perpetual futures trading */}
            <div className="article-section">
              <h2 className="section-title">II. Perpetual futures trading</h2>
              <p>
                <strong>SIGN</strong> is the on-chain verification infrastructure that enables legal identities, digital contracts, token ownership, and other digital 
                information to be cross-border verified by governments, financial institutions, and individuals. SIGN's primary revenue-generating 
                product, <strong>TokenTable</strong>, supports core functionalities of the crypto economy—such as token airdrops, unlocking, and over-the-
                counter (OTC) trading.
              </p>
              
              <ul className="bullet-list">
                <li><strong>Full English Name:</strong> SIGN</li>
                <li><strong>Abbreviation:</strong> SIGN</li>
                <li><strong>Official Website:</strong> <a href="https://sign.global/" className="article-link">https://sign.global/</a></li>
                <li><strong>Twitter:</strong> <a href="https://x.com/ethsign" className="article-link">https://x.com/ethsign</a></li>
              </ul>
              
              {/* Features table */}
              <table className="features-table">
                <thead>
                  <tr>
                    <th>Features</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Underlying</td>
                    <td>SIGN/USDT index</td>
                  </tr>
                  <tr>
                    <td>Settlement crypto</td>
                    <td>USDT</td>
                  </tr>
                  <tr>
                    <td>Face value</td>
                    <td>100</td>
                  </tr>
                  <tr>
                    <td>Price quotation</td>
                    <td>1 SIGN value calculated in USDT equivalent</td>
                  </tr>
                  <tr>
                    <td>Tick size</td>
                    <td>0.00001</td>
                  </tr>
                  <tr>
                    <td>Leverage</td>
                    <td>0.01-20x</td>
                  </tr>
                  <tr>
                    <td>Funding rate</td>
                    <td>
                      clamp [Average premium index + clamp (Interest rate – Average premium index, 0.05%, -0.05%), 1.50%, -1.50%]
                      <div className="funding-rate-note">
                        For average premium index and interest rate calculations, refer to our <a href="#" className="article-link">product documentation</a>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Funding fee settlement interval</td>
                    <td>4 hours</td>
                  </tr>
                  <tr>
                    <td>Trading hours</td>
                    <td>24/7</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Notes and additional info */}
            <div className="article-section">
              <p className="note">
                Note: To avoid unreasonable fees arising from significant premium fluctuations of a newly launched contract, the upper limit of 
                the funding fee before 4:00 pm UTC on April 28, 2025 is 0.5%. After 4:00 pm UTC on April 28, 2025, the upper limit of the 
                predicted funding fee will be adjusted back to the regular rate of 1.5%. (The funding fee for this period will be charged at 8:00 
                pm UTC on April 28, 2025.) <strong>If there is a deviation from the contract price, the funding fee limit will be adjusted according to 
                market conditions.</strong>
              </p>

              <p>
                The price limit rules of SIGN USDT-margined perpetual futures trading are the same as those of other currencies. Please refer to 
                our perpetual futures trading guides for further details.
              </p>

              <p>
                USDT-margined perpetual futures trading: <a href="#" className="article-link green-link">FLUX Perpetual Futures Trading User Agreement</a>
              </p>
            </div>
          </>
        )}
        
        {/* Add conditional rendering for other articles */}
        {article.path === "/help/flux-to-delist-zkj-margin-trading-pair-and-perpetual-future" && (
          <div className="article-section">
            <p>
              We regret to inform you that ZKJ margin trading pair and perpetual future will be delisted from our platform effective April 30, 2025.
              Please ensure all positions are closed before the delisting date to avoid automatic liquidation.
            </p>
            {/* Add more content specific to this article */}
          </div>
        )}
        
        {/* Add similar conditions for other articles */}
        
        <div className="signature">
          <p>FLUX team</p>
          <p>{article.publishDate}</p>
        </div>
      </div>

      {/* Footer links */}
      <div className="article-footer">
        <div className="footer-links">
          <a href="#" className="footer-link green-link">Download FLUX app for iOS, Android, macOS, and Windows &gt;&gt;&gt;</a>
          <a href="#" className="footer-link green-link">Follow us on X (formerly Twitter) &gt;&gt;&gt;</a>
          <a href="#" className="footer-link green-link">Join us on Telegram &gt;&gt;&gt;</a>
          <a href="#" className="footer-link green-link">Join us on Discord &gt;&gt;&gt;</a>
          <a href="#" className="footer-link green-link">Subscribe to our channel on YouTube &gt;&gt;&gt;</a>
          <a href="#" className="footer-link green-link">Join other FLUX global communities &gt;&gt;&gt;</a>
        </div>
      </div>
    </div>
  );
};

export default Article;