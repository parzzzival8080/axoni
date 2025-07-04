import React from 'react';
import './ComingSoon.css';
import ComingSoonImg from '../../assets/img/coming-soon.png';

const ComingSoon = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='coming-soon-container' onClick={(e) => e.stopPropagation()}>
        <div className='content'>
          <div className="hourglass-container">
            <img src={ComingSoonImg} alt="hour-glass" />
          </div>
          <h1 className='heading text-[#F88726]'>COMING SOON</h1>
          <p className="subtext">
            We're working hard to bring you this<br />
            feature. Stay tuned!
          </p>

          <button className="ok-button" aria-label="Acknowledge and close" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;