import React from 'react';
import './SecondaryTabs.css';

const SecondaryTabs = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="secondary-tabs">
        {tabs.map(tab => (
            <div
                key={tab.id}
                className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => onTabClick(tab.id)}
            >
                {tab.label}
            </div>
            ))}
  </div>
  );
};

export default SecondaryTabs;