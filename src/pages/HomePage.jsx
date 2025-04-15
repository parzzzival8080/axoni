import React from 'react';
import Hero from '../components/home/Hero';
import Trading from '../components/home/Trading';
import Journey from '../components/home/Journey';
import About from '../components/home/About';
import FAQ from '../components/home/FAQ';

const HomePage = () => {
  return (
    <>
      <Hero />
      <Trading />
      <Journey />
      <About />
      <FAQ />
    </>
  );
};

export default HomePage; 