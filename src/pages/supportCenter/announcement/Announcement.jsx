import React from 'react';
import './Announcement.css';
import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Announcement = () => {
  const categories = [
    'Latest announcements',
    'New listings',
    'Delistings',
    'Trading updates',
    'Deposit/withdrawal suspension',
    'P2P trading',
    'Web3',
    'Earn',
    'Jumpstart',
    'API',
    'OKB burn',
    'Others'
  ];

  const announcements = [
    {
      title: 'About SOLV Exclusive Airdrop Campaign Extension',
      date: 'Apr 21, 2026'
    },
    {
      title: 'AXONI to adjust options trading fees',
      date: 'Jan 28, 2026'
    },
    {
      title: 'About SOLV Exclusive Airdrop Campaign',
      date: 'Jan 21, 2026'
    },
    {
      title: 'AXONI will further adjust portfolio margin parameters',
      date: 'Jan 2, 2026'
    },
    {
      title: 'AXONI to adjust funding rate interval for MOVEUSD perpetual futures',
      date: 'May 2, 2026'
    },
    {
      title: 'Important notice: Changes to THB trading on AXONI P2P',
      date: 'Apr 30, 2026'
    },
    {
      title: 'AXONI to adjust discount rate tiers for multiple tokens',
      date: 'Apr 29, 2026'
    },
    {
      title: 'AXONI to adjust tick size of spot, margin, and perpetual futures',
      date: 'Apr 29, 2026'
    },
    {
      title: 'IP and PARTI now available for Dual Investment!',
      date: 'Apr 29, 2026'
    },
    {
      title: 'AXONI to list perpetual futures for SIGN crypto',
      date: 'Apr 28, 2026'
    },
    {
      title: 'AXONI to delist ZKJ margin trading pair and perpetual future',
      date: 'Apr 28, 2026'
    },
    {
      title: 'AXONI to enable margin trading and Simple Earn for LAYER crypto',
      date: 'Apr 25, 2026'
    },
    {
      title: 'AXONI to list LAYER (Solayer) for spot trading',
      date: 'Apr 25, 2026'
    },
    {
      title: 'AXONI to adjust components for several indexes',
      date: 'Apr 24, 2026'
    },
    {
      title: 'AXONI to list perpetual futures for INIT crypto',
      date: 'Apr 24, 2026'
    }
  ];

  return (
    <div className="announcements-container">
      <div className="header">
        <div className="breadcrumb">
          <span>Support center</span>
          <span className="separator"> &gt; </span>
          <span>Announcements</span>
        </div>
        <div className="search-container">
          <input type="text" placeholder="Search announcements" className="search-input" />
          <FaSearch className="search-icon" />
        </div>
      </div>

      <h1 className="main-heading">Announcements</h1>
      
      <div className="divider"></div>

      <div className="content-layout">
        <div className="sidebar">
          <ul className="categories-list">
            {categories.map((category, index) => (
              <li key={index} className={index === 0 ? 'active' : ''}>
                {category}
              </li>
            ))}
          </ul>
        </div>

        <div className="announcements-list">
          {announcements.map((announcement, index) => (
            <div key={index} className="announcement-item">
              <h3 className="announcement-title">{announcement.title}</h3>
              <p className="announcement-date">Published on {announcement.date}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="pagination-container">
        <div className="pagination-controls">
          <button className="pagination-arrow prev">
            <FaChevronLeft />
          </button>
          <button className="pagination-number active">1</button>
          <button className="pagination-number">2</button>
          <button className="pagination-number">3</button>
          <button className="pagination-number">4</button>
          <span className="pagination-ellipsis">...</span>
          <button className="pagination-number">145</button>
          <button className="pagination-arrow next">
            <FaChevronRight />
          </button>
        </div>
        <p className="pagination-info">Showing 1-15 of 2,175 articles</p>
      </div>
    </div>
  );
};

export default Announcement;