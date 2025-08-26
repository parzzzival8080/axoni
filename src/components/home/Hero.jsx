import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import mobileApp from "../../assets/homepage/mobile-app.png";
import {
  FaGoogle,
  FaApple,
  FaTelegramPlane,
  FaWallet,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";

const Hero = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  // Verification status enum (same as VerifyPage)
  const VERIFICATION_STATUS = {
    NOT_STARTED: "not_started",
    PENDING: "pending",
    VERIFIED: "verified",
    REJECTED: "rejected",
  };

  // API configuration (same as VerifyPage)
  const API_CONFIG = {
    KYC_STATUS_BASE_URL: "https://api.fluxcoin.tech/api/v1/kyc-status",
    API_KEY: "A20RqFwVktRxxRqrKBtmi6ud",
  };

  // Fetch verification status from API (same method as VerifyPage)
  const fetchVerificationStatus = useCallback(async (uid) => {
    if (!uid) {
      return VERIFICATION_STATUS.NOT_STARTED;
    }

    try {
      const response = await fetch(
        `${API_CONFIG.KYC_STATUS_BASE_URL}/${uid}?apikey=${API_CONFIG.API_KEY}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          mode: "cors",
          credentials: "omit",
        },
      );

      if (!response.ok) {
        console.log(
          `KYC status API returned ${response.status}, treating as not started`,
        );
        return VERIFICATION_STATUS.NOT_STARTED;
      }

      const data = await response.json();
      console.log("KYC Status API Response:", data);

      if (data.status) {
        const status = data.status.toLowerCase();
        switch (status) {
          case "pending":
            return VERIFICATION_STATUS.PENDING;
          case "verified":
          case "approved":
            return VERIFICATION_STATUS.VERIFIED;
          case "rejected":
          case "declined":
            return VERIFICATION_STATUS.REJECTED;
          default:
            return VERIFICATION_STATUS.NOT_STARTED;
        }
      }

      return VERIFICATION_STATUS.NOT_STARTED;
    } catch (error) {
      console.error("Error fetching verification status:", error);
      return VERIFICATION_STATUS.NOT_STARTED;
    }
  }, []);

  useEffect(() => {
    const checkAuthAndVerification = async () => {
      // Check authentication status
      const authToken = localStorage.getItem("authToken");
      const fullName = localStorage.getItem("fullName");
      const userEmail = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")).email
        : "";

      if (authToken) {
        setIsLoggedIn(true);
        setUserName(fullName || "User");
        setEmail(userEmail);

        // Check verification status via API
        const storedUid = localStorage.getItem("uid");
        if (storedUid) {
          setIsCheckingVerification(true);
          try {
            const status = await fetchVerificationStatus(storedUid);
            setVerificationStatus(status);
            setIsVerified(status === VERIFICATION_STATUS.VERIFIED);
            console.log("Hero verification status:", status);
          } catch (error) {
            console.error(
              "Failed to check verification status in Hero:",
              error,
            );
            setVerificationStatus(VERIFICATION_STATUS.NOT_STARTED);
            setIsVerified(false);
          } finally {
            setIsCheckingVerification(false);
          }
        } else {
          setIsVerified(false);
        }
      } else {
        setIsLoggedIn(false);
        setIsVerified(false);
      }
    };

    checkAuthAndVerification();
  }, [fetchVerificationStatus]);

  // Content for non-logged in users
  const renderGuestContent = () => (
    <div className="flex-1 space-y-6">
      <p className="text-[#F88726] font-semibold">
        Better Liquidity, Better Trading
      </p>
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
        Global Cryptocurrency
        <br />
        Derivatives Exchange
      </h1>
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
        <input
          type="text"
          placeholder="Email / Mobile"
          className="bg-gray-800 text-white p-3 rounded-full focus:outline-none w-full sm:flex-1 sm:max-w-xs"
        />
        <Link
          to="/signup"
          className="bg-[#F88726] text-black px-8 py-3 rounded-full font-semibold bg:hover-[#F88726] transition-colors w-full sm:w-auto"
        >
          Sign up now
        </Link>
      </div>
      <p className="text-gray-400 mt-2">Sign up now to win rewards</p>

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <Link
          to="/login"
          className="border border-gray-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors text-center"
        >
          Log in
        </Link>
        <Link
          to="/spot-trading"
          className="bg-gray-800 text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-700 transition-colors text-center"
        >
          Trade Demo
        </Link>
      </div>
    </div>
  );

  // Content for logged in but unverified users
  const renderUnverifiedContent = () => (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-3">
        <FaShieldAlt className="text-yellow-500 text-2xl" />
        <p className="text-yellow-500 font-semibold">
          {isCheckingVerification
            ? "Checking Verification Status..."
            : "Account Verification Required"}
        </p>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
        Welcome,
        <br />
        <span className="text-[#F88726]">{userName}!</span>
      </h1>
      {isCheckingVerification ? (
        <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
            <p className="text-blue-400 font-medium">
              Checking your verification status...
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-6">
          <h3 className="text-yellow-400 font-semibold mb-2">
            Complete Your Verification
          </h3>
          <p className="text-gray-300 mb-4">
            To access all trading features and ensure account security, please
            complete your identity verification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/account/profile/verify"
              className="bg-[#F88726] text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors text-center"
            >
              Verify Account
            </Link>
            <Link
              to="/account/profile"
              className="border border-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center"
            >
              View Profile
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <h4 className="text-white font-medium mb-2">Limited Access</h4>
          <p className="text-gray-400 text-sm">
            Some features are restricted until verification
          </p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <h4 className="text-white font-medium mb-2">Quick Verification</h4>
          <p className="text-gray-400 text-sm">
            Usually completed within minutes
          </p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <h4 className="text-white font-medium mb-2">Full Features</h4>
          <p className="text-gray-400 text-sm">
            Access all trading and withdrawal features
          </p>
        </div>
      </div>
    </div>
  );

  // Content for pending verification users
  const renderPendingContent = () => (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-3">
        <div className="animate-pulse">
          <FaShieldAlt className="text-orange-500 text-2xl" />
        </div>
        <p className="text-orange-500 font-semibold">
          Verification Under Review
        </p>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
        Almost There,
        <br />
        <span className="text-[#F88726]">{userName}!</span>
      </h1>
      <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-6">
        <h3 className="text-orange-400 font-semibold mb-2">
          Verification Under Review
        </h3>
        <p className="text-gray-300 mb-4">
          Your verification documents have been submitted and are currently
          being reviewed. You will be notified by email once your account is
          verified. This may take up to 24 hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/account/profile/verify"
            className="bg-[#F88726] text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors text-center"
          >
            Check Status
          </Link>
          <Link
            to="/account/profile"
            className="border border-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-center"
          >
            View Profile
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <h4 className="text-white font-medium mb-2">Under Review</h4>
          <p className="text-gray-400 text-sm">
            Your documents are being processed
          </p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <h4 className="text-white font-medium mb-2">Email Notification</h4>
          <p className="text-gray-400 text-sm">
            You'll be notified once approved
          </p>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <h4 className="text-white font-medium mb-2">Limited Trading</h4>
          <p className="text-gray-400 text-sm">
            Some features available while pending
          </p>
        </div>
      </div>
    </div>
  );

  // Content for verified users
  const renderVerifiedContent = () => (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-3">
        <FaCheckCircle className="text-green-500 text-2xl" />
        <p className="text-green-500 font-semibold">Account Verified</p>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
        Ready to Trade,
        <br />
        <span className="text-[#F88726]">{userName}!</span>
      </h1>
      <p className="text-gray-300 text-lg">
        Your account is fully verified. Access all features and start trading
        with confidence.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <Link
          to="/spot-trading"
          className="bg-[#F88726] text-white px-6 py-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors text-center"
        >
          Start Trading
        </Link>
        <Link
          to="/account/overview"
          className="bg-gray-800 text-white px-6 py-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-center"
        >
          View Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-6">
        <Link
          to="/deposit"
          className="bg-gray-800/50 hover:bg-gray-700/50 p-4 rounded-lg transition-colors text-center"
        >
          <FaWallet className="text-[#F88726] text-xl mx-auto mb-2" />
          <h4 className="text-white font-medium text-sm">Deposit</h4>
        </Link>
        <Link
          to="/transfer"
          className="bg-gray-800/50 hover:bg-gray-700/50 p-4 rounded-lg transition-colors text-center"
        >
          <svg
            className="w-5 h-5 text-[#F88726] mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
            ></path>
          </svg>
          <h4 className="text-white font-medium text-sm">Transfer</h4>
        </Link>
        <Link
          to="/my-assets"
          className="bg-gray-800/50 hover:bg-gray-700/50 p-4 rounded-lg transition-colors text-center"
        >
          <svg
            className="w-5 h-5 text-[#F88726] mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            ></path>
          </svg>
          <h4 className="text-white font-medium text-sm">Assets</h4>
        </Link>
        <Link
          to="/account/profile"
          className="bg-gray-800/50 hover:bg-gray-700/50 p-4 rounded-lg transition-colors text-center"
        >
          <svg
            className="w-5 h-5 text-[#F88726] mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            ></path>
          </svg>
          <h4 className="text-white font-medium text-sm">Profile</h4>
        </Link>
      </div>
    </div>
  );

  // Bottom banner content based on user status
  const renderBottomBanner = () => {
    if (!isLoggedIn) {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-3 sm:space-y-0 max-w-4xl mx-auto">
          <p className="text-gray-300 text-sm sm:text-base sm:mr-2">
            Register now and receive up to{" "}
            <span className="text-[#F88726] font-semibold">$2,000</span> worth
            of exclusive gifts for newcomers!
          </p>
          <Link
            to="/signup"
            className="bg-[#F88726] text-black px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap w-full sm:w-auto"
          >
            Sign up
          </Link>
        </div>
      );
    } else if (verificationStatus === VERIFICATION_STATUS.PENDING) {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-3 sm:space-y-0 max-w-4xl mx-auto">
          <p className="text-gray-300 text-sm sm:text-base sm:mr-2">
            Your verification is{" "}
            <span className="text-orange-500 font-semibold">under review</span>.
            You'll be notified once approved!
          </p>
          <Link
            to="/account/profile/verify"
            className="bg-[#F88726] text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap w-full sm:w-auto"
          >
            Check Status
          </Link>
        </div>
      );
    } else if (!isVerified) {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-3 sm:space-y-0 max-w-4xl mx-auto">
          <p className="text-gray-300 text-sm sm:text-base sm:mr-2">
            Complete your verification to unlock{" "}
            <span className="text-[#F88726] font-semibold">
              all trading features
            </span>{" "}
            and higher withdrawal limits!
          </p>
          <Link
            to="/account/profile/verify"
            className="bg-[#F88726] text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap w-full sm:w-auto"
          >
            Verify Now
          </Link>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-3 sm:space-y-0 max-w-4xl mx-auto">
          <p className="text-gray-300 text-sm sm:text-base sm:mr-2">
            Welcome back! Your account is fully verified.{" "}
            <span className="text-[#F88726] font-semibold">Start trading</span>{" "}
            with access to all features.
          </p>
          <Link
            to="/spot-trading"
            className="bg-[#F88726] text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-orange-600 transition-colors whitespace-nowrap w-full sm:w-auto"
          >
            Start Trading
          </Link>
        </div>
      );
    }
  };

  return (
    <div className="bg-black text-white relative z-0 pt-16 pb-20 md:pb-24 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24 py-8 md:py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Render content based on user status */}
          {!isLoggedIn && renderGuestContent()}
          {isLoggedIn &&
            verificationStatus === VERIFICATION_STATUS.PENDING &&
            renderPendingContent()}
          {isLoggedIn &&
            !isVerified &&
            verificationStatus !== VERIFICATION_STATUS.PENDING &&
            renderUnverifiedContent()}
          {isLoggedIn && isVerified && renderVerifiedContent()}

          <div className="flex-1 relative">
            <img
              src={mobileApp}
              alt="Mobile Trading App"
              className="w-full max-w-xs mx-auto md:max-w-[530px] animate-float"
            />
          </div>
        </div>
      </div>

      {/* Bottom Banner - Changes based on user status */}
      <div className="w-full bg-gray-800/80 backdrop-blur-sm py-3 px-4 text-center mt-8 rounded-lg mx-auto max-w-7xl">
        {renderBottomBanner()}
      </div>
    </div>
  );
};

export default Hero;
