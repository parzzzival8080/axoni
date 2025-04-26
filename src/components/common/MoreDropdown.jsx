import React from 'react';
import { Link } from 'react-router-dom';
import './MoreDropdown.css';

const moreItems = [
  {
    group: 'Products',
    items: [
      { icon: 'fa-coins', label: 'OKB' },
      { icon: 'fa-shield-alt', label: 'Security of funds' },
      { icon: 'fa-tasks', label: 'Status' },
      { icon: 'fa-file-alt', label: 'Proof of Reserves' },
      { icon: 'fa-user-shield', label: 'OKX Protect' },
    ],
  },
  {
    group: 'Others',
    items: [
      { icon: 'fa-bullhorn', label: 'Campaign center', to: '/morePages/campaign-center' },
      { icon: 'fa-gift', label: 'My rewards', to: '/morePages/my-rewards' },
      { icon: 'fa-ticket-alt', label: 'Referral', to: '/morePages/referral' },
      { icon: 'fa-users', label: 'Affiliates' },
      { icon: 'fa-flask', label: 'OKX Ventures' },
      { icon: 'fa-chart-line', label: 'Trade on TradingView' },
      { icon: 'fa-list-alt', label: 'Listing application' },
    ],
  },
];

const MoreDropdown = ({ visible }) => {
  if (!visible) return null;
  return (
    <div className="more-dropdown">
      <div className="dropdown-inner">
        {moreItems.map((group) => (
          <div className="dropdown-group" key={group.group}>
            <div className="dropdown-group-title">{group.group}</div>
            {group.items.map(item => (
              item.to ? (
                <Link
                  className="dropdown-item"
                  key={item.label}
                  to={item.to}
                  style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                >
                  <i className={`fas ${item.icon}`}></i>
                  <span>{item.label}</span>
                </Link>
              ) : (
                <div className="dropdown-item" key={item.label}>
                  <i className={`fas ${item.icon}`}></i>
                  <span>{item.label}</span>
                </div>
              )
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoreDropdown;
