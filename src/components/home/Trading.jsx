import React from 'react';
import tradingVideo from '../../assets/video/882D5049A31E763B.mp4';

const Trading = () => {
  return (
    <section className="trading">
      <h2>Trade like a pro</h2>
      <p>Get the lowest fees, fastest transactions, powerful APIs, and more.</p>
      <div className="trading-image">
        <video autoPlay loop muted playsInline preload="auto">
          <source src={tradingVideo} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
};

export default Trading; 