import React from 'react';
import logo from '../../assets/logo/logo.png';
import { FaChevronDown, FaSearch, FaMoon, FaGlobe } from 'react-icons/fa';

const Navbar = () => {
  return (
    <header>
      <nav className="navbar">
        <div className="left-nav">
          <div className="logo">
            <img src={logo} alt="OKX Logo" />
          </div>
          <div className="nav-links">
            {[
              { name: 'Buy crypto', hasDropdown: true },
              { name: 'Discover', hasDropdown: true },
              { name: 'Trade', hasDropdown: true },
              { name: 'Earn', hasDropdown: true },
              { name: 'Web3', hasDropdown: false },
              { name: 'Learn', hasDropdown: true },
              { name: 'More', hasDropdown: true }
            ].map((item) => (
              <div className="nav-item" key={item.name}>
                <a href="#">{item.name}</a>
                {item.hasDropdown && <i className="fas fa-chevron-down"></i>}
              </div>
            ))}
          </div>
        </div>
        <div className="right-nav">
          <div className="search-bar">
            <input type="text" placeholder="Search" />
            <i className="fas fa-search"></i>
          </div>
          <div className="theme-toggle">
            <i className="fas fa-moon"></i>
          </div>
          <a href="#" className="login-btn">Log in</a>
          <a href="#" className="signup-btn">Sign up</a>
          <div className="language">
            <span className="globe"><i className="fas fa-globe"></i></span>
            <span>EN</span>
            <i className="fas fa-chevron-down"></i>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar; 