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
    <nav className="bg-[#1E1E1E] border-b border-[#2A2A2A] w-full">
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
                      ? 'text-white font-medium'
                      : 'text-[#848E9C] hover:text-white'
                  }
                `}
              >
                <span className="whitespace-nowrap">
                  {item.label}
                  {item.badge && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-xs font-medium bg-[#2EBD85] text-white uppercase">
                      {item.badge}
                    </span>
                  )}
                </span>
                {location.pathname === item.path && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2EBD85]"></span>
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