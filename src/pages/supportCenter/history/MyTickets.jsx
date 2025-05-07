import React from 'react';
import './MyTickets.css';

const MyTickets = () => {
  return (
    <div className="tickets-container">
      <div className="breadcrumb">
        <span className="breadcrumb-item">Support center</span>
        <span className="breadcrumb-separator"> &gt; </span>
        <span className="breadcrumb-item active">My tickets</span>
      </div>
      
      <div className="tickets-content">
        <h1 className="tickets-title">My tickets</h1>
        <p className="tickets-subtitle">Manage your open support tickets and review past inquires.</p>
        
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 30H20C18.9 30 18 30.9 18 32V55C18 56.1 18.9 57 20 57H50C51.1 57 52 56.1 52 55V32C52 30.9 51.1 30 50 30Z" stroke="black" strokeWidth="2" fill="none"/>
              <path d="M22 37H48" stroke="#777" strokeWidth="1.5"/>
              <path d="M22 44H48" stroke="#777" strokeWidth="1.5"/>
              <path d="M22 51H48" stroke="#777" strokeWidth="1.5"/>
              <circle cx="60" cy="28" r="12" fill="black"/>
              <path d="M67 35L73 41" stroke="black" strokeWidth="3" strokeLinecap="round"/>
              <path d="M53 25H25" stroke="#777" strokeWidth="1.5"/>
            </svg>
          </div>
          <h2 className="empty-state-title">No records found</h2>
          <p className="empty-state-message">You don't have any support tickets yet.</p>
        </div>
      </div>
    </div>
  );
};

export default MyTickets;