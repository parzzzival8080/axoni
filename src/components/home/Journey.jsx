import React from 'react';
import { Link } from 'react-router-dom';

const JourneyStep = ({ number, title, description, link }) => (
  <div className="flex flex-col items-center text-center p-6 bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors">
    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mb-4 text-xl font-bold">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
    <p className="text-gray-400 mb-4">{description}</p>
    <Link
      to={link}
      className="text-orange-500 hover:text-orange-400 font-semibold transition-colors"
    >
      Get Started →
    </Link>
  </div>
);

const Journey = () => {
  const steps = [
    {
      number: '01',
      title: 'Create Account',
      description: 'Sign up for your free account in minutes',
      link: '/signup'
    },
    {
      number: '02',
      title: 'Fund Your Account',
      description: 'Add funds using crypto or bank transfer',
      link: '/wallet/deposit'
    },
    {
      number: '03',
      title: 'Start Trading',
      description: 'Buy, sell and trade top cryptocurrencies',
      link: '/spot'
    }
  ];

  return (
    <div className="bg-black py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center text-white">How to Get Started</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <JourneyStep key={step.number} {...step} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Journey;