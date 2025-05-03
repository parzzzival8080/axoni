import React, { useState } from 'react';
import './EarnNavBar.css';

const EarnNavBar = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const navItems = [
    { label: 'Earn overview', link: '/earn' },
    { label: 'Simple Earn', link: '/earn/simple-earn' },
    { 
      label: 'Structured Products', 
      link: '/earn/structured',
      hasDropdown: true 
    },
    { 
      label: 'On-chain Earn', 
      link: '/earn/on-chain',
      hasDropdown: true 
    },
  ];

  const handleMouseEnter = (label) => {
    if (navItems.find(item => item.label === label)?.hasDropdown) {
      setActiveDropdown(label);
    }
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <nav className="earn-navbar">
      <div className="navbar-content">
        <div className="nav-links">
          {navItems.map((item) => (
            <div 
              key={item.label}
              className="nav-item"
              onMouseEnter={() => handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <a href={item.link} className="nav-link">
                {item.label}
                {item.hasDropdown && (
                  <i className={`fas fa-chevron-down chevron ${activeDropdown === item.label ? 'rotate' : ''}`}></i>
                )}
              </a>
              
              {item.hasDropdown && activeDropdown === item.label && (
                <div className="earn-dropdown-menu">
                  <div className="earn-dropdown-content">
                    <a href={`${item.link}/option1`} className="earn-dropdown-item">
                      Option 1
                    </a>
                    <a href={`${item.link}/option2`} className="earn-dropdown-item">
                      Option 2
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="my-earnings">
          <a href="/earn/my-earnings" className="earnings-link">
            My earnings
            <i className="fas fa-chevron-right earnings-arrow"></i>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default EarnNavBar;