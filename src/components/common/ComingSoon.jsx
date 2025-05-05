import React from 'react'
import './ComingSoon.css';
import ComingSoonImg from '../../assets/img/coming-soon.png';
import { useNavigate } from 'react-router-dom';

const ComingSoon = () => {
  const navigate = useNavigate();
  const handleGoBack = () => {
    // Using React Router v6
    navigate(-1);
  };
  return (
    <div className='coming-soon-container'>
        <div className='content'>
            <img src={ComingSoonImg} alt="hour-glass" />
            <h1 className='heading'>COMING SOON</h1>
            <p className="subtext">
                We're working hard to bring you this<br />
                feature. Stay tuned!
            </p>

            <button className="ok-button" aria-label="Acknowledge and close" onClick={handleGoBack}>
                OK
            </button>
        </div>
    </div>
  )
}

export default ComingSoon