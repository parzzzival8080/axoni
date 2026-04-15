import { useState, useEffect } from 'react';
import Logo from '../../assets/logo/logo.png';

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFadeOut(true), 2000);
    const timer2 = setTimeout(() => onComplete(), 2500);
    return () => { clearTimeout(timer1); clearTimeout(timer2); };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#0a0a0a] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#2EBD85]/[0.06] rounded-full blur-[120px]" />

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <img
          src={Logo}
          alt="GLD"
          className="h-16 mb-6 animate-pulse"
        />

        {/* Loading bar */}
        <div className="w-32 h-1 bg-[#1E1E1E] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2EBD85] rounded-full"
            style={{
              animation: 'splashLoad 2s ease-in-out forwards',
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes splashLoad {
          0% { width: 0%; }
          60% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
