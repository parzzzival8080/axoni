import React, { useState } from 'react';
import '../Market/NavigationTabs.css';

const NavigationTabs = ({ activeTab, onTabClick }) => {
  const tabs = [{ id: 'crypto', label: 'Crypto' }];
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    if (searchVisible) {
      setSearchQuery('');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Process search query here
    console.log('Search query:', searchQuery);
    // Optionally hide search after submission
    // setSearchVisible(false);
  };

  return (
    <div className="primary-tabs">
      <div className="tab-group">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabClick(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
            {tab.id === 'premarket' && <span className="new-badge">New</span>}
            {activeTab === tab.id && <div className="active-indicator"></div>}
          </div>
        ))}
      </div>

      <div className="search-area">
        {searchVisible ? (
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
            <button type="button" className="search-close-btn" onClick={toggleSearch}>
              ✕
            </button>
          </form>
        ) : (
          <div className="search-icon-wrapper" onClick={toggleSearch}>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="search-icon-svg"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationTabs;