import React from 'react'
import ProfileNavBar from '../../components/profile/ProfileNavBar'
import '../Profile.css';
const Profile = () => {
    const profileData = {
        username: "Doe***@gmail.com",
        userId: "676742689443800709",
        email: "Doe***@gmail.com",
        phone: "****129",
        country: "Philippines",
        tradingLevel: "Level 1"
      };
  return (
    <div className='profile-container' style={{ backgroundColor: '#ffffff', margin: 0, maxWidth: '100%' }}>
        <div style={{ backgroundColor: '#ffffff', maxWidth: '1200px', margin: '0 auto' }}>
          <ProfileNavBar/>
          <h1 className="profile-title">Profile</h1>
      
      {/* Profile Avatar Section */}
      <section className="profile-section">
        <div className="profile-avatar-section">
          <div className="avatar-container">
            <div className="avatar">
              <i className="fas fa-user"></i>
              <button className="edit-avatar-btn">
                <i className="fas fa-edit"></i>
              </button>
            </div>
          </div>
          
          <div className="profile-info">
            <h2>Personal info</h2>
            
            <div className="info-row">
              <label>Nickname</label>
              <span className="info-value">{profileData.username}</span>
              <button className="action-btn">Change</button>
            </div>
            
            <div className="info-row">
              <label>User ID</label>
              <span className="info-value">{profileData.userId}</span>
              <button className="action-btn">Copy</button>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Info Section */}
      <section className="profile-section">
        <h2>Verification info</h2>
        
        <div className="info-row">
          <label>Identity verification</label>
          <span className="info-value verified">
            <i className="fas fa-check-circle"></i>
            Verified
          </span>
          <button className="action-btn secondary">View details</button>
        </div>
        
        <div className="info-row">
          <label>Country/Region</label>
          <span className="info-value">{profileData.country}</span>
          <button className="action-btn secondary">View details</button>
        </div>
      </section>

      {/* Account Details Section */}
      <section className="profile-section">
        <h2>Account details</h2>
        
        <div className="info-row">
          <label>Email</label>
          <span className="info-value">{profileData.email}</span>
          <button className="action-btn">Change</button>
        </div>
        
        <div className="info-row">
          <label>Phone</label>
          <span className="info-value">{profileData.phone}</span>
          <button className="action-btn">Change</button>
        </div>
        
        <div className="info-row">
          <label>Connected accounts</label>
          <span className="info-value">
            <i className="fab fa-google"></i>
          </span>
          <button className="action-btn secondary">Manage</button>
        </div>
        
        <div className="info-row">
          <label>Trading fee tier</label>
          <span className="info-value">{profileData.tradingLevel}</span>
          <button className="action-btn secondary">View details</button>
        </div>
      </section>
        </div>
    </div>
  )
}

export default Profile