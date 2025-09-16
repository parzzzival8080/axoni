import React, { useState, useEffect, useRef } from "react";
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiPlay,
  FiPause,
  FiRotateCcw,
} from "react-icons/fi";
import logo from "../../assets/logo/logo.png";

const TransferWalkthrough = ({ onClose, isOpen }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const overlayRef = useRef(null);

  const walkthroughSteps = [
    {
      id: "welcome",
      title: "Welcome to COINCHI Transfer",
      description:
        "Learn how to transfer cryptocurrencies between your Spot and Futures accounts instantly. Master account management and balance optimization.",
      target: null,
      position: "center",
      type: "welcome",
      duration: 0,
    },
    {
      id: "header",
      title: "Account Navigation",
      description:
        "You're in the Funding section where you can manage transfers between your different trading accounts. Access other account features from here.",
      target: ".flex.border-b.border-gray-200",
      position: "bottom",
      type: "highlight",
      duration: 4000,
    },
    {
      id: "asset-selection",
      title: "Select Asset to Transfer",
      description:
        "Choose which cryptocurrency you want to transfer. Use the search function to quickly find your desired asset from hundreds of available options.",
      target: ".transfer-asset-section",
      position: "right",
      type: "highlight",
      duration: 5000,
    },
    {
      id: "account-selection",
      title: "Choose Source & Destination",
      description:
        "Select which account to transfer from (Spot or Futures) and which account to transfer to. Use the swap button to quickly reverse the direction.",
      target: ".transfer-accounts-section",
      position: "top",
      type: "highlight",
      duration: 6000,
    },
    {
      id: "amount-input",
      title: "Enter Transfer Amount",
      description:
        'Specify how much you want to transfer. Click "Max" to transfer your entire available balance, or enter a custom amount.',
      target: ".transfer-amount-section",
      position: "right",
      type: "highlight",
      duration: 5000,
    },
    {
      id: "balance-display",
      title: "View Account Balances",
      description:
        "Monitor your current Spot and Futures balances for the selected asset. This helps you make informed transfer decisions.",
      target: ".transfer-balance-display",
      position: "top",
      type: "highlight",
      duration: 4000,
    },
    {
      id: "transfer-button",
      title: "Execute Transfer",
      description:
        "Click this button to execute your transfer. Ensure all details are correct before proceeding as transfers are processed immediately.",
      target: ".transfer-execute-button",
      position: "top",
      type: "highlight",
      duration: 4000,
    },
    {
      id: "transfer-history",
      title: "Transfer History",
      description:
        "View all your past transfers between accounts. Track assets, amounts, directions, and transaction status for complete transparency.",
      target: ".transfer-history-section",
      position: "top",
      type: "highlight",
      duration: 5000,
    },
    {
      id: "complete",
      title: "Transfer Mastery Achieved!",
      description:
        "You're now equipped to efficiently manage transfers between your Spot and Futures accounts. Start optimizing your trading strategy!",
      target: null,
      position: "center",
      type: "completion",
      duration: 0,
    },
  ];

  const currentStepData = walkthroughSteps[currentStep];

  useEffect(() => {
    if (isPlaying && hasStarted && currentStepData.duration > 0) {
      const timer = setTimeout(() => {
        if (currentStep < walkthroughSteps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          setIsPlaying(false);
        }
      }, currentStepData.duration);

      return () => clearTimeout(timer);
    }
  }, [currentStep, isPlaying, hasStarted, currentStepData.duration]);

  useEffect(() => {
    if (isOpen && currentStepData.target) {
      const targetElement = document.querySelector(currentStepData.target);
      if (targetElement) {
        // Check if element is visible
        const rect = targetElement.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;

        if (isVisible) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          // Add highlight class
          targetElement.classList.add("walkthrough-highlight");

          // Calculate spotlight position and size
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const radius = Math.max(rect.width, rect.height) / 2 + 40;

          // Apply spotlight CSS variables
          document.documentElement.style.setProperty(
            "--spotlight-x",
            `${centerX}px`
          );
          document.documentElement.style.setProperty(
            "--spotlight-y",
            `${centerY}px`
          );
          document.documentElement.style.setProperty(
            "--spotlight-radius",
            `${radius}px`
          );

          return () => {
            targetElement.classList.remove("walkthrough-highlight");
            // Clean up CSS variables
            document.documentElement.style.removeProperty("--spotlight-x");
            document.documentElement.style.removeProperty("--spotlight-y");
            document.documentElement.style.removeProperty("--spotlight-radius");
          };
        }
      }

      // Clean up any existing spotlight variables if element doesn't exist or isn't visible
      return () => {
        document.documentElement.style.removeProperty("--spotlight-x");
        document.documentElement.style.removeProperty("--spotlight-y");
        document.documentElement.style.removeProperty("--spotlight-radius");
      };
    }
  }, [currentStep, isOpen, currentStepData.target]);

  const handleStart = () => {
    setHasStarted(true);
    setCurrentStep(1);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setHasStarted(false);
    setIsPlaying(false);
  };

  const handleSkip = () => {
    setCurrentStep(walkthroughSteps.length - 1);
    setIsPlaying(false);
  };

  const getTooltipPosition = () => {
    if (!currentStepData.target) return {};

    const targetElement = document.querySelector(currentStepData.target);
    if (!targetElement) {
      // If target element doesn't exist, center the tooltip
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const position = currentStepData.position;

    // Check if element is visible
    if (
      rect.width === 0 ||
      rect.height === 0 ||
      rect.top < 0 ||
      rect.bottom > window.innerHeight
    ) {
      // If element is not visible, center the tooltip
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      };
    }

    switch (position) {
      case "top":
        return {
          top: rect.top - 20,
          left: rect.left + rect.width / 2,
          transform: "translateX(-50%) translateY(-100%)",
        };
      case "bottom":
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2,
          transform: "translateX(-50%)",
        };
      case "left":
        return {
          top: rect.top + rect.height / 2,
          left: rect.left - 20,
          transform: "translateX(-100%) translateY(-50%)",
        };
      case "right":
        return {
          top: rect.top + rect.height / 2,
          left: rect.right + 20,
          transform: "translateY(-50%)",
        };
      default:
        return {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        };
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-[10000] animate-in fade-in duration-300" />

      {/* Spotlight Effect */}
      {currentStepData.target &&
        (() => {
          const targetElement = document.querySelector(currentStepData.target);
          const isVisible =
            targetElement && targetElement.getBoundingClientRect().width > 0;
          return isVisible;
        })() && (
          <div
            className="fixed inset-0 pointer-events-none z-[9998] animate-in fade-in duration-300"
            style={{
              background: `radial-gradient(circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), transparent var(--spotlight-radius, 150px), rgba(0, 0, 0, 0.85) calc(var(--spotlight-radius, 150px) + 30px))`,
            }}
          />
        )}

      {/* Main tooltip/modal */}
      <div
        ref={overlayRef}
        className={`fixed z-[10001] bg-gradient-to-br from-zinc-900 to-zinc-800 border border-blue-500/40 rounded-3xl shadow-2xl backdrop-blur-xl text-white animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 ${
          currentStepData.type === "welcome" ||
          currentStepData.type === "completion"
            ? "w-[400px] min-w-[320px]"
            : "w-[320px] min-w-[260px]"
        }`}
        style={
          currentStepData.position === "center"
            ? { top: "50%", left: "50%", transform: "translate(-50%, -50%)" }
            : getTooltipPosition()
        }
      >
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
          <div className="flex-1">
            <span className="block text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">
              {currentStep + 1} of {walkthroughSteps.length}
            </span>
            <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500 relative"
                style={{
                  width: `${
                    ((currentStep + 1) / walkthroughSteps.length) * 100
                  }%`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <FiX size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {currentStepData.type === "welcome" && (
            <div className="text-center py-4">
              <div className="relative w-20 h-20 mx-auto mb-6">
                {/* Pulse rings */}
                <div className="absolute inset-0 border-2 border-blue-500 rounded-full animate-ping" />
                <div className="absolute inset-0 border-2 border-blue-500 rounded-full animate-ping animation-delay-300" />
                <div className="absolute inset-0 border-2 border-blue-500 rounded-full animate-ping animation-delay-600" />
                {/* Logo */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/40">
                  <img
                    src={logo}
                    alt="COINCHI Logo"
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-3 bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
                {currentStepData.title}
              </h2>
              <p className="text-sm text-white/80 mb-6 leading-relaxed">
                {currentStepData.description}
              </p>
              <div className="flex justify-center gap-8 mb-3">
                <div className="text-center">
                  <span className="block text-lg font-bold text-blue-500 mb-0.5">
                    8
                  </span>
                  <span className="text-xs text-white/60 uppercase tracking-wide">
                    Key Features
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-lg font-bold text-blue-500 mb-0.5">
                    ~2min
                  </span>
                  <span className="text-xs text-white/60 uppercase tracking-wide">
                    Tour Duration
                  </span>
                </div>
              </div>
            </div>
          )}

          {currentStepData.type === "completion" && (
            <div className="text-center py-4">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="w-full h-full bg-blue-500 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-lg font-bold text-blue-500 mb-3">
                {currentStepData.title}
              </h2>
              <p className="text-sm text-white/80 mb-5 leading-relaxed">
                {currentStepData.description}
              </p>
              <div className="text-left bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 space-y-1.5">
                <div className="text-xs text-white/90 leading-tight">
                  <strong className="text-blue-500">💡 Pro Tip:</strong> Always
                  check balances before making large transfers
                </div>
                <div className="text-xs text-white/90 leading-tight">
                  <strong className="text-blue-500">🔄 Strategy:</strong> Keep
                  funds balanced between Spot and Futures for flexibility
                </div>
                <div className="text-xs text-white/90 leading-tight">
                  <strong className="text-blue-500">📊 Track:</strong> Monitor
                  transfer history for better account management
                </div>
              </div>
            </div>
          )}

          {currentStepData.type === "highlight" && (
            <div>
              <h3 className="text-base font-semibold text-white mb-2 leading-tight">
                {currentStepData.title}
              </h3>
              <p className="text-xs text-white/85 mb-3 leading-relaxed">
                {currentStepData.description}
              </p>
              {isPlaying && currentStepData.duration > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full origin-left transform scale-x-0"
                      style={{
                        animation: `scaleProgress ${currentStepData.duration}ms linear forwards`,
                      }}
                    />
                  </div>
                  <span className="text-xs text-white/60 italic">
                    Auto-advancing...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-4 py-3 border-t border-white/10">
          {currentStepData.type === "welcome" && (
            <div className="flex gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-white/10 text-white/80 border border-white/20 rounded-xl text-xs font-medium hover:bg-white/15 hover:text-white hover:border-white/30 transition-all duration-200 flex items-center gap-2"
              >
                Skip Tour
              </button>
              <button
                onClick={handleStart}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
              >
                <FiPlay size={14} /> Start Tour
              </button>
            </div>
          )}

          {currentStepData.type === "completion" && (
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleRestart}
                className="px-5 py-2.5 bg-white/10 text-white/80 border border-white/20 rounded-xl text-xs font-medium hover:bg-white/15 hover:text-white hover:border-white/30 transition-all duration-200 flex items-center gap-2"
              >
                <FiRotateCcw size={14} /> Restart Tour
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-xl text-xs font-semibold hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all duration-200"
              >
                Start Transferring
              </button>
            </div>
          )}

          {currentStepData.type === "highlight" && (
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <button
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="px-3 py-1.5 bg-white/10 text-white/80 border border-white/20 rounded-xl text-xs font-medium hover:bg-white/15 hover:text-white hover:border-white/30 transition-all duration-200 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/10"
                >
                  <FiChevronLeft size={12} /> Previous
                </button>

                <button
                  onClick={handlePlayPause}
                  className="p-1.5 bg-blue-500/10 text-blue-500 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-200"
                  title={isPlaying ? "Pause auto-advance" : "Play auto-advance"}
                >
                  {isPlaying ? <FiPause size={12} /> : <FiPlay size={12} />}
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentStep === walkthroughSteps.length - 1}
                  className="px-3 py-1.5 bg-white/10 text-white/80 border border-white/20 rounded-xl text-xs font-medium hover:bg-white/15 hover:text-white hover:border-white/30 transition-all duration-200 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white/10"
                >
                  Next <FiChevronRight size={12} />
                </button>
              </div>

              <button
                onClick={handleSkip}
                className="px-2 py-1.5 text-white/50 hover:text-white/80 text-xs transition-colors duration-200"
              >
                Skip to End
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .animation-delay-300 {
          animation-delay: 0.3s;
        }
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        .border-l-3 {
          border-left-width: 3px;
        }
        .walkthrough-highlight {
          position: relative;
          z-index: 10000;
          box-shadow: 0 0 0 3px rgba(0, 191, 255, 1),
            0 0 0 6px rgba(0, 191, 255, 0.5), 0 0 30px rgba(0, 191, 255, 0.8),
            0 0 60px rgba(0, 191, 255, 0.6);
          border-radius: 16px;
          transition: all 0.3s ease;
          background: rgba(254, 116, 0, 0.05);
          animation: highlightPulse 2s ease-in-out infinite;
        }
        @keyframes highlightPulse {
          0%,
          100% {
            box-shadow: 0 0 0 3px rgba(0, 191, 255, 1),
              0 0 0 6px rgba(0, 191, 255, 0.5), 0 0 30px rgba(0, 191, 255, 0.8),
              0 0 60px rgba(0, 191, 255, 0.6);
          }
          50% {
            box-shadow: 0 0 0 3px rgba(0, 191, 255, 1),
              0 0 0 6px rgba(0, 191, 255, 0.5), 0 0 30px rgba(0, 191, 255, 0.8),
              0 0 60px rgba(0, 191, 255, 0.6);
          }
        }
        @keyframes scaleProgress {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </>
  );
};

export default TransferWalkthrough;
