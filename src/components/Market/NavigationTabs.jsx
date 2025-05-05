import React from 'react';
import '../Market/NavigationTabs.css';

const NavigationTabs = ({ tabs, activeTab, onTabClick }) => {
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
        <div className="search-container">
          <i className="search-icon">🔍</i>
        </div>
      </div>
    );
  };
  
  export default NavigationTabs;