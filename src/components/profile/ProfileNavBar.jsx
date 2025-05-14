import React from 'react';
import './ProfileNavBar.css';
import { Link, useLocation } from 'react-router-dom';

const ProfileNavBar = () => {
  const location = useLocation();
  
  const navItems = [
    { label: 'Overview', path: '/account/overview' },
    { label: 'Profile', path: '/account/profile' },
    { label: 'Security', path: '/account/profile/security', badge: 'New' },
    { label: 'Verification', path: '/account/profile/verify' },
    { label: 'Preferences', path: '/account/profile/preferences' },
    { label: 'Sub-accounts', path: '/account/profile/sub-accounts' },
    { label: 'API', path: '/account/profile/api' },
    { label: 'Third-party authorization', path: '/account/profile/third-party' },
  ];

  return (
    <nav className="profile-navbar">
      <div className="navbar-container">
        <ul className="nav-list">
          {navItems.map((item, index) => (
            <li 
              key={index} 
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <Link to={item.path} className="nav-link">
                {item.label}
                {item.badge && <span className="badge">{item.badge}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default ProfileNavBar;