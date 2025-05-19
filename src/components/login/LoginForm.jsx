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
      
      if (response.data.success) {
        setSuccess('OTP has been sent to your email');
        setForgotPasswordStep('verify');
        setOtpTimer(60); // Start 60 second timer
        setCanResendOtp(false);
      } else {
        setError(response.data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
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
      
      if (response.data.success) {
        setSuccess('OTP verified successfully');
        setForgotPasswordStep('reset');
      } else {
        setError(response.data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP. Please try again.');
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
      
      if (response.data.success) {
        setSuccess('OTP has been resent to your email');
        setOtpTimer(60); // Reset timer
        setCanResendOtp(false);
      } else {
        setError(response.data.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
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
      
      if (response.data.success) {
        setSuccess('Password has been reset successfully');
        setTimeout(() => {
          setForgotPasswordMode(false);
          setShowPassword(true);
          setCredentials({
            ...credentials,
            email: resetEmail,
            password: ''
          });
        }, 2000);
      } else {
        setError(response.data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
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
      
      {error && <div className="error-message">{error}</div>}
      
      {activeTab !== 'qr' ? (
        forgotPasswordMode ? (
          <div className="forgot-password-container">
            <div className="back-to-login">
              <a href="#" onClick={(e) => { e.preventDefault(); handleBackToLogin(); }}>
                &larr; Back to login
              </a>
            </div>
            
            <h3>Reset your password</h3>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            {forgotPasswordStep === 'request' && (
              <form onSubmit={handleRequestPasswordReset}>
                <div className="email-input">
                  <div className="email-field">
                    <input 
                      type="email" 
                      placeholder="Email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="next-btn" 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Send OTP'}
                </button>
              </form>
            )}
            
            {forgotPasswordStep === 'verify' && (
              <form onSubmit={handleVerifyOtp}>
                <div className="otp-input">
                  <div className="otp-field">
                    <input 
                      type="text" 
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="resend-otp">
                  {otpTimer > 0 ? (
                    <p>Resend OTP in {otpTimer} seconds</p>
                  ) : (
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); handleResendOtp(); }}
                      className={canResendOtp ? 'active' : 'disabled'}
                    >
                      Resend OTP
                    </a>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  className="next-btn" 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Verify OTP'}
                </button>
              </form>
            )}
            
            {forgotPasswordStep === 'reset' && (
              <form onSubmit={handleResetPassword}>
                <div className="password-input">
                  <div className="password-field">
                    <input 
                      type="password" 
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="password-input">
                  <div className="password-field">
                    <input 
                      type="password" 
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="next-btn" 
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Reset Password'}
                </button>
              </form>
            )}
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
            className="next-btn" 
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
            <p>Don't have an account? <a href="/signup">Sign up</a></p>
          </div>
              <div className="continue-text">
                <p>or continue with</p>
              </div>
              
              <div className="social-logins">
                <div className="social-btn" onClick={() => handleSocialLogin('google')}>
                  <div className="icon-circle">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                  </div>
                  <span>Google</span>
                </div>
                <div className="social-btn" onClick={() => handleSocialLogin('apple')}>
                  <div className="icon-circle">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" />
                  </div>
                  <span>Apple</span>
                </div>
                <div className="social-btn" onClick={() => handleSocialLogin('telegram')}>
                  <div className="icon-circle">
                    <img src="https://telegram.org/img/t_logo.svg" alt="Telegram" />
                  </div>
                  <span>Telegram</span>
                </div>
                <div className="social-btn" onClick={() => handleSocialLogin('wallet')}>
                  <div className="icon-circle">
                    <img src="https://static.okx.com/cdn/assets/imgs/2210/620F94C9C684246B.png" alt="Wallet" />
                  </div>
                  <span>Wallet</span>
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
      
      <div className="recaptcha-notice">
        <p>This site is protected by Google reCAPTCHA to ensure you're not a bot. <a href="#">Learn more</a></p>
      </div>
    </div>
  );
};

export default LoginForm;