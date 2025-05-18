import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignUp.css';
import Navbar from '../components/common/Navbar';

const SignUpPage = () => {
  const navigate = useNavigate();
  
  // State for form steps
  const [currentStep, setCurrentStep] = useState(1);
  
  // State for form values
  const [formData, setFormData] = useState({
    country: '',
    termsAccepted: false,
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    profilePic: null,
    otp: ['', '', '', '', '', '']
  });

  // State for error and loading
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Refs for file input and OTP inputs
  const fileInputRef = useRef(null);
  const otpRefs = useRef([]);

  // Initialize OTP refs
  useEffect(() => {
    otpRefs.current = Array(6).fill().map((_, i) => otpRefs.current[i] || React.createRef());
  }, []);

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (currentStep === 3 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, resendTimer]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    
    setFormData({
      ...formData,
      otp: newOtp
    });
    
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  // Handle key press in OTP fields
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  // Handle paste for OTP
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text');
    if (!/^\d+$/.test(pasteData)) return;
    
    const digits = pasteData.slice(0, 6).split('');
    const newOtp = [...formData.otp];
    
    digits.forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });
    
    setFormData({
      ...formData,
      otp: newOtp
    });
    
    const nextEmptyIndex = newOtp.findIndex(val => !val);
    if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
      otpRefs.current[nextEmptyIndex].focus();
    } else {
      otpRefs.current[5].focus();
    }
  };

  // Handle profile picture upload
  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          profilePic: event.target.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Step navigation functions
  const goToNextStep = async (step) => {
    setError('');
    
    if (step === 1) {
      if (!formData.country || !formData.termsAccepted) {
        setError('Please select a country and agree to the terms');
        return;
      }
      setCurrentStep(currentStep + 1);
    } else if (step === 2) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      try {
        setLoading(true);
        
        const baseUrl = 'https://django.bhtokens.com/api/user_account/signup';
        const payload = {
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword
        };
        
        console.log('Attempting registration with JSON payload:', payload);
        
        const response = await axios.post(baseUrl, payload, {
          headers: {
            'Content-Type': 'application/json',
          }
        }).catch(error => {
          console.error('Registration HTTP error:', error);
          if (error.response) {
            console.error('Error response data:', error.response.data);
            const data = error.response.data;
            if (data.error === "Email already in use") {
              setError('This email is already registered. Please use a different email or login.');
            } else if (data.email && Array.isArray(data.email) && data.email[0].includes('already exists')) {
              setError('This email is already registered. Please use a different email or login.');
            } else if (data.email && typeof data.email === 'string' && data.email.includes('already exists')) {
              setError('This email is already registered. Please use a different email or login.');
            } else if (data.message) {
              setError(data.message);
            } else if (data.error) {
              setError(data.error);
            } else if (data.detail) {
              setError(data.detail);
            } else if (data.email) {
              setError(`Email: ${Array.isArray(data.email) ? data.email[0] : data.email}`);
            } else {
              setError('Registration failed. Please try again.');
            }
          } else if (error.request) {
            setError('Network error. Please check your connection and try again.');
          } else {
            setError(`Registration failed: ${error.message}`);
          }
          return null; 
        });
        
        if (!response) { // Handles errors caught by the .catch block (network, non-2xx status)
          return;
        }
        
        // If we get here, the HTTP request was successful (e.g., 200 OK).
        // Now, inspect response.data for application-level errors.
        const data = response.data;
        console.log('Registration HTTP successful, API response data:', data);

        // Check for "Email already in use" and similar errors in a 2xx response body
        if (data.error === "Email already in use" ||
            (data.email && Array.isArray(data.email) && data.email[0].includes('already exists')) ||
            (data.email && typeof data.email === 'string' && data.email.includes('already exists'))) {
          setError('This email is already registered. Please use a different email or login.');
          return; // Stop processing and do not proceed to OTP
        }

        // Check if the response, despite being 2xx, indicates failure or is missing crucial data like user_id
        if (!data.user_id) {
          if (data.message) {
            setError(data.message);
          } else if (data.error) { // For other errors not specifically "Email already in use"
            setError(data.error);
          } else if (data.detail) {
            setError(data.detail);
          } else if (data.email) { // If 'email' field itself contains an error message
             setError(`Error related to email: ${Array.isArray(data.email) ? data.email[0] : data.email}`);
          } else {
            setError('Registration failed: Unexpected response from server.');
          }
          return; // Stop processing
        }
        
        // If all checks pass, it's a true success
        console.log('Registration fully successful, proceeding to OTP:', data);
        
        if (data.user_id) {
          setUserId(data.user_id);
        }
        if (data.token) {
          setToken(data.token);
        }
        
        setCurrentStep(3);
        setResendTimer(60);
        setCanResend(false);
      } catch (err) {
        console.error('Unexpected error during registration:', err);
        setError(`Registration failed: ${err.message || 'An unknown error occurred.'}`);
      } finally {
        setLoading(false);
      }
    } else if (step === 3) {
      // Verify OTP
      const otpValue = formData.otp.join('');
      if (otpValue.length !== 6) {
        setError('Please enter the complete verification code');
        return;
      }
      
      try {
        setLoading(true);
        const verifyUrl = 'https://django.bhtokens.com/api/user_account/verify-otp';
        const payload = {
          email: formData.email,
          otp: otpValue
        };
        
        console.log('Verifying OTP:', payload);
        
        const response = await fetch(verifyUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log('OTP verification successful:', data);
          setCurrentStep(4);
        } else {
          console.error('OTP verification failed:', data);
          setError(data.message || 'Invalid verification code. Please try again.');
        }
      } catch (err) {
        console.error('OTP verification error:', err);
        setError(`Verification failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Resend OTP function
  const handleResendOtp = async () => {
    if (!canResend && resendTimer > 0) return;
    
    try {
      setLoading(true);
      setError('');
      
      const resendUrl = 'https://django.bhtokens.com/api/user_account/resend-otp';
      const payload = { email: formData.email };
      
      console.log('Sending resend OTP request with payload:', payload);
      
      const response = await axios.post(resendUrl, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('OTP resent successfully:', response.data);
      setResendTimer(60);
      setCanResend(false);
      //setError(''); // Clear previous errors, or set a success message
      
    } catch (err) {
      console.error('Resend OTP error:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        setError(err.response.data.message || 'Failed to resend verification code');
      } else if (err.request) {
        console.error('Error request:', err.request);
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(`Failed to resend code: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission (final step)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.fullName || !formData.phone) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const storedToken = token || localStorage.getItem('authToken');
      const storedUserId = userId || localStorage.getItem('user_id');
      
      if (!storedUserId) {
        setError('User ID not found. Please try logging in again.');
        setLoading(false);
        return;
      }
      
      let profileUpdateUrl = '';
      let profileDataPayload = null; // Renamed to avoid confusion with FormData global object
      
      const commonProfileData = {
        name: formData.fullName,
        phone_number: formData.phone,
      };

      if (formData.profilePic && formData.profilePic.startsWith('data:image')) {
        profileDataPayload = new FormData();
        Object.keys(commonProfileData).forEach(key => {
          profileDataPayload.append(key, commonProfileData[key]);
        });
        
        const fetchResponse = await fetch(formData.profilePic);
        const blob = await fetchResponse.blob();
        const profileImageFile = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
        profileDataPayload.append('user_profile', profileImageFile);
        
        profileUpdateUrl = `https://django.bhtokens.com/api/user_account/edit_profile/user=${storedUserId}`;
      } else {
        // If no new profile picture, send as JSON or query parameters
        // For consistency with potential PUT/POST that expects JSON:
        profileDataPayload = commonProfileData;
        // If using query params:
        // profileUpdateUrl = `https://django.bhtokens.com/api/user_account/edit_profile/user=${storedUserId}?name=${encodeURIComponent(formData.fullName)}&phone_number=${encodeURIComponent(formData.phone)}`;
        // If using JSON body (assuming API supports it for POST without image):
        profileUpdateUrl = `https://django.bhtokens.com/api/user_account/edit_profile/user=${storedUserId}`;
      }
      
      console.log('Profile update URL:', profileUpdateUrl);
      console.log('Profile update payload:', profileDataPayload);
      
      const config = {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        }
      };
      
      if (profileDataPayload instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      } else {
        config.headers['Content-Type'] = 'application/json'; // Assuming JSON if not FormData
      }
      
      const response = await axios.post(
        profileUpdateUrl,
        (profileDataPayload instanceof FormData) ? profileDataPayload : JSON.stringify(profileDataPayload), // Ensure JSON is stringified if not FormData
        config
      );
      
      console.log('Profile update response:', response.data);
      
      if (response.data.success) {
        localStorage.setItem('fullName', formData.fullName);
        localStorage.setItem('authToken', storedToken);
        localStorage.setItem('user_id', storedUserId);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('email', formData.email);
        
        if (response.data.user) {
          if (response.data.user.phone_number) {
            localStorage.setItem('phone', response.data.user.phone_number);
          }
          if (response.data.user.profile_image) {
            localStorage.setItem('profileImage', response.data.user.profile_image);
          }
        }
        
        try {
          const walletUrl = `https://django.bhtokens.com/api/user_account/get_wallet/user=${storedUserId}`;
          const walletResponse = await axios.get(walletUrl, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          if (walletResponse.data && walletResponse.data.success) {
            localStorage.setItem('walletData', JSON.stringify(walletResponse.data.wallet));
          }
        } catch (walletErr) {
          console.error('Error fetching wallet data:', walletErr);
        }
        
        alert('Registration successful! You are now signed in.');
        navigate('/spot-trading');
      } else {
        setError(response.data.message || 'Failed to update profile. Please try again.');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || `Failed to update profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="layout">
      <Navbar />
      <div className="split-container">
        {/* Left Section (Dark) */}
        <div className="left-section">
          <div className="content">
            <h1>Trade with confidence</h1>
            <p>Your funds are always backed 1:1 on TradeX with our regularly published audits on our Proof of Reserves</p>
            <div className="chart-container">
              <img src="/assets/login/login.webp" alt="BTC/USDT Chart" className="chart-img" />
            </div>
            <div className="telegram-box">
              <h3>Join our Telegram group</h3>
              <p>Ask questions, get answers, and chat with other traders to shape the crypto future together</p>
            </div>
          </div>
        </div>

        {/* Right Section (White) */}
        <div className="right-section">
          <div className="signup-container">
            <h2>Let's get you started</h2>
            <div className="progress-bar">
              <div className={`step ${currentStep >= 1 ? 'active' : ''}`}><span className="step-text">Country</span></div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''}`}><span className="step-text">Credentials</span></div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''}`}><span className="step-text">Verification</span></div>
              <div className={`step ${currentStep >= 4 ? 'active' : ''}`}><span className="step-text">Profile</span></div>
            </div>
            
            {error && (
                <div className="error-message" style={{
                  backgroundColor: 'rgba(255, 59, 48, 0.15)', border: '1px solid rgba(255, 59, 48, 0.3)',
                  borderRadius: '4px', padding: '12px 16px', marginBottom: '20px', color: '#ff3b30',
                  fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                  <i className="fas fa-exclamation-circle" style={{ marginRight: '10px', fontSize: '16px' }}></i>
                  {error}
                </div>
              )}
            
            {/* Step 1: Country Selection */}
            <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
              <h3>Select the country/region that exactly matches the one on your ID or proof of address.</h3>
              <div className="form-group">
                <label htmlFor="country">Country/region</label>
                <select className="form-control" id="country" name="country" value={formData.country} onChange={handleChange}>
                  <option value="">Select country</option>
                  <option value="AF">Afghanistan</option><option value="AL">Albania</option>
                  <option value="AU">Australia</option><option value="CA">Canada</option>
                  <option value="CN">China</option><option value="FR">France</option>
                  <option value="DE">Germany</option><option value="IN">India</option>
                  <option value="JP">Japan</option><option value="PH">Philippines</option>
                  <option value="SG">Singapore</option><option value="KR">South Korea</option>
                  <option value="UK">United Kingdom</option><option value="US">United States</option>
                </select>
              </div>
              <div className="checkbox-group">
                <input type="checkbox" id="terms" name="termsAccepted" checked={formData.termsAccepted} onChange={handleChange} />
                <p>By creating an account, I agree to TradeX <a href="#">Terms of Service</a>, <a href="#">Risk and Compliance Disclosure</a>, and <a href="#">Privacy Notice</a>.</p>
              </div>
              <button className="btn btn-primary" onClick={() => goToNextStep(1)} disabled={loading}>
                {loading ? 'Processing...' : 'Next'}
              </button>
              <div className="account-prompt">
                <p>Already have an account? <Link to="/login">Log in</Link></p>
              </div>
            </div>
            
            {/* Step 2: Email and Password */}
            <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
              <h3>Tell us your email</h3>
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input type="email" className="form-control" id="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" className="form-control" id="password" name="password" placeholder="Create a password" value={formData.password} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input type="password" className="form-control" id="confirmPassword" name="confirmPassword" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} />
              </div>
              <button className="btn btn-primary" onClick={() => goToNextStep(2)} disabled={loading}>
                {loading ? 'Processing...' : 'Next'}
              </button>
            </div>
            
            {/* Step 3: OTP Verification */}
            <div className={`form-step ${currentStep === 3 ? 'active' : ''}`}>
              <h3>Verify it's you</h3>
              <p className="otp-instruction">Look out for the code we've sent to {formData.email}</p>
              <div className="otp-container">
                {formData.otp.map((digit, index) => (
                  <input key={index} type="text" maxLength="1" className="otp-input" value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    ref={(el) => { otpRefs.current[index] = el }}
                    autoFocus={index === 0 && currentStep === 3} />
                ))}
              </div>
              <div className="resend-container">
                <button className="resend-btn" onClick={handleResendOtp} disabled={!canResend || loading}>
                  Resend {resendTimer > 0 && `(${resendTimer}s)`}
                </button>
              </div>
              <button className="btn btn-primary" onClick={() => goToNextStep(3)} disabled={loading || formData.otp.join('').length !== 6}>
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            
            {/* Step 4: Profile Details */}
            <div className={`form-step ${currentStep === 4 ? 'active' : ''}`}>
              <h3>Complete your profile</h3>
              <div className="profile-pic-container" onClick={() => fileInputRef.current.click()}>
                <img id="profile-preview" src={formData.profilePic || "https://i.ibb.co/LSsXnHx/profile-placeholder.jpg"} alt="Profile Picture" />
                <div className="upload-icon" title="Upload profile picture"><i className="fas fa-camera"></i></div>
                <input type="file" id="profile-pic-upload" accept="image/*" ref={fileInputRef} onChange={handleProfileUpload} style={{ display: 'none' }} />
              </div>
              <p className="upload-instructions">Click on the image or camera icon to upload your profile picture</p>
              <div className="form-group">
                <label htmlFor="fullName">Full name</label>
                <input type="text" className="form-control" id="fullName" name="fullName" placeholder="Enter your full name" value={formData.fullName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone number</label>
                <input type="tel" className="form-control" id="phone" name="phone" placeholder="Enter your phone number" value={formData.phone} onChange={handleChange} />
              </div>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Processing...' : 'Sign up'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="chat-bubble"><i className="fas fa-comment-dots"></i></div>
    </div>
  );
};

export default SignUpPage;