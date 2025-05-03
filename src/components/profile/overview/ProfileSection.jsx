import React from 'react';
import './ProfileSection.css';

const ProfileSection = () => {
  const profileData = {
    username: "Doe***@gmail.com",
    userId: "676742689443800709",
    email: "Doe***@gmail.com",
    identityVerification: "Verified",
    countryRegion: "Philippines",
    tradingFeeTier: "Level 1"
  };

  const sectionItems = [
    {
      label: "Email",
      value: profileData.email,
      hasArrow: true
    },
    {
      label: "Identity verification",
      value: profileData.identityVerification,
      hasCheckmark: true,
      hasArrow: true,
      isVerified: true
    },
    {
      label: "Country/Region",
      value: profileData.countryRegion,
      hasArrow: true
    },
    {
      label: "Trading fee tier",
      value: profileData.tradingFeeTier,
      hasArrow: true
    }
  ];

  return (
    <section className="profile-section-component">
      <div className="profile-header">
        <div className="avatar-wrapper">
          <div className="avatar-large">
            <i className="fas fa-user"></i>
          </div>
          <div className="avatar-google-badge">
            <i className="fab fa-google"></i>
          </div>
        </div>
        
        <div className="profile-basic-info">
          <h2 className="profile-username">{profileData.username}</h2>
          <div className="profile-user-id">
            <span>{profileData.userId}</span>
            <button className="copy-button">
              <i className="far fa-copy"></i>
            </button>
          </div>
        </div>
        
        <div className="profile-details">
        {sectionItems.map((item, index) => (
          <div key={index} className="profile-detail-item">
            <label className="detail-label">{item.label}</label>
            <div className="detail-value">
              {item.hasCheckmark && (
                <i className={`fas fa-check-circle ${item.isVerified ? 'verified' : ''}`}></i>
              )}
              <span className={item.isVerified ? 'verified-text' : ''}>{item.value}</span>
              {item.hasArrow && <i className="fas fa-chevron-right arrow-icon"></i>}
            </div>
          </div>
        ))}
      </div>
        
        <button className="view-profile-button">
          <i className="far fa-user-circle"></i>
          View profile
        </button>
      </div>

      <div className="profile-divider"></div>

     
    </section>
  );
};

export default ProfileSection;