import React from 'react';
import steps from '../../assets/video/steps.webm';

const Journey = () => {
  return (
    <section className="journey">
      <h2>With you every step of the way</h2>
      <p>From making your first crypto trade to becoming a seasoned trader, you'll get to go through the process. No question is too small. No answer too complex.</p>
      <div className="journey-illustrations">
        <video autoPlay loop muted playsInline preload="auto">
          <source src={steps} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
};

export default Journey; 