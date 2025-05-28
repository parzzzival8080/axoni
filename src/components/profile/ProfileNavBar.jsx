import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ProfileNavBar = () => {
  const location = useLocation();
  
  const navItems = [
    { label: 'Overview', path: '/account/overview' },
    { label: 'Profile', path: '/account/profile' },
    { label: 'Security', path: '/account/profile/security', badge: 'New' },
    { label: 'Verification', path: '/account/profile/verify' },
    
  ];

  return (
    <nav className="bg-white border-b border-gray-200 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex overflow-x-auto hide-scrollbar -mb-px">
          {navItems.map((item, index) => (
            <li key={index} className="flex-shrink-0">
              <Link 
                to={item.path} 
                className={`
                  group relative flex items-center py-3 px-1 mr-6 md:mr-8
                  text-sm font-medium transition-colors duration-200
                  ${
                    location.pathname === item.path
                      ? 'text-black font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                <span className="whitespace-nowrap">
                  {item.label}
                  {item.badge && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-xs font-medium bg-[#c8ff00] text-black uppercase">
                      {item.badge}
                    </span>
                  )}
                </span>
                {location.pathname === item.path && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </nav>
  );
};

export default ProfileNavBar;