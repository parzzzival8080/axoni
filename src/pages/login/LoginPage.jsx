import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../../components/login/LoginForm';
import LoginLeftPanel from '../../components/login/LoginLeftPanel';
import Navbar from '../../components/common/Navbar';
import './Login.css';

const LoginPage = () => {
  return (
    <div className="layout">
      {/* Use the shared Navbar component */}
      <Navbar />

      <div className="split-container">
        {/* Left Section (Dark) */}
        <LoginLeftPanel />

        {/* Right Section (White) */}
        <div className="right-section">
          <LoginForm />
        </div>
      </div>

      <div className="chat-bubble">
        <i className="fas fa-comment-dots"></i>
      </div>
    </div>
  );
};

export default LoginPage; 