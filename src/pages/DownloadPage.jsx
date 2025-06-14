import React, { useState } from "react";

import "./DownloadPage.css";
import DownloadImage1 from "../assets/assets/asset1.png";
import DownloadImage2 from "../assets/assets/asset2.png";
import DownloadImage3 from "../assets/assets/Asset 3.png";
import logo from "../assets/logo/logo.png";
import ComingSoon from "../components/common/ComingSoon";

const DownloadPage = () => {
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  const openComingSoonModal = () => {
    setIsComingSoonOpen(true);
  };

  const closeComingSoonModal = () => {
    setIsComingSoonOpen(false);
  };

  const appDownloadUrl =
    "https://drive.google.com/file/d/1DUL9nHAo46Puc9S8--THRMvgAz9rQbj2/view?usp=sharing";

  const handleAppDownload = () => {
    // For Google Drive links, we need to convert the sharing URL to a direct download URL
    // This works for public Google Drive files
    const fileId = appDownloadUrl.split("/")[5]; // Extract the file ID from the URL
    const directDownloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    window.open(directDownloadUrl, "_blank", "noopener,noreferrer");

    // Create a temporary anchor element to trigger the download
    const downloadLink = document.createElement("a");
    downloadLink.href = directDownloadUrl;
    downloadLink.setAttribute("download", "flux.apk");
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };
  return (
    <div className="landing">
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
            <p className="landing__tagline">
              Crypto trading — made easy for you
            </p>
            <div
              className="landing__buttons"
              style={{ display: "flex", gap: "20px", marginTop: "20px" }}
            >
              <a
                href="/landing/playstore.html"
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
              <a
                href="/landing/appstore.html"
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
            {/* Placeholder for phone mockups */}
            <img src={DownloadImage1} alt="download-img-1" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="landing__features">
        <div className="landing__container landing__container--reverse">
          <div className="landing__features-image">
            {/* Placeholder for app screenshots */}
            <img src={DownloadImage2} alt="download-img-2" />
          </div>
          <div className="landing__features-content">
            <h2 className="landing__section-title">One app</h2>
            <h3 className="landing__section-subtitle">
              <span className="text-[#ff6901]">Unlimited</span> possibilities
            </h3>
            <p className="landing__description">
              Download the FLUX app to trade crypto on the go. Gain access to
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
              <span className="text-[#ff6901]">Powerful</span> platform
            </h2>
            <h3 className="landing__section-subtitle">
              Trade like a <span className="text-[#ff6901]">pro</span>
            </h3>
            <p className="landing__description">
              Trade crypto like a pro with our crypto trading platform on your
              desktop. Experience the fastest transactions and our powerful API
              on Window or MacOS today.
            </p>
          </div>
          <div className="landing__platform-image">
            {/* Placeholder for desktop platform screenshot */}
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
              <h3 className="landing__logo-text">FLUX APP</h3>
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
    </div>
  );
};

export default DownloadPage;
