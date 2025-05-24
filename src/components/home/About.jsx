import React from 'react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ title, description, link }) => (
  <div className="bg-gray-900 p-6 rounded-xl hover:bg-gray-800 transition-colors">
    <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mb-4">
      <div className="w-6 h-6 text-orange-500">
        {/* Simple placeholder icon */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
    <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
    <p className="text-gray-400 mb-4">{description}</p>
    <Link
      to={link}
      className="text-orange-500 hover:text-orange-400 font-semibold transition-colors inline-flex items-center"
    >
      Learn more →
    </Link>
  </div>
);

const About = () => {
  const services = [
    {
      title: 'Spot Trading',
      description: 'Buy and sell cryptocurrencies instantly with competitive fees and deep liquidity.',
      link: '/spot'
    },
    {
      title: 'Perpetual Futures',
      description: 'Trade with up to 100x leverage on our advanced futures trading platform.',
      link: '/futures'
    },
    {
      title: 'Margin Trading',
      description: 'Increase your trading power with flexible leverage options.',
      link: '/margin'
    },
    {
      title: 'Token Listing',
      description: 'List your token on our exchange and reach millions of traders.',
      link: '/token-listing'
    }
  ];

  return (
    <div className="bg-black py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white">A variety of services for you to choose from</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;