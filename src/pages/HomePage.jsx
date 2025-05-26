import React from 'react';
import Hero from '../components/home/Hero';
import Trading from '../components/home/Trading';
import Journey from '../components/home/Journey';
import About from '../components/home/About';
import News from '../components/home/News';
import FAQ from '../components/home/FAQ';
import TradingGame from '../components/home/TradingGame';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-black">
      <Hero />
      <TradingGame />
      <Trading />
      <Journey />
      <About />
      <News />
      <FAQ />

    </div>
  );
};

export default HomePage; 