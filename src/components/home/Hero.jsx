import React from 'react';
import { Link } from 'react-router-dom';
import mobileApp from '../../assets/homepage/mobile-app.png';

const Hero = () => {
  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-6">
            <p className="text-orange-500 font-semibold">Better Liquidity, Better Trading</p>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Global Crypto<br />
              Derivatives Exchange
            </h1>
            <div className="flex items-center gap-4 mt-4">
              <input type="text" placeholder="Email / Mobile" className="bg-gray-800 text-white p-3 rounded-full focus:outline-none" />
              <button className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors">
                Sign up now
              </button>
            </div>
            <p className="text-gray-400 mt-2">Sign up now to win rewards</p>
            <p className="text-gray-400">Or continue with</p>
            <div className="flex gap-2">
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
              <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
            </div>
          </div>
          <div className="flex-1 relative">
            <img
              src={mobileApp}
              alt="Mobile Trading App"
              className="w-full max-w-[200px] mx-auto md:max-w-none animate-float"
            />
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Register now and receive up to <span className="text-orange-500">$2,000</span> worth of exclusive gifts for newcomers!
          </p>
          <button className="mt-4 bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors">
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;