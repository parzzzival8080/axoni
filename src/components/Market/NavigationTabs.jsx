import React, { useState } from 'react';

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
    <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-1">
      <div className="flex space-x-6 overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            className={`relative py-4 px-1 cursor-pointer transition-colors duration-200 whitespace-nowrap`}
            onClick={() => onTabClick(tab.id)}
          >
            <span className={`${activeTab === tab.id ? 'text-white font-medium' : 'text-gray-400 hover:text-gray-300'}`}>
              {tab.label}
              {tab.id === 'premarket' && (
                <span className="ml-1 px-1.5 py-0.5 text-xs font-medium bg-[#FE7400] text-white rounded-sm">
                  New
                </span>
              )}
            </span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FE7400] rounded-t-full"></div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center">
        {searchVisible ? (
          <form 
            className="relative flex items-center" 
            onSubmit={handleSearchSubmit}
          >
            <input
              type="text"
              className="bg-gray-800 text-white border border-gray-700 rounded-lg py-1.5 px-3 pr-8 w-60 focus:outline-none focus:ring-1 focus:ring-[#FE7400] placeholder-gray-500"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
            <button 
              type="button" 
              className="absolute right-2 text-gray-400 hover:text-white transition-colors"
              onClick={toggleSearch}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </form>
        ) : (
          <button 
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800"
            onClick={toggleSearch}
          >
            <svg 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default NavigationTabs;