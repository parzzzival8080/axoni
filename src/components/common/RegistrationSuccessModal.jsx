import React, { useState, useEffect } from 'react';
import { CheckCircle, X, Sparkles, ArrowRight } from 'lucide-react';

const RegistrationSuccessModal = ({ isOpen, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setTimeout(() => setShowContent(true), 150);
    } else {
      setShowContent(false);
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-all duration-300 ${
      showContent ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all duration-300 relative ${
        showContent ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
      }`}>
        
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-20 bg-white">
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white bg-opacity-80 border border-gray-200 flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 shadow-sm"
          style={{ color: '#F88726' }}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content Container */}
        <div className="relative z-10 pt-12 pb-6">
          {/* Success Icon with Animation */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              {/* Animated Background Circle */}
              <div className="absolute inset-0 rounded-full animate-pulse opacity-20" style={{ backgroundColor: '#F88726' }}></div>
              <div className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: '#F88726' }}>
                <CheckCircle className="h-8 w-8 text-white" strokeWidth={2.5} />
                
                {/* Sparkle Effects */}
                <div 
                  className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-bounce" 
                  style={{ animationDelay: '0.5s' }}
                >
                  <Sparkles className="h-4 w-4" />
                </div>
                <div 
                  className="absolute -bottom-1 -left-1 h-3 w-3 animate-bounce" 
                  style={{ animationDelay: '1s', color: '#F88726' }}
                >
                  <Sparkles className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center px-6 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to FLUX!
            </h1>
            <div className="w-12 h-1 rounded-full mx-auto mb-3" style={{ backgroundColor: '#F88726' }}></div>
            <p className="text-gray-600 text-base leading-relaxed">
              Your account has been successfully created.<br />
              <span className="font-medium" style={{ color: '#F88726' }}>Get ready to start trading!</span>
            </p>
          </div>

          {/* Action Button */}
          <div className="px-6 mb-4">
            <button
              onClick={onClose}
              className="w-full group relative overflow-hidden text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              style={{ backgroundColor: '#F88726' }}
            >
              {/* Button Background Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: '#F88726' }}></div>
              
              <div className="relative flex items-center justify-center space-x-2">
                <span className="text-base">Continue to Dashboard</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </button>
          </div>

          {/* Subtle Footer */}
          <div className="text-center px-6">
            <p className="text-xs text-gray-400">
              Need help? Visit our{' '}
              <span className="hover:underline cursor-pointer font-medium" style={{ color: '#F88726' }}>
                support center
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccessModal;