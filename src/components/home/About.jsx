import React, { useState } from 'react';
import what1 from '../../assets/video/what1.mp4';
import what2 from '../../assets/video/what2.mp4';
import what3 from '../../assets/video/what3.mp4';
import logo from '../../assets/logo/logo.png';

const About = () => {
  const [activeVideo, setActiveVideo] = useState(null);

  const videos = [
    {
      id: 1,
      src: what1,
      title: 'Coach Pop Questions',
      duration: '00:30'
    },
    {
      id: 2,
      src: what2,
      title: 'Rewire the system',
      duration: '00:17:37'
    },
    {
      id: 3,
      src: what3,
      title: 'Ambassador Story Series',
      duration: '00:08:14'
    }
  ];

  const togglePlay = (videoId) => {
    setActiveVideo(activeVideo === videoId ? null : videoId);
  };

  return (
    <section className="about">
      <h2>What is TradeX?</h2>
      <p>Find out why we're your new favorite crypto app with some help from our world-class partners.</p>
      <button type="button" className="find-out-btn">Find out</button>
      <div className="logo-large">
        <img src={logo} alt="TradeX Logo" />
      </div>
      <div className="video-gallery">
        {videos.map((video) => (
          <div className="video-card" key={video.id}>
            <div className="video-thumbnail">
              <video controls loop muted playsInline>
                <source src={video.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="video-controls">
                <button className="play-btn" onClick={() => togglePlay(video.id)}>
                  <i className={`fas fa-${activeVideo === video.id ? 'pause' : 'play'}`}></i>
                </button>
                <div className="video-time">{video.duration}</div>
              </div>
            </div>
            <p>{video.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default About; 