import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AppBanner = () => {
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('appBannerDismissed') === 'true');
  const navigate = useNavigate();

  // Only show on mobile browsers, not in standalone/PWA mode
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  if (!isMobile || isStandalone || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('appBannerDismissed', 'true');
  };

  return (
    <div style={{ background: '#1E1E1E', borderBottom: '1px solid #2A2A2A', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 100 }}>
      <button onClick={handleDismiss} style={{ background: 'none', border: 'none', color: '#5E6673', fontSize: 16, cursor: 'pointer', padding: 2, lineHeight: 1 }}>✕</button>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#2EBD85', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: '#fff', fontSize: 12, fontWeight: 600, margin: 0 }}>GLD App</p>
        <p style={{ color: '#5E6673', fontSize: 10, margin: 0 }}>Trade faster with the app</p>
      </div>
      <button
        onClick={() => { handleDismiss(); navigate('/download'); }}
        style={{ background: '#2EBD85', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
      >
        Get App
      </button>
    </div>
  );
};

export default AppBanner;
