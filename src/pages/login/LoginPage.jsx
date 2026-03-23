import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import LoginForm from '../../components/login/LoginForm';
import LoginLeftPanel from '../../components/login/LoginLeftPanel';
import Navbar from '../../components/common/Navbar';
import { useIsMobile } from '../../hooks/useIsMobile';
import './Login.css';

const LoginPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <div className="layout">
      {isMobile ? (
        <div className="flex items-center px-4 h-12 bg-black">
          <button onClick={() => navigate("/")} className="flex items-center gap-1 text-white">
            <ChevronLeft size={20} />
            <span className="text-sm">Back</span>
          </button>
        </div>
      ) : (
        <Navbar />
      )}

      <div className="split-container">
        {/* Left Section (Dark) */}
        <LoginLeftPanel />

        {/* Right Section (White) */}
        <div className="right-section">
          <LoginForm />
        </div>
      </div>

      {!isMobile && (
        <div className="chat-bubble">
          <i className="fas fa-comment-dots"></i>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
