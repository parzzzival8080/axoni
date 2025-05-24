import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const LoginForm = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot password states
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('request'); // 'request', 'verify', 'reset'
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResendOtp, setCanResendOtp] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
    setForgotPasswordMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
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
  
  // Handle forgot password mode
  const handleForgotPassword = () => {
    setForgotPasswordMode(true);
    setForgotPasswordStep('request');
    setResetEmail(credentials.email || '');
    setError('');
    setSuccess('');
  };
  
  // Handle back button in forgot password flow
  const handleBackToLogin = () => {
    setForgotPasswordMode(false);
    setError('');
    setSuccess('');
  };
  
  // Request password reset
  const handleRequestPasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.post('https://django.bhtokens.com/api/user_account/password_reset/request', {
        email: resetEmail
      });
      
      // Check for Message field in the response which indicates success
      if (response.data.Message) {
        setSuccess(response.data.Message || 'OTP has been sent to your email');
        setForgotPasswordStep('verify');
        setOtpTimer(60); // Start 60 second timer
        setCanResendOtp(false);
      } else if (response.data.success) {
        // Fallback for success field if present
        setSuccess('OTP has been sent to your email');
        setForgotPasswordStep('verify');
        setOtpTimer(60); // Start 60 second timer
        setCanResendOtp(false);
      } else {
        setError(response.data.message || response.data.error || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to send OTP. Please try again.');
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
      const response = await axios.post('https://django.bhtokens.com/api/user_account/password_reset/verify_otp', {
        email: resetEmail,
        otp: otp
      });
      
      console.log('OTP verification response:', response.data);
      
      // Handle success case with success and message fields
      if (response.data.success) {
        setSuccess(response.data.message || 'OTP verified successfully');
        setForgotPasswordStep('reset');
      } 
      // Alternative format with Message field
      else if (response.data.Message) {
        setSuccess(response.data.Message);
        setForgotPasswordStep('reset');
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
  
  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResendOtp) return;
    
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const response = await axios.post('https://django.bhtokens.com/api/user_account/password_reset/resend-otp', {
        email: resetEmail
      });
      
      console.log('Resend OTP response:', response.data);
      
      // Check for message field which indicates success
      if (response.data.message) {
        setSuccess(response.data.message);
        setOtpTimer(60); // Reset timer
        setCanResendOtp(false);
      }
      // Alternative format with Message field (capitalized)
      else if (response.data.Message) {
        setSuccess(response.data.Message);
        setOtpTimer(60); // Reset timer
        setCanResendOtp(false);
      }
      // Fallback for success field if present
      else if (response.data.success) {
        setSuccess('OTP has been resent to your email');
        setOtpTimer(60); // Reset timer
        setCanResendOtp(false);
      } else {
        setError(response.data.error || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset password
  const handleResetPassword = async (e) => {
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
    
    try {
      const response = await axios.post('https://django.bhtokens.com/api/user_account/password_reset/reset', {
        email: resetEmail,
        otp: otp,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      console.log('Password reset response:', response.data);
      
      // Check for success with message format
      if (response.data.success && response.data.message) {
        setSuccess(response.data.message);
        setTimeout(() => {
          setForgotPasswordMode(false);
          setShowPassword(true);
          setCredentials({
            ...credentials,
            email: resetEmail,
            password: ''
          });
        }, 2000);
      }
      // Alternative format with Message field
      else if (response.data.Message) {
        setSuccess(response.data.Message);
        setTimeout(() => {
          setForgotPasswordMode(false);
          setShowPassword(true);
          setCredentials({
            ...credentials,
            email: resetEmail,
            password: ''
          });
        }, 2000);
      }
      // Check for error field which indicates failure
      else if (response.data.error) {
        setError(response.data.error);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      // Check for error in response data
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If we're on the email step and no password is shown yet, show the password field
    if (activeTab === 'email' && !showPassword) {
      // Validate email format before proceeding
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(credentials.email)) {
        setError('Please enter a valid email address');
        return;
      }
      
      setShowPassword(true);
      return;
    }
    
    // Otherwise proceed with login
    setError('');
    setLoading(true);
    
    try {
      // Replace with your actual API endpoint
      const response = await axios.post('https://django.bhtokens.com/api/user_account/login', credentials);
      
      // Handle successful login based on your specific response format
      const { success, user_id, email, uid, jwt_token} = response.data;
      
      if (success) {
        // Store the token in localStorage
        localStorage.setItem('authToken', jwt_token);
        localStorage.setItem('user_id', user_id);
        
        // Store the uid specifically for the wallet API
        if (uid) {
          localStorage.setItem('uid', uid);
          console.log('Stored uid for wallet API:', uid);
        }
        
        // Store user info as needed
        localStorage.setItem('user', JSON.stringify({
          user_id,
          email,
          uid,
        }));
        
        // Set default authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${jwt_token}`;
        
        try {
          // Fetch user profile to get the full name using the getUserInformation API
          const profileResponse = await axios.get(
            `https://django.bhtokens.com/api/user_account/getUserInformation/?user_id=${user_id || uid}`,
            {
              headers: {
                'Authorization': `Bearer ${jwt_token}`
              }
            }
          );
          
          // Check if we got the user data and store full name
          if (profileResponse.data && profileResponse.data.user && profileResponse.data.user.name) {
            localStorage.setItem('fullName', profileResponse.data.user.name);
          } else {
            // Set a default name if name is not available
            localStorage.setItem('fullName', 'User');
          }
          // Save is_verified to localStorage and log it for debugging
          if (profileResponse.data && profileResponse.data.user_detail && typeof profileResponse.data.user_detail.is_verified !== 'undefined') {
            localStorage.setItem('is_verified', profileResponse.data.user_detail.is_verified);
            console.log('is_verified saved to localStorage:', profileResponse.data.user_detail.is_verified);
          } else {
            console.warn('is_verified not found in user_detail');
          }
        } catch (profileErr) {
          console.error('Error fetching user information:', profileErr);
          // Set a default name if profile fetch fails
          localStorage.setItem('fullName', 'User');
        }
        
        // Redirect to dashboard or home page
        window.location.href = '/spot-trading';
      } else {
        // In case 'success' is false but no error was thrown
        setError('Login failed. Please check your credentials and try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    console.log(`Attempting to login with ${provider}`);
    // Implement social login logic here
    // This would typically redirect to OAuth provider
  };

  return (
    <div className="login-container">
      <h2>Log in</h2>
      
      <div className="login-tabs">
        <div 
          className={`tab ${activeTab === 'email' ? 'active' : ''}`}
          onClick={() => handleTabChange('email')}
        >
          Email / Sub-account
        </div>
        <div 
          className={`tab ${activeTab === 'qr' ? 'active' : ''}`}
          onClick={() => handleTabChange('qr')}
        >
          QR code
        </div>
      </div>
      
      {/* Only show error message if not in forgot password mode */}
      {error && !forgotPasswordMode && (
        <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      
      {activeTab !== 'qr' ? (
        forgotPasswordMode ? (
          <div className="w-full max-w-md mx-auto p-4">
            <div className="flex items-center mb-4">
              <a href="#" onClick={(e) => { e.preventDefault(); handleBackToLogin(); }} className="text-gray-400 hover:text-white flex items-center">
                <span className="mr-1">&larr;</span> Back to login
              </a>
            </div>
            
            <h3 className="text-xl font-medium text-white mb-4">Reset your password</h3>
            
            {/* Only show one message at a time - prioritize error */}
            {error ? (
              <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            ) : success ? (
              <div className="bg-green-900/20 border border-green-800 text-green-400 px-4 py-3 rounded-lg mb-4 text-sm">
                {success}
              </div>
            ) : null}
            
            {forgotPasswordStep === 'request' && (
              <form onSubmit={handleRequestPasswordReset} className="space-y-4">
                <div className="w-full">
                  <input 
                    type="email" 
                    placeholder="Email address"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    className="w-full bg-gray-100 border border-gray-300 rounded-md p-3 text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-[#FE7400] text-white font-medium py-3 rounded-md hover:bg-[#e66a00] transition-colors" 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Send OTP'}
                </button>
              </form>
            )}
            
            {forgotPasswordStep === 'verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="w-full">
                  <input 
                    type="text" 
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="w-full bg-gray-100 border border-gray-300 rounded-md p-3 text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                
                <div className="text-center text-sm">
                  {otpTimer > 0 ? (
                    <p className="text-gray-400">Resend OTP in {otpTimer} seconds</p>
                  ) : (
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); handleResendOtp(); }}
                      className={`${canResendOtp ? 'text-blue-500 hover:text-blue-400' : 'text-gray-500 cursor-not-allowed'}`}
                    >
                      Resend OTP
                    </a>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-[#FE7400] text-white font-medium py-3 rounded-md hover:bg-[#e66a00] transition-colors" 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Verify OTP'}
                </button>
              </form>
            )}
            
            {forgotPasswordStep === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Error message specifically for password validation */}
                {newPassword.length > 0 && newPassword.length < 8 && (
                  <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
                    Password must be at least 8 characters long
                  </div>
                )}
                
                <div className="w-full">
                  <input 
                    type="password" 
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full bg-gray-100 border border-gray-300 rounded-md p-3 text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                
                <div className="w-full">
                  <input 
                    type="password" 
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-gray-100 border border-gray-300 rounded-md p-3 text-black focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-[#FE7400] text-white font-medium py-3 rounded-md hover:bg-[#e66a00] transition-colors" 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Reset Password'}
                </button>
              </form>
            )}
            
            <div className="text-xs text-center text-gray-400 mt-8">
              This site is protected by Google reCAPTCHA to ensure you're not a bot. <a href="#" className="text-blue-500 hover:text-blue-400">Learn more</a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
          <div className="email-input">
            <div className="email-field">
              <input 
                type="email" 
                name="email"
                placeholder="Email address"
                value={credentials.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          {showPassword && (
            <div className="password-input">
              <div className="password-field">
                <input 
                  type="password" 
                  name="password"
                  placeholder="Password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          )}
          
          <button 
            type="submit" 
            className="w-full bg-[#FE7400] text-white font-bold py-3 px-4 rounded-full hover:bg-[#e66a00] transition-colors" 
            disabled={loading}
          >
            {loading ? 'Processing...' : showPassword ? 'Log in' : 'Next'}
          </button>
          
          {showPassword && (
            <div className="forgot-password">
              <a href="#" onClick={(e) => { e.preventDefault(); handleForgotPassword(); }}>Forgot password?</a>
            </div>
          )}
   
          <div className="signup-prompt">
          <br />
            <p>Don't have an account? <a href="/signup">Sign up</a></p>
          </div>
              <div className="continue-text">
                <p>or continue with</p>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div 
                  className="flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => handleSocialLogin('google')}
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-1">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-gray-300">Google</span>
                </div>
                <div 
                  className="flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => handleSocialLogin('apple')}
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-1">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-gray-300">Apple</span>
                </div>
                <div 
                  className="flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => handleSocialLogin('telegram')}
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-1">
                    <img src="https://telegram.org/img/t_logo.svg" alt="Telegram" className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-gray-300">Telegram</span>
                </div>
                <div 
                  className="flex flex-col items-center justify-center p-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                  onClick={() => handleSocialLogin('wallet')}
                >
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-1">
                    <img src="https://static.okx.com/cdn/assets/imgs/2210/620F94C9C684246B.png" alt="Wallet" className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-gray-300">Wallet</span>
                </div>
              </div>
        </form>
        )
      ) : (
        <div className="qr-code-container">
          <img src="/assets/login/qr-code.png" alt="Login QR Code" className="qr-code" />
          <p>Scan with the TradeX App to log in</p>
        </div>
      )}
      <br />


      <div className="recaptcha-notice">
        <p>This site is protected by Google reCAPTCHA to ensure you're not a bot. <a href="#">Learn more</a></p>
      </div>
    </div>
  );
};

export default LoginForm;