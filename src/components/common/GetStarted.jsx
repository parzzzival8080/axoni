import React from 'react';
import { useNavigate } from 'react-router-dom';
import GetStartedAsset from '../../assets/assets/Get Started Asset (1).png';

const GetStarted = () => {
  const navigate = useNavigate();

  const handleStartClick = () => {
    
    navigate('/');
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg text-center">
        {/* Image Container - Responsive and properly centered */}
        <div className="mb-2 sm:mb-3 flex justify-center">
           <div className="w-full max-w-[400px] sm:max-w-[500px] lg:max-w-[600px] flex items-center justify-center">
            <img 
              src={GetStartedAsset} 
              alt="Get started illustration" 
              className="w-full h-auto object-contain max-h-[300px] sm:max-h-[400px] lg:max-h-[450px]"
            />
          </div>
        </div>
        
        {/* Title - Responsive with better spacing */}
        <h1 className="text-xl sm:text-[28px] font-semibold text-gray-900 mb-8 sm:mb-10 lg:mb-12 px-4 leading-tight">
          Let's get you started
        </h1>
        
        {/* Start Button - Responsive with proper alignment */}
        <div className="flex justify-center px-4">
          <button 
            onClick={handleStartClick}
            className="w-full max-w-[365px] h-[45px] sm:h-[50px] bg-[#014EB2] hover:bg-[#e55a01] text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#014EB2] focus:ring-opacity-50 text-sm sm:text-base lg:text-lg flex items-center justify-center">
            START
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;