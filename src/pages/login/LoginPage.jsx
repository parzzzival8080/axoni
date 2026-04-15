import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import LoginForm from '../../components/login/LoginForm';
import LoginLeftPanel from '../../components/login/LoginLeftPanel';
import Navbar from '../../components/common/Navbar';
import { useIsMobile } from '../../hooks/useIsMobile';
import './Login.css';

const LoginPage = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  if (isMobile) {
    return (
      <div className="bg-[#0a0a0a] min-h-[100dvh] flex flex-col">
        {/* Mobile header */}
        <div className="flex items-center justify-between px-4 h-12 flex-shrink-0">
          <button onClick={() => navigate("/")} className="flex items-center gap-1 text-white">
            <ChevronLeft size={20} />
          </button>
          <span className="text-white text-base font-semibold">Log in</span>
          <button onClick={() => navigate("/signup")} className="text-[#2EBD85] text-sm font-medium">
            Sign up
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 px-5 pt-4 pb-8 overflow-y-auto">
          <LoginForm />
        </div>
      </div>
    );
  }

  // Desktop
  return (
    <div className="layout">
      <Navbar />
      <div className="split-container">
        <LoginLeftPanel />
        <div className="right-section">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
