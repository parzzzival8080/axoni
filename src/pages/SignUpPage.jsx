import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
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
    profilePic: "/assets/default-profile.png", // Set default profile image
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

  // Default profile image URL
  const DEFAULT_PROFILE_IMAGE = "/assets/default-profile.png";

  // Handle profile picture upload
  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({
          ...formData,
          profilePic: event.target.result
        });
      };
      reader.onerror = () => {
        setError('Failed to read the image file');
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
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

  //Handle send data api
  const handleSendData = async (e)=>{
    try{
      const user_id = userId || localStorage.getItem('user_id');
      const url = 'https://django.bhtokens.com/api/user_account/send-data'
      const payload = {user_id: user_id}
      const response = await axios.post(url, payload, {
        headers:{'Content-Type': 'application/json'}
      })
      console.log('Send data response:', response.data);
      return response.data;
    }catch(e){
      console.error("Error: ", e)
    }
  }

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
        console.log('Sending additional data...');
        await handleSendData();
        console.log('Additional data sent successfully');
        } catch (sendDataError) {
          console.error('Error sending additional data:', sendDataError);
          // Continue with registration flow even if this fails
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
        
        // Call login API to get the true UID after successful signup
        try {
          console.log('Calling login API to get true UID...');
          const loginResponse = await axios.post('https://django.bhtokens.com/api/user_account/login', {
            email: formData.email,
            password: formData.password
          });
          
          const { success, user_id, uid, jwt_token } = loginResponse.data;
          
          if (success && uid) {
            // Store the true UID from login response
            localStorage.setItem('uid', uid);
            console.log('True UID obtained and stored:', uid);
            
            // Update user info with the true UID
            localStorage.setItem('user', JSON.stringify({
              user_id,
              email: formData.email,
              uid
            }));
            
            // Update token if a new one was provided
            if (jwt_token) {
              localStorage.setItem('authToken', jwt_token);
              axios.defaults.headers.common['Authorization'] = `Bearer ${jwt_token}`;
            }

            // Fetch user profile to get verification status
            try {
              const profileResponse = await axios.get(
                `https://django.bhtokens.com/api/user_account/getUserInformation/?user_id=${user_id || uid}`,
                {
                  headers: {
                    'Authorization': `Bearer ${jwt_token || storedToken}`
                  }
                }
              );

              // Save is_verified to localStorage and log it for debugging
              if (profileResponse.data && profileResponse.data.user_detail && typeof profileResponse.data.user_detail.is_verified !== 'undefined') {
                localStorage.setItem('is_verified', profileResponse.data.user_detail.is_verified);
                console.log('is_verified saved to localStorage after signup:', profileResponse.data.user_detail.is_verified);
              } else {
                console.warn('is_verified not found in user_detail after signup');
                // Set as false by default for new accounts
                localStorage.setItem('is_verified', 'false');
              }
            } catch (profileErr) {
              console.error('Error fetching user information after signup:', profileErr);
              // Set as false by default if profile fetch fails
              localStorage.setItem('is_verified', 'false');
            }
          } else {
            console.warn('Login API called but no UID returned');
            // Set as false by default if login fails
            localStorage.setItem('is_verified', 'false');
          }
        } catch (loginErr) {
          console.error('Error getting true UID from login API:', loginErr);
          // Continue with registration process even if getting the true UID fails
          // Set as false by default
          localStorage.setItem('is_verified', 'false');
        }
        
        alert('Registration successful! You are now signed in.');
        
        // Check verification status and redirect accordingly
        const isVerified = localStorage.getItem('is_verified') === 'true';
        if (isVerified) {
          navigate('/spot-trading');
        } else {
          navigate('/');
        }
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
    <div className="min-h-screen flex flex-col bg-black">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left Section (Dark) */}
        <div className="hidden md:flex md:w-2/5 bg-black p-0 justify-center items-center overflow-y-auto">
  <img
    src="/assets/login/signup.png"
    alt="Sign up illustration"
    className="mx-auto max-h-[65vh] max-w-[340px] w-auto object-contain"
    draggable="false"
  />
</div>

        {/* Right Section (White) */}
        <div className="w-full md:w-3/5 bg-white text-black p-8 md:p-12 lg:p-16 overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-3xl font-medium mb-9">Let's get you started</h2>
            
            {/* Progress Bar */}
            <div className="relative mb-9">
              <div className="absolute top-1/2 left-0 w-full h-px bg-gray-200 -translate-y-1/2"></div>
              <div className="flex justify-between relative z-10">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex flex-col items-center">
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium
                        ${currentStep >= step 
                          ? 'bg-[#FE7400] text-white border-[#FE7400]' 
                          : 'bg-white text-gray-400 border border-gray-300'}`}
                    >
                      {step}
                    </div>
                    <span 
                      className={`text-xs mt-2 whitespace-nowrap ${currentStep >= step ? 'text-black font-medium' : 'text-gray-400'}`}
                    >
                      {step === 1 ? 'Country' : step === 2 ? 'Credentials' : step === 3 ? 'Verification' : 'Profile'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded px-4 py-3 mb-5 flex items-center">
                <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}
            
            {/* Step 1: Country Selection */}
            <div className={currentStep !== 1 ? 'hidden' : ''}>
              <h3 className="text-gray-700 text-base mb-6 leading-relaxed">
                Select the country/region that exactly matches the one on your ID or proof of address.
              </h3>
              <div className="mb-6">
                <label htmlFor="country" className="block text-sm font-medium text-gray-600 mb-2">
                  Country/region
                </label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#FE7400] focus:border-transparent"
                  id="country" 
                  name="country" 
                  value={formData.country} 
                  onChange={handleChange}
                >
                  <option value="">Select country</option>
                  <option value="AF">Afghanistan</option>
                  <option value="AL">Albania</option>
                  <option value="AU">Australia</option>
                  <option value="CA">Canada</option>
                  <option value="CN">China</option>
                  <option value="FR">France</option>
                  <option value="DE">Germany</option>
                  <option value="IN">India</option>
                  <option value="JP">Japan</option>
                  <option value="PH">Philippines</option>
                  <option value="SG">Singapore</option>
                  <option value="KR">South Korea</option>
                  <option value="UK">United Kingdom</option>
                  <option value="US">United States</option>
                </select>
              </div>
              <div className="flex items-center mb-6">
                <input 
                  type="checkbox" 
                  id="terms" 
                  name="termsAccepted" 
                  checked={formData.termsAccepted} 
                  onChange={handleChange}
                  className="flex-shrink-0 mr-3"
                />
                <label htmlFor="terms" className="text-sm text-gray-600 min-w-0">
                  By creating an account, I agree to TradeX{' '}
                  <a href="#" className="text-[#FE7400] hover:underline">Terms of Service</a>,{' '}
                  <a href="#" className="text-[#FE7400] hover:underline">Risk and Compliance Disclosure</a>, and{' '}
                  <a href="#" className="text-[#FE7400] hover:underline">Privacy Notice</a>.
                </label>
              </div>
              <button 
                className="w-full py-3.5 px-6 rounded-full bg-[#FE7400] text-white font-medium hover:bg-[#e56700] transition-colors duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => goToNextStep(1)} 
                disabled={loading || !formData.country || !formData.termsAccepted}
              >
                {loading ? 'Processing...' : 'Next'}
              </button>
              <div className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-[#FE7400] font-medium hover:underline">
                  Log in
                </Link>
              </div>
            </div>
            
            {/* Step 2: Email and Password */}
            <div className={currentStep !== 2 ? 'hidden' : ''}>
              <h3 className="text-gray-700 text-base mb-6">Tell us your email</h3>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-600 mb-2">
                  Email address
                </label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#FE7400] focus:border-transparent"
                  id="email" 
                  name="email" 
                  placeholder="Enter your email" 
                  value={formData.email} 
                  onChange={handleChange} 
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
                  Password
                </label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#FE7400] focus:border-transparent"
                  id="password" 
                  name="password" 
                  placeholder="Create a password" 
                  value={formData.password} 
                  onChange={handleChange} 
                />
              </div>
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-2">
                  Confirm password
                </label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#FE7400] focus:border-transparent"
                  id="confirmPassword" 
                  name="confirmPassword" 
                  placeholder="Confirm your password" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                />
              </div>
              <button 
                className="w-full py-3.5 px-6 rounded-full bg-[#FE7400] text-white font-medium hover:bg-[#e56700] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => goToNextStep(2)} 
                disabled={loading || !formData.email || !formData.password || !formData.confirmPassword}
              >
                {loading ? 'Processing...' : 'Next'}
              </button>
            </div>
            
            {/* Step 3: OTP Verification */}
            <div className={currentStep !== 3 ? 'hidden' : ''}>
              <h3 className="text-gray-700 text-base mb-2">Verify it's you</h3>
              <p className="text-gray-500 text-sm mb-6 text-center">
                Look out for the code we've sent to {formData.email}
              </p>
              <div className="flex justify-between gap-2 mb-6">
                {formData.otp.map((digit, index) => (
                  <input 
                    key={index} 
                    type="text" 
                    maxLength="1" 
                    className="w-12 h-14 text-center text-lg border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#FE7400] focus:border-transparent" 
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    ref={(el) => { otpRefs.current[index] = el }}
                    autoFocus={index === 0 && currentStep === 3}
                  />
                ))}
              </div>
              <div className="text-center mb-6">
                <button 
                  className={`text-sm font-medium ${canResend ? 'text-[#FE7400] hover:underline' : 'text-gray-400'} transition-colors`}
                  onClick={handleResendOtp} 
                  disabled={!canResend || loading}
                >
                  Resend {resendTimer > 0 && `(${resendTimer}s)`}
                </button>
              </div>
              <button 
                className="w-full py-3.5 px-6 rounded-full bg-[#FE7400] text-white font-medium hover:bg-[#e56700] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => goToNextStep(3)} 
                disabled={loading || formData.otp.join('').length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            
            {/* Step 4: Profile Details */}
            <div className={currentStep !== 4 ? 'hidden' : ''}>
              <h3 className="text-gray-700 text-base mb-6">Complete your profile</h3>
              <div 
                className="w-28 h-28 rounded-full bg-gray-100 mx-auto mb-5 relative cursor-pointer overflow-hidden group hover:bg-gray-200 transition-colors duration-200"
                onClick={triggerFileInput}
              >
                <img 
                  id="profile-preview" 
                  src={formData.profilePic} 
                  alt="Profile Preview"
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity duration-200"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/assets/default-profile.png";
                  }}
                />
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#FE7400] rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1 group-hover:scale-110 transition-transform duration-200">
                  <i className="fas fa-camera text-white text-sm"></i>
                </div>
                <input 
                  type="file" 
                  id="profile-pic-upload" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleProfileUpload} 
                  className="hidden" 
                />
              </div>
              <p className="text-center text-gray-500 text-sm mb-6">Click to upload a profile picture (optional)</p>
              
              <div className="mb-6">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-600 mb-2">
                  Full Name
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#FE7400] focus:border-transparent"
                  id="fullName" 
                  name="fullName" 
                  placeholder="Enter your full name" 
                  value={formData.fullName} 
                  onChange={handleChange} 
                />
              </div>
              
              <div className="mb-8">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-2">
                  Phone Number
                </label>
                <div className="flex">
                  <select 
                    className="w-24 px-3 py-3 border border-r-0 border-gray-300 rounded-l-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#FE7400] focus:border-transparent text-sm"
                    defaultValue="+1"
                  >
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+81">+81 (JP)</option>
                    <option value="+86">+86 (CN)</option>
                    <option value="+91">+91 (IN)</option>
                    <option value="+63">+63 (PH)</option>
                    <option value="+65">+65 (SG)</option>
                    <option value="+82">+82 (KR)</option>
                  </select>
                  <input 
                    type="tel" 
                    className="flex-1 px-4 py-3 border border-l-0 border-gray-300 rounded-r-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#FE7400] focus:border-transparent"
                    id="phone" 
                    name="phone" 
                    placeholder="Enter your phone number" 
                    value={formData.phone} 
                    onChange={handleChange} 
                  />
                </div>
              </div>
              
              <button 
                className="w-full py-3.5 px-6 rounded-full bg-[#FE7400] text-white font-medium hover:bg-[#e56700] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSubmit} 
                disabled={loading || !formData.fullName || !formData.phone}
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
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