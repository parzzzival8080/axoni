import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import HeroBanner from "./HeroBanner";
import {
  FaGoogle,
  FaApple,
  FaTelegramPlane,
  FaWallet,
  FaShieldAlt,
  FaCheckCircle,
} from "react-icons/fa";

const Hero = () => {
  const navigate = useNavigate();
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
    KYC_STATUS_BASE_URL: "https://api.axoni.co/api/v1/kyc-status",
    API_KEY: "5lPMMw7mIuyzQQDjlKJbe0dY",
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
    <div className="flex-1 space-y-5 md:space-y-6">
      {/* Desktop signup bar */}
      <div className="hidden md:flex items-center gap-4 bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-5">
        <div className="flex-1">
          <h3 className="text-white text-lg font-semibold mb-1">Start your crypto journey</h3>
          <p className="text-[#848E9C] text-sm">Register now and receive up to <span className="text-[#2EBD85] font-medium">$2,000</span> in rewards</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Email / Mobile"
            aria-label="Email or mobile number"
            className="bg-[#121212] border border-[#2A2A2A] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#2EBD85] text-sm w-56"
          />
          <Link
            to="/signup"
            className="bg-[#2EBD85] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#259A6C] transition-colors whitespace-nowrap"
          >
            Sign up
          </Link>
        </div>
      </div>

      {/* Mobile app-like layout */}
      <div className="md:hidden px-1 pt-2">
        <div className="text-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2EBD85] to-[#259A6C] flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold leading-tight mb-2">
            Trade Crypto with
            <br />
            <span className="text-[#2EBD85]">Confidence</span>
          </h1>
          <p className="text-[#848E9C] text-sm">
            Fast, secure, and reliable trading platform
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/signup"
            className="flex items-center justify-center w-full bg-[#2EBD85] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#259A6C] transition-colors"
          >
            Create Account
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center w-full bg-[#1E1E1E] border border-[#2A2A2A] text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-[#2A2A2A] transition-colors"
          >
            Log In
          </Link>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-3 text-center">
            <div className="w-9 h-9 rounded-full bg-[#2EBD85]/10 flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-[#2EBD85]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-[10px] text-[#848E9C] font-medium">Secure</p>
          </div>
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-3 text-center">
            <div className="w-9 h-9 rounded-full bg-[#2EBD85]/10 flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-[#2EBD85]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-[10px] text-[#848E9C] font-medium">Fast</p>
          </div>
          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-3 text-center">
            <div className="w-9 h-9 rounded-full bg-[#2EBD85]/10 flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-[#2EBD85]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-[10px] text-[#848E9C] font-medium">Low Fees</p>
          </div>
        </div>

        {/* Demo button */}
        <button
          onClick={() => navigate("/spot-trading")}
          className="w-full mt-4 text-[#2EBD85] text-sm font-medium py-2"
        >
          Try Demo Trading &rarr;
        </button>
      </div>
    </div>
  );

  // Content for logged in but unverified users
  const renderUnverifiedContent = () => (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-3">
        <FaShieldAlt className="text-[#2EBD85] text-2xl" />
        <p className="text-[#2EBD85] font-semibold">
          {isCheckingVerification
            ? "Checking Verification Status..."
            : "Account Verification Required"}
        </p>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
        Welcome,
        <br />
        <span className="text-[#2EBD85]">{userName}!</span>
      </h1>
      {isCheckingVerification ? (
        <div className="bg-[#2EBD85]/10 border border-[#2EBD85] rounded-lg p-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2EBD85]"></div>
            <p className="text-[#2EBD85] font-medium">
              Checking your verification status...
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#2EBD85]/10 border border-[#2EBD85] rounded-lg p-6">
          <h3 className="text-[#2EBD85] font-semibold mb-2">
            Complete Your Verification
          </h3>
          <p className="text-gray-300 mb-4">
            To access all trading features and ensure account security, please
            complete your identity verification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/account/profile/verify"
              className="bg-[#2EBD85] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#259A6C] transition-colors text-center"
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
          <FaShieldAlt className="text-[#2EBD85] text-2xl" />
        </div>
        <p className="text-[#2EBD85] font-semibold">
          Verification Under Review
        </p>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight">
        Almost There,
        <br />
        <span className="text-[#2EBD85]">{userName}!</span>
      </h1>
      <div className="bg-[#2EBD85]/10 border border-[#2EBD85] rounded-lg p-6">
        <h3 className="text-[#2EBD85] font-semibold mb-2">
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
            className="bg-[#2EBD85] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#259A6C] transition-colors text-center"
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
        <span className="text-[#2EBD85]">{userName}!</span>
      </h1>
      <p className="text-gray-300 text-lg">
        Your account is fully verified. Access all features and start trading
        with confidence.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        <Link
          to="/spot-trading"
          className="bg-[#2EBD85] text-white px-6 py-4 rounded-lg font-semibold hover:bg-[#259A6C] transition-colors text-center"
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
          <FaWallet className="text-[#2EBD85] text-xl mx-auto mb-2" />
          <h4 className="text-white font-medium text-sm">Deposit</h4>
        </Link>
        <Link
          to="/transfer"
          className="bg-gray-800/50 hover:bg-gray-700/50 p-4 rounded-lg transition-colors text-center"
        >
          <svg
            className="w-5 h-5 text-[#2EBD85] mx-auto mb-2"
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
            className="w-5 h-5 text-[#2EBD85] mx-auto mb-2"
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
            className="w-5 h-5 text-[#2EBD85] mx-auto mb-2"
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
            <span className="text-[#2EBD85] font-semibold">$2,000</span> worth
            of exclusive gifts for newcomers!
          </p>
          <Link
            to="/signup"
            className="bg-[#2EBD85] text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-[#259A6C] transition-colors whitespace-nowrap w-full sm:w-auto"
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
            <span className="text-[#2EBD85] font-semibold">under review</span>.
            You'll be notified once approved!
          </p>
          <Link
            to="/account/profile/verify"
            className="bg-[#2EBD85] text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-[#259A6C] transition-colors whitespace-nowrap w-full sm:w-auto"
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
            <span className="text-[#2EBD85] font-semibold">
              all trading features
            </span>{" "}
            and higher withdrawal limits!
          </p>
          <Link
            to="/account/profile/verify"
            className="bg-[#2EBD85] text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-[#259A6C] transition-colors whitespace-nowrap w-full sm:w-auto"
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
            <span className="text-[#2EBD85] font-semibold">Start trading</span>{" "}
            with access to all features.
          </p>
          <Link
            to="/spot-trading"
            className="bg-[#2EBD85] text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-[#259A6C] transition-colors whitespace-nowrap w-full sm:w-auto"
          >
            Start Trading
          </Link>
        </div>
      );
    }
  };

  // Determine which logged-in banner to show
  const getLoggedInHero = () => {
    if (!isLoggedIn) return null;

    let status = "verified";
    let heading = `Ready to Trade, ${userName}!`;
    let subtext = "Your account is fully verified. Access all features and start trading with confidence.";
    let statusLabel = "Account Verified";
    let statusColor = "#2EBD85";
    let primaryCta = { label: "Start Trading", link: "/spot-trading" };
    let secondaryCta = { label: "Dashboard", link: "/account/overview" };

    if (isCheckingVerification) {
      status = "checking";
      heading = `Welcome, ${userName}!`;
      subtext = "Checking your verification status...";
      statusLabel = "Checking...";
    } else if (verificationStatus === VERIFICATION_STATUS.PENDING) {
      status = "pending";
      heading = `Almost There, ${userName}!`;
      subtext = "Your documents are under review. You'll be notified by email once approved — usually within 24 hours.";
      statusLabel = "Under Review";
      statusColor = "#F0B90B";
      primaryCta = { label: "Check Status", link: "/account/profile/verify" };
      secondaryCta = { label: "View Profile", link: "/account/profile" };
    } else if (!isVerified) {
      status = "unverified";
      heading = `Welcome, ${userName}!`;
      subtext = "Complete identity verification to unlock all trading features and higher withdrawal limits.";
      statusLabel = "Verification Required";
      statusColor = "#F0B90B";
      primaryCta = { label: "Verify Account", link: "/account/profile/verify" };
      secondaryCta = { label: "View Profile", link: "/account/profile" };
    }

    return (
      <div className="relative w-full overflow-hidden bg-[#0a0a0a]" style={{ minHeight: 360 }}>
        {/* Background */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #0d1f17 0%, #0a0a0a 40%, #0a1e14 100%)" }} />
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-[#2EBD85]/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#2EBD85]/[0.03] rounded-full blur-[120px]" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-8 md:px-16 lg:px-24 flex items-center pt-10 pb-6" style={{ minHeight: 360 }}>
          <div className="flex items-start justify-between w-full gap-12">
            {/* Left */}
            <div className="flex-1 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-5" style={{ background: `${statusColor}15`, border: `1px solid ${statusColor}30` }}>
                {status === "checking" ? (
                  <div className="w-2 h-2 rounded-full bg-[#2EBD85] animate-pulse" />
                ) : status === "verified" ? (
                  <FaCheckCircle className="text-[#2EBD85] text-xs" />
                ) : (
                  <FaShieldAlt style={{ color: statusColor }} className="text-xs" />
                )}
                <span className="text-xs font-semibold" style={{ color: statusColor }}>{statusLabel}</span>
              </div>

              <h1 className="text-3xl lg:text-5xl font-bold text-white mb-3 leading-[1.1]">{heading}</h1>
              <p className="text-[#848E9C] text-base mb-8 leading-relaxed max-w-md">{subtext}</p>

              <div className="flex items-center gap-3">
                <Link to={primaryCta.link} className="bg-[#2EBD85] hover:bg-[#259A6C] text-white px-7 py-3 rounded-xl text-sm font-semibold transition-colors">
                  {primaryCta.label}
                </Link>
                <Link to={secondaryCta.link} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors">
                  {secondaryCta.label}
                </Link>
              </div>
            </div>

            {/* Right — Quick actions */}
            <div className="hidden lg:flex flex-col gap-3 w-72">
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5">
                <p className="text-[#5E6673] text-xs font-medium mb-4">Quick Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/deposit" className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                    <FaWallet className="text-[#2EBD85]" />
                    <span className="text-white text-xs">Deposit</span>
                  </Link>
                  <Link to="/transfer" className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round"><path d="M8 7h12l-4-4M16 17H4l4 4"/></svg>
                    <span className="text-white text-xs">Transfer</span>
                  </Link>
                  <Link to="/my-assets" className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
                    <span className="text-white text-xs">Assets</span>
                  </Link>
                  <Link to="/account/profile" className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 10-16 0"/></svg>
                    <span className="text-white text-xs">Profile</span>
                  </Link>
                </div>
              </div>
              {isVerified && (
                <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full bg-[#2EBD85] animate-pulse" />
                    <span className="text-[#848E9C] text-xs font-medium">Live Market</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium">BTC/USDT</span>
                      <span className="text-[#2EBD85] text-xs font-medium">+2.34%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium">ETH/USDT</span>
                      <span className="text-[#F6465D] text-xs font-medium">-1.12%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium">SOL/USDT</span>
                      <span className="text-[#2EBD85] text-xs font-medium">+5.67%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#121212] to-transparent" />
      </div>
    );
  };

  return (
    <div className="text-white relative z-0">
      {/* Desktop */}
      <div className="hidden md:block">
        {isLoggedIn ? getLoggedInHero() : <HeroBanner isLoggedIn={false} />}
      </div>

      {/* Mobile guest view */}
      <div className="md:hidden pb-2">
        <div className="container mx-auto px-4">
          {!isLoggedIn && renderGuestContent()}
        </div>
      </div>
    </div>
  );
};

export default Hero;
