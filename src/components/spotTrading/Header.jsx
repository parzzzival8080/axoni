import React from 'react';
import logo from '../../assets/logo/logo.png';
const Header = () => {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo">
          <img src={logo} alt="FLUX" />
        </div>
        <nav className="nav">
          <div className="nav-item">Buy crypto <i className="fas fa-chevron-down"></i></div>
          <div className="nav-item">Discover <i className="fas fa-chevron-down"></i></div>
          <div className="nav-item">Trade <i className="fas fa-chevron-down"></i></div>
          <div className="nav-item">Grow <i className="fas fa-chevron-down"></i></div>
          <div className="nav-item">Build <i className="fas fa-chevron-down"></i></div>
          <div className="nav-item">Institutional <i className="fas fa-chevron-down"></i></div>
          <div className="nav-item">Learn</div>
          <div className="nav-item">More <i className="fas fa-chevron-down"></i></div>
        </nav>
      </div>
      <div className="header-right">
        <div className="search"><i className="fas fa-search"></i></div>
        <div className="login">Log in</div>
        <div className="signup">Sign up</div>
        <div className="download"><i className="fas fa-arrow-down"></i></div>
        <div className="notifications"><i className="fas fa-bell"></i></div>
        <div className="help"><i className="fas fa-question-circle"></i></div>
        <div className="language"><i className="fas fa-globe"></i></div>
      </div>
    </header>
    
  );
};

export default Header; 