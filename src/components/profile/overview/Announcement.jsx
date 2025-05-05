import React from 'react';
import './Announcement.css';

const Announcements = () => {
  const announcements = [
    {
      date: '04/28/2025',
      text: 'OKX to list perpetual futures for SIGN crypto'
    },
    {
      date: '04/28/2025',
      text: 'OKX to delist ZKJ margin trading pair and perpetual future'
    },
    {
      date: '04/25/2025',
      text: 'OKX to enable margin trading and Simple Earn for LAYER crypto'
    },
    {
      date: '04/25/2025',
      text: 'OKX to list LAYER (Solayer) for spot trading'
    }
  ];

  return (
    <div className="announcements">
      <div className="announcements-header">
        <h2 className="announcements-title">Announcements</h2>
        <button className="more-button">
          More
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>

      <ul className="announcements-list">
        {announcements.map((announcement, index) => (
          <li key={index} className="announcement-item">
            <span className="announcement-date">{announcement.date}</span>
            <p className="announcement-text">{announcement.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Announcements;