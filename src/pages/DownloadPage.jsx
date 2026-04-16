import React, { useState } from "react";
import "./DownloadPage.css";
import DownloadImage1 from "../assets/assets/asset1.png";
import DownloadImage2 from "../assets/assets/asset2.png";
import DownloadImage3 from "../assets/assets/laptop.png";
import logo from "../assets/logo/logo.png";
import ComingSoon from "../components/common/ComingSoon";

const getDevice = () => {
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/android/i.test(ua)) return 'android';
  if (/Mac/.test(ua)) return 'mac';
  if (/Win/.test(ua)) return 'windows';
  return 'other';
};

const isStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
};

const DownloadPage = () => {
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [noticeStore, setNoticeStore] = useState(null);
  const device = getDevice();
  const alreadyInstalled = isStandalone();

  const openComingSoonModal = () => setIsComingSoonOpen(true);
  const closeComingSoonModal = () => setIsComingSoonOpen(false);

  // Modified: openNoticeModal takes which store was clicked
  const openNoticeModal = (store) => (e) => {
    e.preventDefault();
    setNoticeStore(store);
    setIsNoticeOpen(true);
  };

  const closeNoticeModal = () => setIsNoticeOpen(false);

  const handleAlternativeDownload = () => {
    // You can customize alternative URLs per store if needed
    const url =
      noticeStore === "appstore"
        ? "https://api.axoni.co/api/v1/download-axoni-ios"
        : "https://api.axoni.co/api/v1/download-axoni-apk";

    window.open(url, "_blank");
    setIsNoticeOpen(false);
  };

  const appDownloadUrl = "/downloads/gld-app.apk";

  const handleAppDownload = () => {
    const downloadLink = document.createElement("a");
    downloadLink.href = appDownloadUrl;
    downloadLink.setAttribute("download", "GLD.apk");
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="landing">
      {/* Smart device banner */}
      {!alreadyInstalled && (
        <div style={{ background: '#1E1E1E', borderBottom: '1px solid #2A2A2A', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#2EBD85', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg>
            </div>
            <div>
              <p style={{ color: '#fff', fontSize: 13, fontWeight: 600, margin: 0 }}>GLD Trading App</p>
              <p style={{ color: '#5E6673', fontSize: 11, margin: 0 }}>
                {device === 'ios' ? 'Add to Home Screen for the best experience' :
                 device === 'android' ? 'Download the Android app (24MB)' :
                 'Trade crypto on any device'}
              </p>
            </div>
          </div>
          {device === 'ios' ? (
            <button onClick={() => { setNoticeStore('appstore'); setIsNoticeOpen(true); }} style={{ background: '#2EBD85', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Install
            </button>
          ) : device === 'android' ? (
            <a href="/downloads/gld-app.apk" download="GLD.apk" style={{ background: '#2EBD85', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', whiteSpace: 'nowrap' }}>
              Download
            </a>
          ) : (
            <button onClick={handleAppDownload} style={{ background: '#2EBD85', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              Download
            </button>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section className="landing__hero">
        <div className="landing__container">
          <div className="landing__hero-content">
            <h1 className="landing__title">
              A new alternative
              <br />
              to <span className="landing__highlight">your crypto</span>
              <br />
              <span className="landing__highlight">journey</span>
            </h1>
            <p className="landing__tagline">Crypto trading — made easy for you</p>
            <div
              className="landing__buttons"
              style={{ display: "flex", gap: "20px", marginTop: "20px" }}
            >
              {/* Play Store button — show warning modal first */}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setNoticeStore("playstore"); setIsNoticeOpen(true); }}
                style={{ display: "inline-block" }}
              >
                <img
                  src="/assets/img/playstore.webp"
                  alt="Get it on Google Play"
                  style={{
                    height: "50px",
                    cursor: "pointer",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.8)",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </a>

              {/* App Store button — PWA install guide */}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); setNoticeStore("appstore"); setIsNoticeOpen(true); }}
                style={{ display: "inline-block" }}
              >
                <img
                  src="/assets/img/appstore.png"
                  alt="Download on the App Store"
                  style={{
                    height: "50px",
                    cursor: "pointer",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.8)",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </a>
            </div>
          </div>
          <div className="landing__hero-image">
            {/* Crypto phone mockup SVG */}
            <div style={{ position: 'relative', width: 300, height: 400 }}>
              {/* Glow */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 250, height: 250, background: 'radial-gradient(circle, rgba(46,189,133,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
              <svg viewBox="0 0 260 440" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}>
                {/* Phone body */}
                <rect x="30" y="10" width="200" height="420" rx="28" fill="#1E1E1E" stroke="#2A2A2A" strokeWidth="1.5"/>
                {/* Screen */}
                <rect x="38" y="18" width="184" height="404" rx="22" fill="#0a0a0a"/>
                {/* Notch */}
                <rect x="100" y="22" width="60" height="5" rx="2.5" fill="#1E1E1E"/>
                {/* Status bar */}
                <text x="50" y="42" fill="#5E6673" fontSize="8" fontFamily="system-ui">GLD</text>
                <text x="190" y="42" fill="#5E6673" fontSize="8" fontFamily="system-ui">100%</text>
                {/* Balance section */}
                <text x="50" y="70" fill="#5E6673" fontSize="9" fontFamily="system-ui">Total Balance</text>
                <text x="50" y="95" fill="#fff" fontSize="22" fontWeight="700" fontFamily="system-ui">$12,450.83</text>
                <text x="50" y="112" fill="#2EBD85" fontSize="10" fontFamily="monospace">+$342.50 (+2.83%)</text>
                {/* Mini chart */}
                <path d="M50 140 Q80 155 100 135 Q120 115 140 125 Q160 135 180 118 Q200 105 210 110" stroke="#2EBD85" strokeWidth="2" fill="none"/>
                <path d="M50 140 Q80 155 100 135 Q120 115 140 125 Q160 135 180 118 Q200 105 210 110 L210 160 L50 160 Z" fill="url(#dlGreen)" opacity="0.15"/>
                {/* Action buttons */}
                <rect x="50" y="170" width="70" height="28" rx="6" fill="#2EBD85"/>
                <text x="72" y="188" fill="#fff" fontSize="10" fontWeight="600" fontFamily="system-ui">Deposit</text>
                <rect x="130" y="170" width="80" height="28" rx="6" fill="#1E1E1E" stroke="#2A2A2A" strokeWidth="1"/>
                <text x="147" y="188" fill="#fff" fontSize="10" fontWeight="500" fontFamily="system-ui">Withdraw</text>
                {/* Coin list */}
                <line x1="50" y1="210" x2="210" y2="210" stroke="#1E1E1E" strokeWidth="0.5"/>
                {/* BTC */}
                <circle cx="62" cy="232" r="10" fill="#F7931A" opacity="0.2"/><text x="58" y="236" fill="#F7931A" fontSize="9" fontWeight="700" fontFamily="system-ui">B</text>
                <text x="80" y="229" fill="#fff" fontSize="11" fontWeight="600" fontFamily="system-ui">BTC</text>
                <text x="80" y="241" fill="#5E6673" fontSize="8" fontFamily="system-ui">Bitcoin</text>
                <text x="175" y="229" fill="#fff" fontSize="10" fontWeight="500" fontFamily="monospace" textAnchor="end">$72,341</text>
                <text x="210" y="229" fill="#2EBD85" fontSize="9" fontFamily="monospace">+2.3%</text>
                {/* ETH */}
                <circle cx="62" cy="268" r="10" fill="#627EEA" opacity="0.2"/><text x="59" y="272" fill="#627EEA" fontSize="9" fontWeight="700" fontFamily="system-ui">E</text>
                <text x="80" y="265" fill="#fff" fontSize="11" fontWeight="600" fontFamily="system-ui">ETH</text>
                <text x="80" y="277" fill="#5E6673" fontSize="8" fontFamily="system-ui">Ethereum</text>
                <text x="175" y="265" fill="#fff" fontSize="10" fontWeight="500" fontFamily="monospace" textAnchor="end">$2,318</text>
                <text x="210" y="265" fill="#F6465D" fontSize="9" fontFamily="monospace">-0.4%</text>
                {/* SOL */}
                <circle cx="62" cy="304" r="10" fill="#9945FF" opacity="0.2"/><text x="59" y="308" fill="#9945FF" fontSize="9" fontWeight="700" fontFamily="system-ui">S</text>
                <text x="80" y="301" fill="#fff" fontSize="11" fontWeight="600" fontFamily="system-ui">SOL</text>
                <text x="80" y="313" fill="#5E6673" fontSize="8" fontFamily="system-ui">Solana</text>
                <text x="175" y="301" fill="#fff" fontSize="10" fontWeight="500" fontFamily="monospace" textAnchor="end">$83.52</text>
                <text x="210" y="301" fill="#2EBD85" fontSize="9" fontFamily="monospace">+5.6%</text>
                {/* XRP */}
                <circle cx="62" cy="340" r="10" fill="#fff" opacity="0.1"/><text x="58" y="344" fill="#fff" fontSize="9" fontWeight="700" fontFamily="system-ui">X</text>
                <text x="80" y="337" fill="#fff" fontSize="11" fontWeight="600" fontFamily="system-ui">XRP</text>
                <text x="80" y="349" fill="#5E6673" fontSize="8" fontFamily="system-ui">Ripple</text>
                <text x="175" y="337" fill="#fff" fontSize="10" fontWeight="500" fontFamily="monospace" textAnchor="end">$1.35</text>
                <text x="210" y="337" fill="#2EBD85" fontSize="9" fontFamily="monospace">+1.4%</text>
                {/* Bottom nav */}
                <line x1="38" y1="380" x2="222" y2="380" stroke="#1E1E1E" strokeWidth="0.5"/>
                <text x="65" y="400" fill="#2EBD85" fontSize="8" fontWeight="600" fontFamily="system-ui" textAnchor="middle">Home</text>
                <text x="115" y="400" fill="#5E6673" fontSize="8" fontFamily="system-ui" textAnchor="middle">Markets</text>
                <text x="160" y="400" fill="#5E6673" fontSize="8" fontFamily="system-ui" textAnchor="middle">Trade</text>
                <text x="200" y="400" fill="#5E6673" fontSize="8" fontFamily="system-ui" textAnchor="middle">Assets</text>
                {/* Gradient def */}
                <defs><linearGradient id="dlGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2EBD85"/><stop offset="100%" stopColor="#2EBD85" stopOpacity="0"/></linearGradient></defs>
              </svg>
              {/* Floating coins */}
              <div style={{ position: 'absolute', top: 30, right: -10, width: 40, height: 40, borderRadius: '50%', background: '#F7931A20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, animation: 'float 3s ease-in-out infinite' }}>₿</div>
              <div style={{ position: 'absolute', bottom: 80, left: -5, width: 32, height: 32, borderRadius: '50%', background: '#627EEA20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, animation: 'float 3s ease-in-out infinite 1s' }}>Ξ</div>
              <style>{`@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing__features">
        <div className="landing__container landing__container--reverse">
          <div className="landing__features-image">
            <img src={DownloadImage2} alt="download-img-2" />
          </div>
          <div className="landing__features-content">
            <h2 className="landing__section-title">One app</h2>
            <h3 className="landing__section-subtitle">
              <span className="text-[#2EBD85]">Unlimited</span> possibilities
            </h3>
            <p className="landing__description">
              Download the GLD app to trade crypto on the go. Gain access to
              diverse tokens and trading pairs, advanced market data and more!
            </p>
          </div>
        </div>
      </section>

      {/* Desktop Platform Section */}
      <section className="landing__platform">
        <div className="landing__container">
          <div className="landing__platform-content">
            <h2 className="landing__section-title">
              <span className="text-[#2EBD85]">Powerful</span> platform
            </h2>
            <h3 className="landing__section-subtitle">
              Trade like a <span className="text-[#2EBD85]">pro</span>
            </h3>
            <p className="landing__description">
              Trade crypto like a pro with our crypto trading platform on your
              desktop. Experience the fastest transactions and our powerful API
              on Window or MacOS today.
            </p>
          </div>
          <div className="landing__platform-image">
            <img src={DownloadImage3} alt="download-img-3" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing__footer">
        <div className="landing__container landing__container--footer">
          <div className="landing__footer-brand">
            <div className="landing__logo">
              <img src={logo} alt="logo" className="object-contain" />
              <h3 className="landing__logo-text">GLD APP</h3>
            </div>
            <p className="landing__footer-tagline">Crypto exchange on the go</p>
          </div>
          <div className="landing__footer-buttons">
            <button
              className="landing__button landing__button--dark landing__button--outline"
              onClick={handleAppDownload}
            >
              Download app
            </button>
            <button
              className="landing__button landing__button--dark landing__button--outline"
              onClick={openComingSoonModal}
            >
              Download Desktop
            </button>
          </div>
        </div>
      </footer>

      {/* Coming Soon Modal */}
      <ComingSoon isOpen={isComingSoonOpen} onClose={closeComingSoonModal} />

      {/* Install Modal */}
      {isNoticeOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={closeNoticeModal}>
          <div style={{ background: '#1E1E1E', borderRadius: 20, maxWidth: 400, width: '100%', padding: 28, border: '1px solid #2A2A2A' }} onClick={e => e.stopPropagation()}>
            {noticeStore === "appstore" ? (
              <>
                <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Install GLD on iOS</h2>
                <div style={{ background: '#2A2A2A', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                  <p style={{ color: '#848E9C', fontSize: 11, lineHeight: 1.5, margin: 0 }}>
                    This app is not available in your region through the official App Store. You can install it as a web app by following the steps below.
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#2EBD85', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontSize: 13, fontWeight: 700 }}>1</div>
                    <div>
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Open in Safari</p>
                      <p style={{ color: '#5E6673', fontSize: 11 }}>Open <strong style={{ color: '#2EBD85' }}>gldcoin.co</strong> in Safari browser</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#2EBD85', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontSize: 13, fontWeight: 700 }}>2</div>
                    <div>
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Tap the Share button</p>
                      <p style={{ color: '#5E6673', fontSize: 11 }}>Tap the <strong style={{ color: '#fff' }}>⬆ Share</strong> icon at the bottom of Safari</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#2EBD85', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#fff', fontSize: 13, fontWeight: 700 }}>3</div>
                    <div>
                      <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Add to Home Screen</p>
                      <p style={{ color: '#5E6673', fontSize: 11 }}>Scroll down and tap <strong style={{ color: '#fff' }}>Add to Home Screen</strong></p>
                    </div>
                  </div>
                </div>
                <button onClick={closeNoticeModal} style={{ width: '100%', marginTop: 20, padding: '12px 0', background: '#2EBD85', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Got it
                </button>
              </>
            ) : (
              <>
                <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Download GLD</h2>
                <div style={{ background: '#2A2A2A', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                  <p style={{ color: '#848E9C', fontSize: 11, lineHeight: 1.5, margin: 0 }}>
                    This app is not available in your region through the official Google Play Store. You can download it directly as an APK from an alternative source.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <a href="/downloads/gld-app.apk" download="GLD.apk" style={{ flex: 1, padding: '12px 0', background: '#2EBD85', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'center', textDecoration: 'none' }}>
                    Download APK
                  </a>
                  <button onClick={closeNoticeModal} style={{ flex: 1, padding: '12px 0', background: '#2A2A2A', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadPage;
