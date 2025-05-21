import React from 'react';
// import './SecondaryTabs.css'; // Comment out or remove if all styles are replaced by Tailwind

const SecondaryTabs = ({ tabs, activeTab, onTabClick }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-3 mb-3"> {/* Tailwind for layout from SecondaryTabs.css */}
        {tabs.map(tab => (
            <div
                key={tab.id}
                className={`
                  h-8 px-4 text-sm rounded-2xl flex items-center justify-center cursor-pointer transition-colors duration-200 font-normal
                  ${activeTab === tab.id 
                    ? 'bg-black text-white font-medium' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
                onClick={() => onTabClick(tab.id)}
            >
                {tab.label}
            </div>
            ))}
  </div>
  );
};

export default SecondaryTabs;