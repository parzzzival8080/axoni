import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiChevronRight, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

const ChangePassword = () => {
  const navigate = useNavigate();
  
  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToWithdrawalRestriction, setAgreeToWithdrawalRestriction] = useState(false);
  
  // OTP verification states
  const [changePasswordStep, setChangePasswordStep] = useState('verify-otp'); // 'verify-otp', 'change'
  const [otp, setOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Get user email from localStorage
  const [userEmail, setUserEmail] = useState('');
  
  useEffect(() => {
    // Get user email from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.email) {
      setUserEmail(user.email);
      // Automatically send OTP when component mounts
      sendOTP(user.email);
    } else {
      // Redirect to login if user is not authenticated
      navigate('/login');
    }
  }, [navigate]);
  
  // Function to send OTP
  const sendOTP = async (email) => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const otpResponse = await axios.post(
        'https://django.axoni.co/api/user_account/password_reset/request',
        { email: email }
      );
      
      console.log('OTP request response:', otpResponse.data);
      
      if (otpResponse.data.success || otpResponse.data.message || otpResponse.data.Message) {
        setSuccess('OTP has been sent to your email');
        setOtpTimer(60); // Start 60 second timer
        setCanResendOtp(false);
      } else {
        setError(otpResponse.data.message || otpResponse.data.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP request error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
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
  
  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!canResendOtp) return;
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const otpResponse = await axios.post(
        'https://django.axoni.co/api/user_account/password_reset/resend-otp',
        { email: userEmail }
      );
      
      console.log('OTP resend response:', otpResponse.data);
      
      if (otpResponse.data.success || otpResponse.data.message || otpResponse.data.Message) {
        setSuccess('OTP has been resent to your email');
        setOtpTimer(60); // Reset timer
        setCanResendOtp(false);
      } else {
        setError(otpResponse.data.message || otpResponse.data.error || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP resend error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Verify OTP
  const handleVerifyOtp = async (e) => {
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
      const response = await axios.post('https://django.axoni.co/api/user_account/password_reset/verify_otp', {
        email: userEmail,
        otp: otp
      });
      
      console.log('OTP verification response:', response.data);
      
      // Handle success case with success and message fields
      if (response.data.success || response.data.Message) {
        setSuccess(response.data.message || response.data.Message || 'OTP verified successfully');
        setChangePasswordStep('change');
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
  
  // We're using handleResendOTP instead (defined above)
  
  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    // Validate passwords
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (!agreeToWithdrawalRestriction) {
      setError('Please agree to the withdrawal restriction');
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.post('https://django.axoni.co/api/user_account/password_reset/reset', {
        email: userEmail,
        otp: otp,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      console.log('Password change response:', response.data);
      
      // Check for success with message format
      if (response.data.success || response.data.message || response.data.Message) {
        setSuccess(response.data.message || response.data.Message || 'Password changed successfully');
        
        // Redirect back to security page after successful password change
        setTimeout(() => {
          navigate('/account/profile/security');
        }, 3000);
      } else {
        setError(response.data.error || 'Failed to change password. Please try again.');
      }
    } catch (err) {
      console.error('Password change error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] dark:bg-[#0a0a0a] text-white dark:text-white">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-[#5E6673] dark:text-[#5E6673] mb-8">
          <Link to="/account/profile/security" className="hover:text-[#2EBD85] transition-colors">
            Security center
          </Link>
          <FiChevronRight className="mx-2" />
          <span>Change login password</span>
        </div>

        {/* Page Title */}
        <h1 className="text-2xl font-semibold mb-8">Change login password</h1>
        
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

        {/* Step 1: Verify OTP - We skip the current password verification */}
        
        {/* Step 2: Verify OTP */}
        {changePasswordStep === 'verify-otp' && (
          <form onSubmit={handleVerifyOtp}>
            <div className="space-y-6">
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
                    placeholder="Enter verification code sent to your email"
                    className="w-full px-4 py-3 bg-[#1E1E1E] dark:bg-[#1E1E1E] border-0 rounded-md focus:ring-2 focus:ring-[#2EBD85] outline-none transition-all"
                    disabled={loading}
                  />
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-[#5E6673] dark:text-[#5E6673]">
                    {otpTimer > 0 ? `Resend code in ${otpTimer}s` : ''}
                  </span>
                  <button
                    type="button"
                    className={`text-sm ${canResendOtp ? 'text-[#2EBD85] hover:text-[#259A6C] cursor-pointer' : 'text-[#5E6673] cursor-not-allowed'}`}
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
                      ? 'bg-[#2EBD85] text-white hover:bg-[#259A6C]'
                      : 'bg-gray-300 dark:bg-gray-700 text-[#5E6673] dark:text-[#5E6673] cursor-not-allowed'
                  }`}
                  disabled={!otp || loading}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
          </form>
        )}
        
        {/* Step 3: Change Password */}
        {changePasswordStep === 'change' && (
          <form onSubmit={handleChangePassword}>
            <div className="space-y-6">
              {/* New Password Field */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                  New password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="w-full px-4 py-3 bg-[#1E1E1E] dark:bg-[#1E1E1E] border-0 rounded-md focus:ring-2 focus:ring-[#2EBD85] outline-none transition-all"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#5E6673]"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-[#5E6673] dark:text-[#5E6673]">
                  Password must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Enter your new password again"
                    className="w-full px-4 py-3 bg-[#1E1E1E] dark:bg-[#1E1E1E] border-0 rounded-md focus:ring-2 focus:ring-[#2EBD85] outline-none transition-all"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#5E6673]"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>

              {/* Withdrawal Restriction Agreement */}
              <div className="flex items-start mt-6">
                <div className="flex items-center h-5">
                  <input
                    id="withdrawalRestriction"
                    type="checkbox"
                    checked={agreeToWithdrawalRestriction}
                    onChange={() => setAgreeToWithdrawalRestriction(!agreeToWithdrawalRestriction)}
                    className="w-4 h-4 text-[#2EBD85] border-[#2A2A2A] rounded focus:ring-[#2EBD85]"
                    disabled={loading}
                  />
                </div>
                <label htmlFor="withdrawalRestriction" className="ml-2 text-xs text-[#848E9C] dark:text-[#5E6673]">
                  To protect your account, you won't be able to withdraw funds or use P2P to buy/sell crypto for 24 hours after you reset or change your account password.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className={`w-32 py-3 rounded-md font-medium transition-colors ${
                    newPassword && confirmPassword && agreeToWithdrawalRestriction && !loading
                      ? 'bg-[#2EBD85] text-white hover:bg-[#259A6C]'
                      : 'bg-gray-300 dark:bg-gray-700 text-[#5E6673] dark:text-[#5E6673] cursor-not-allowed'
                  }`}
                  disabled={!newPassword || !confirmPassword || !agreeToWithdrawalRestriction || loading}
                >
                  {loading ? 'Changing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Passkey Promotion */}
        <div className="fixed bottom-0 right-0 bg-[#0a0a0a] dark:bg-[#0a0a0a] p-4 rounded-tl-lg shadow-lg max-w-xs">
          <h3 className="font-bold text-lg">Passkeys</h3>
          <p className="text-sm text-[#848E9C] dark:text-[#5E6673]">One-click verification for secure login</p>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
