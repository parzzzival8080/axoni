import React from 'react';
import { Link } from 'react-router-dom';

const JourneyStep = ({ number, title, description, buttonText }) => (
  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 hover:bg-gray-900/70 transition-colors">
    <div className="mb-4">
      <span className="text-gray-400 text-sm font-medium">{number}</span>
      <h3 className="text-white text-lg font-semibold mt-1">{title}</h3>
    </div>
    <p className="text-gray-400 text-sm mb-6 leading-relaxed">{description}</p>
    <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors">
      {buttonText}
    </button>
  </div>
);

const Journey = () => {
  const steps = [
    {
      number: '01. Create Account',
      title: 'Create Account',
      description: 'Sign up in a few simple steps, then we\'ll guide you to success.',
      buttonText: 'Sign Up'
    },
    {
      number: '02. Fund Your Account',
      title: 'Fund Your Account',
      description: 'Add funds to your account to start your crypto journey with us.',
      buttonText: 'Deposit Now'
    },
    {
      number: '03. Start Trading',
      title: 'Start Trading',
      description: 'Set, buy or sell high crypto and explore new opportunities.',
      buttonText: 'Trading'
    }
  ];

  return (
    <div className="bg-black py-16">
      <div className="container mx-auto px-8 md:px-16 lg:px-24">
        <h2 className="text-2xl md:text-3xl font-bold mb-12 text-left text-white">
          How to Get Started
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <JourneyStep key={index} {...step} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Journey;