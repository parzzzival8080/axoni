import React from 'react';
import { Link } from 'react-router-dom';
import mobileApp from '../../assets/homepage/mobile-app.png';
import { FaGoogle, FaApple, FaTelegramPlane, FaWallet } from "react-icons/fa";

const Hero = () => {
  return (
    <div className="bg-black text-white relative z-0 pt-16 pb-20 md:pb-24 overflow-hidden">
      <div className="container mx-auto px-8 md:px-16 lg:px-24 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-6">
            <p className="text-orange-500 font-semibold">
              Better Liquidity, Better Trading
            </p>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Global Crypto
              <br />
              Derivatives Exchange
            </h1>
            <div className="flex items-center gap-4 mt-4">
              <input
                type="text"
                placeholder="Email / Mobile"
                className="bg-gray-800 text-white p-3 rounded-full focus:outline-none"
              />
              <button className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors">
                Sign up now
              </button>
            </div>
            <p className="text-gray-400 mt-2">Sign up now to win rewards</p>
            <p className="text-gray-400">Or continue with</p>
            <div className="flex gap-2">
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white text-xl">
                <FaGoogle />
              </div>
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white text-xl">
                <FaApple />
              </div>
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white text-xl">
                <FaTelegramPlane />
              </div>
              <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white text-xl">
                <FaWallet />
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            <img
              src={mobileApp}
              alt="Mobile Trading App"
              className="w-full max-w-[250px] mx-auto md:max-w-[530px] animate-float"
            />
          </div>
        </div>
      </div>
      
      {/* Bottom Signup Banner - Contained within Hero */}
      <div className="w-full bg-gray-800/80 backdrop-blur-sm py-3 px-4 text-center mt-8 rounded-lg mx-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-3 sm:space-y-0 max-w-4xl mx-auto">
          <p className="text-gray-300 text-sm sm:text-base sm:mr-2">
            Register now and receive up to{' '}
            <span className="text-orange-500 font-semibold">$2,000</span> worth of 
            exclusive gifts for newcomers!
          </p>
          <button className="bg-orange-500 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap w-full sm:w-auto">
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;