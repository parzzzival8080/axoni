import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiChevronRight, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

const ChangeEmail = () => {
  const navigate = useNavigate();
  
  // Email states
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  // Step management
  const [changeEmailStep, setChangeEmailStep] = useState('request-otp'); // 'request-otp', 'verify-otp', 'change'
  
  // OTP timer states
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agreeToWithdrawalRestriction, setAgreeToWithdrawalRestriction] = useState(false);
  
  // Get user email from localStorage on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.email) {
      setCurrentEmail(user.email);
    } else {
      // Redirect to login if user is not authenticated
      navigate('/login');
    }
  }, [navigate]);
  
  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prevTimer => {
          if (prevTimer <= 1) {
            setCanResendOtp(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);
  
  // Step 1: Request OTP for Current Email
  const handleRequestOTP = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await axios.post(
        'https://django.COINCHIcoin.tech/api/user_account/email_reset/request',
        { email: currentEmail }
      );
      
      console.log('OTP request response:', response.data);
      
      if (response.data.success || response.data.message || response.data.Message) {
        setSuccess('OTP has been sent to your current email');
        setChangeEmailStep('verify-otp');
        setOtpTimer(60); // Start 60 second timer
        setCanResendOtp(false);
      } else {
        setError(response.data.message || response.data.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP request error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!canResendOtp) return;
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await axios.post(
        'https://django.COINCHIcoin.tech/api/user_account/email_reset/resend_otp',
        { email: currentEmail }
      );
      
      console.log('OTP resend response:', response.data);
      
      if (response.data.success || response.data.message || response.data.Message) {
        setSuccess('OTP has been resent to your current email');
        setOtpTimer(60); // Reset timer
        setCanResendOtp(false);
      } else {
        setError(response.data.message || response.data.error || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP resend error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Step 2: Verify Current Email OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.post(
        'https://django.COINCHIcoin.tech/api/user_account/email_reset/verify_otp',
        { email: currentEmail, otp: otp }
      );
      
      console.log('OTP verification response:', response.data);
      
      if (response.data.success || response.data.message || response.data.Message) {
        setSuccess('OTP verified successfully');
        setChangeEmailStep('change');
      } else {
        setError(response.data.message || response.data.error || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Step 3: Change Email
  const handleChangeEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    if (!agreeToWithdrawalRestriction) {
      setError('Please agree to the withdrawal restriction');
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.post(
        'https://django.COINCHIcoin.tech/api/user_account/email_reset/change',
        {
          email: currentEmail,
          otp: otp,
          new_email: newEmail
        }
      );
      
      console.log('Email change response:', response.data);
      
      if (response.data.success || response.data.message || response.data.Message) {
        setSuccess(response.data.message || response.data.Message || 'Email changed successfully. Confirmation emails have been sent to both addresses.');
        
        // Update user email in localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.email = newEmail;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect back to security page after successful email change
        setTimeout(() => {
          navigate('/account/profile/security');
        }, 3000);
      } else {
        setError(response.data.message || response.data.error || 'Failed to change email. Please try again.');
      }
    } catch (err) {
      console.error('Email change error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to change email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link to="/account/profile/security" className="hover:text-blue-500 transition-colors">
            Security center
          </Link>
          <FiChevronRight className="mx-2" />
          <span>Change email</span>
        </div>

        {/* Page Title */}
        <h1 className="text-2xl font-semibold mb-8">Change email</h1>

        {/* Warning Notice */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <FiAlertCircle className="h-5 w-5 text-black dark:text-white" />
            </div>
            <p className="ml-3 text-sm text-gray-700 dark:text-gray-300">
              To protect your account, you won't be able to withdraw funds or use P2P trading to sell crypto for 24 hours after you reset or change your account email.
            </p>
          </div>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-start">
              <FiAlertCircle className="text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-start">
              <FiCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
              <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
            </div>
          </div>
        )}
        
        {/* Step 1: Request OTP */}
        {changeEmailStep === 'request-otp' && (
          <div className="space-y-6">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                We'll send a verification code to your current email: <span className="font-medium">{currentEmail}</span>
              </p>
            </div>
            
            <div className="pt-4">
              <button
                onClick={handleRequestOTP}
                className="px-6 py-3 rounded-md bg-black text-white font-medium transition-colors hover:bg-gray-900 disabled:bg-gray-300 disabled:dark:bg-gray-700 disabled:text-gray-500 disabled:dark:text-gray-400 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send code'}
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Verify OTP */}
        {changeEmailStep === 'verify-otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium mb-2">
                Verification code
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter verification code"
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  disabled={loading}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Code sent to {currentEmail}
                </span>
                <button
                  type="button"
                  className={`text-sm ${canResendOtp ? 'text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
                  onClick={handleResendOTP}
                  disabled={!canResendOtp || loading}
                >
                  {otpTimer > 0 ? `Resend code (${otpTimer}s)` : 'Resend code'}
                </button>
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className={`w-32 py-3 rounded-md font-medium transition-colors ${
                  otp && !loading
                    ? 'bg-black text-white hover:bg-gray-900'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
                disabled={!otp || loading}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </form>
        )}
        
        {/* Step 3: Change Email */}
        {changeEmailStep === 'change' && (
          <form onSubmit={handleChangeEmail} className="space-y-6">
            <div>
              <label htmlFor="newEmail" className="block text-sm font-medium mb-2">
                New email address
              </label>
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border-0 rounded-md focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                disabled={loading}
              />
            </div>
            
            {/* Withdrawal Restriction Agreement */}
            <div className="flex items-start mt-6">
              <div className="flex items-center h-5">
                <input
                  id="withdrawalRestriction"
                  type="checkbox"
                  checked={agreeToWithdrawalRestriction}
                  onChange={() => setAgreeToWithdrawalRestriction(!agreeToWithdrawalRestriction)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <label htmlFor="withdrawalRestriction" className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                To protect your account, you won't be able to withdraw funds or use P2P to buy/sell crypto for 24 hours after you change your email address.
              </label>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className={`w-32 py-3 rounded-md font-medium transition-colors ${
                  newEmail && agreeToWithdrawalRestriction && !loading
                    ? 'bg-black text-white hover:bg-gray-900'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                }`}
                disabled={!newEmail || !agreeToWithdrawalRestriction || loading}
              >
                {loading ? 'Changing...' : 'Confirm'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChangeEmail;
