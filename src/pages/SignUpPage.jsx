import React, { useState, useRef, useEffect, useCallback } from 'react';
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
    profilePic: "/assets/default-profile.png",
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
  const timerRef = useRef(null);

  // Initialize OTP refs safely
  useEffect(() => {
    otpRefs.current = Array(6).fill(null).map((_, i) => otpRefs.current[i] || React.createRef());
  }, []);

  // Timer for OTP resend with proper cleanup
  useEffect(() => {
    if (currentStep === 3 && resendTimer > 0) {
      timerRef.current = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentStep, resendTimer]);

  // Email validation helper
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation helper
  const validatePassword = (password) => {
    return password.length >= 8;
  };

  // Phone validation helper
  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{7,}$/;
    return phoneRegex.test(phone);
  };

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  }, [error]);

  // Handle OTP input changes with improved validation
  const handleOtpChange = useCallback((index, value) => {
    // Only allow single digits
    if (value && (!/^\d$/.test(value) || value.length > 1)) return;
    
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    
    setFormData(prev => ({
      ...prev,
      otp: newOtp
    }));
    
    // Auto-focus next input
    if (value && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
    
    // Clear error when user starts entering OTP
    if (error) {
      setError('');
    }
  }, [formData.otp, error]);

  // Handle key press in OTP fields
  const handleOtpKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace') {
      if (!formData.otp[index] && index > 0 && otpRefs.current[index - 1]) {
        // Move to previous field if current is empty
        otpRefs.current[index - 1].focus();
      } else if (formData.otp[index]) {
        // Clear current field
        const newOtp = [...formData.otp];
        newOtp[index] = '';
        setFormData(prev => ({
          ...prev,
          otp: newOtp
        }));
      }
    }
  }, [formData.otp]);

  // Handle paste for OTP with improved validation
  const handleOtpPaste = useCallback((e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '');
    
    if (!pasteData) return;
    
    const digits = pasteData.slice(0, 6).split('');
    const newOtp = [...formData.otp];
    
    digits.forEach((digit, index) => {
      if (index < 6) newOtp[index] = digit;
    });
    
    // Fill remaining with empty strings
    for (let i = digits.length; i < 6; i++) {
      newOtp[i] = '';
    }
    
    setFormData(prev => ({
      ...prev,
      otp: newOtp
    }));
    
    // Focus appropriate field
    const nextEmptyIndex = newOtp.findIndex(val => !val);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : Math.min(digits.length, 5);
    
    if (otpRefs.current[focusIndex]) {
      otpRefs.current[focusIndex].focus();
    }
  }, [formData.otp]);

  // Handle profile picture upload with improved validation
  const handleProfileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, GIF, etc.)');
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        profilePic: event.target.result
      }));
    };
    reader.onerror = () => {
      setError('Failed to read the image file. Please try again.');
    };
    reader.readAsDataURL(file);
  }, []);

  // Trigger file input click
  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // API call helper with better error handling
  const makeApiCall = async (url, payload, options = {}) => {
    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`API Error for ${url}:`, error);
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.response) {
        const { data, status } = error.response;
        
        // Handle specific error cases
        if (data?.error === "Email already in use" || 
            (data?.email && (Array.isArray(data.email) ? data.email[0] : data.email).includes('already exists'))) {
          errorMessage = 'This email is already registered. Please use a different email or login.';
        } else if (data?.message) {
          errorMessage = data.message;
        } else if (data?.error) {
          errorMessage = data.error;
        } else if (data?.detail) {
          errorMessage = data.detail;
        } else if (data?.email) {
          errorMessage = `Email: ${Array.isArray(data.email) ? data.email[0] : data.email}`;
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (status === 429) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // Step navigation functions with improved validation
  const goToNextStep = async (step) => {
    setError('');
    
    if (step === 1) {
      // Validate step 1
      if (!formData.country.trim()) {
        setError('Please select a country');
        return;
      }
      if (!formData.termsAccepted) {
        setError('Please agree to the terms and conditions');
        return;
      }
      setCurrentStep(2);
      
    } else if (step === 2) {
      // Validate step 2
      if (!formData.email.trim()) {
        setError('Please enter your email address');
        return;
      }
      if (!validateEmail(formData.email)) {
        setError('Please enter a valid email address');
        return;
      }
      if (!formData.password) {
        setError('Please enter a password');
        return;
      }
      if (!validatePassword(formData.password)) {
        setError('Password must be at least 8 characters long');
        return;
      }
      if (!formData.confirmPassword) {
        setError('Please confirm your password');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      try {
        setLoading(true);
        
        const payload = {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          confirm_password: formData.confirmPassword
        };
        
        console.log('Attempting registration...');
        
        const result = await makeApiCall(
          'https://django.bhtokens.com/api/user_account/signup',
          payload
        );
        
        if (!result.success) {
          setError(result.error);
          return;
        }
        
        const data = result.data;
        console.log('Registration successful:', data);
        
        // Validate response data
        if (!data.user_id) {
          setError('Registration failed: Invalid server response');
          return;
        }
        
        setUserId(data.user_id);
        if (data.token) {
          setToken(data.token);
        }
        
        setCurrentStep(3);
        setResendTimer(60);
        setCanResend(false);
        
      } catch (err) {
        console.error('Unexpected registration error:', err);
        setError('Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
      
    } else if (step === 3) {
      // Validate OTP
      const otpValue = formData.otp.join('');
      if (otpValue.length !== 6) {
        setError('Please enter the complete 6-digit verification code');
        return;
      }
      if (!/^\d{6}$/.test(otpValue)) {
        setError('Verification code must contain only numbers');
        return;
      }
      
      try {
        setLoading(true);
        
        const payload = {
          email: formData.email.trim().toLowerCase(),
          otp: otpValue
        };
        
        console.log('Verifying OTP...');
        
        const result = await makeApiCall(
          'https://django.bhtokens.com/api/user_account/verify-otp',
          payload
        );
        
        if (result.success) {
          console.log('OTP verification successful');
          setCurrentStep(4);
        } else {
          setError(result.error || 'Invalid verification code. Please try again.');
        }
        
      } catch (err) {
        console.error('OTP verification error:', err);
        setError('Verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Resend OTP function with improved error handling
  const handleResendOtp = async () => {
    if (!canResend && resendTimer > 0) return;
    
    try {
      setLoading(true);
      setError('');
      
      const payload = { 
        email: formData.email.trim().toLowerCase() 
      };
      
      console.log('Resending OTP...');
      
      const result = await makeApiCall(
        'https://django.bhtokens.com/api/user_account/resend-otp',
        payload
      );
      
      if (result.success) {
        console.log('OTP resent successfully');
        setResendTimer(60);
        setCanResend(false);
        // Clear OTP inputs
        setFormData(prev => ({
          ...prev,
          otp: ['', '', '', '', '', '']
        }));
        // Focus first OTP input
        if (otpRefs.current[0]) {
          otpRefs.current[0].focus();
        }
      } else {
        setError(result.error || 'Failed to resend verification code');
      }
      
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle send data API
  const handleSendData = async (userId, password) => {
    try {
      const user_id = userId || localStorage.getItem('user_id');
      if (!user_id) {
        throw new Error('User ID not found');
      }
      
      const payload = {
        user_id: user_id,
        password: password
      };
      
      const result = await makeApiCall(
        'https://django.bhtokens.com/api/user_account/send-data',
        payload
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      console.log('Send data successful:', result.data);
      return result.data;
    } catch (error) {
      console.error("Error sending data:", error);
      throw error;
    }
  };

  // Handle form submission (final step) with comprehensive error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate final step
    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (formData.fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters long');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (!validatePhone(formData.phone)) {
      setError('Please enter a valid phone number');
      return;
    }
    
    try {
      setLoading(true);
      
      const storedToken = token || localStorage.getItem('authToken');
      const storedUserId = userId || localStorage.getItem('user_id');
      
      if (!storedUserId) {
        setError('Session expired. Please try signing up again.');
        setCurrentStep(1);
        return;
      }
      
      // Prepare profile data
      const commonProfileData = {
        name: formData.fullName.trim(),
        phone_number: formData.phone.trim(),
      };

      let profileDataPayload;
      let contentType = 'application/json';
      
      // Handle profile picture upload
      if (formData.profilePic && formData.profilePic.startsWith('data:image')) {
        profileDataPayload = new FormData();
        Object.keys(commonProfileData).forEach(key => {
          profileDataPayload.append(key, commonProfileData[key]);
        });
        
        try {
          const fetchResponse = await fetch(formData.profilePic);
          const blob = await fetchResponse.blob();
          const profileImageFile = new File([blob], 'profile.jpg', { type: blob.type || 'image/jpeg' });
          profileDataPayload.append('user_profile', profileImageFile);
          contentType = 'multipart/form-data';
        } catch (imageError) {
          console.warn('Failed to process profile image, continuing without it:', imageError);
          profileDataPayload = commonProfileData;
        }
      } else {
        profileDataPayload = commonProfileData;
      }
      
      const profileUpdateUrl = `https://django.bhtokens.com/api/user_account/edit_profile/user=${storedUserId}`;
      
      console.log('Updating profile...');
      
      // Make profile update request
      const config = {
        headers: {
          'Authorization': storedToken ? `Bearer ${storedToken}` : undefined,
        }
      };
      
      if (contentType === 'multipart/form-data') {
        // Let axios set the content-type for FormData (includes boundary)
        delete config.headers['Content-Type'];
      } else {
        config.headers['Content-Type'] = 'application/json';
      }
      
      const response = await axios.post(
        profileUpdateUrl,
        profileDataPayload instanceof FormData ? profileDataPayload : JSON.stringify(profileDataPayload),
        config
      );
      
      console.log('Profile update response:', response.data);
      
      if (!response.data.success) {
        setError(response.data.message || 'Failed to update profile. Please try again.');
        return;
      }
      
      // Store user data in localStorage
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        authToken: storedToken,
        user_id: storedUserId,
        isAuthenticated: 'true'
      };
      
      Object.entries(userData).forEach(([key, value]) => {
        if (value) localStorage.setItem(key, value);
      });
      
      // Store additional user data from response
      if (response.data.user) {
        if (response.data.user.phone_number) {
          localStorage.setItem('phone', response.data.user.phone_number);
        }
        if (response.data.user.profile_image) {
          localStorage.setItem('profileImage', response.data.user.profile_image);
        }
      }

      // Send additional data (non-critical)
      try {
        console.log('Sending additional data...');
        await handleSendData(storedUserId, formData.password);
        console.log('Additional data sent successfully');
      } catch (sendDataError) {
        console.warn('Error sending additional data (non-critical):', sendDataError);
      }
      
      // Fetch wallet data (non-critical)
      try {
        console.log('Fetching wallet data...');
        const walletUrl = `https://django.bhtokens.com/api/user_account/get_wallet/user=${storedUserId}`;
        const walletResponse = await axios.get(walletUrl, {
          headers: { 'Authorization': `Bearer ${storedToken}` }
        });
        
        if (walletResponse.data?.success && walletResponse.data.wallet) {
          localStorage.setItem('walletData', JSON.stringify(walletResponse.data.wallet));
          console.log('Wallet data stored successfully');
        }
      } catch (walletErr) {
        console.log('Wallet fetch failed (expected for new users):', walletErr.response?.status);
      }
      
      // Get true UID from login API
      try {
        console.log('Getting true UID from login...');
        const loginResult = await makeApiCall(
          'https://django.bhtokens.com/api/user_account/login',
          {
            email: formData.email.trim().toLowerCase(),
            password: formData.password
          }
        );
        
        if (loginResult.success) {
          const { user_id, uid, jwt_token } = loginResult.data;
          
          if (uid) {
            localStorage.setItem('uid', uid);
            localStorage.setItem('user', JSON.stringify({
              user_id,
              email: formData.email,
              uid
            }));
            console.log('True UID stored:', uid);
          }
          
          if (jwt_token) {
            localStorage.setItem('authToken', jwt_token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${jwt_token}`;
          }

          // Get user information including verification status
          try {
            const profileResponse = await axios.get(
              `https://django.bhtokens.com/api/user_account/getUserInformation/?user_id=${user_id || uid}`,
              {
                headers: {
                  'Authorization': `Bearer ${jwt_token || storedToken}`
                }
              }
            );

            const isVerified = profileResponse.data?.user_detail?.is_verified || false;
            localStorage.setItem('is_verified', isVerified.toString());
            console.log('Verification status stored:', isVerified);
          } catch (profileErr) {
            console.warn('Failed to fetch user information:', profileErr);
            localStorage.setItem('is_verified', 'false');
          }
        } else {
          localStorage.setItem('is_verified', 'false');
        }
      } catch (loginErr) {
        console.warn('Failed to get true UID:', loginErr);
        localStorage.setItem('is_verified', 'false');
      }
      
      // Success - redirect user
      console.log('Registration completed successfully');
      alert('Registration successful! Welcome to TradeX.');
      
      const isVerified = localStorage.getItem('is_verified') === 'true';
      navigate(isVerified ? '/spot-trading' : '/', { replace: true });
      
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to complete registration. Please try again.';
      setError(errorMessage);
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
            onError={(e) => {
              console.warn('Signup image failed to load');
              e.target.style.display = 'none';
            }}
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
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-200
                        ${currentStep >= step 
                          ? 'bg-[#FE7400] text-white border-[#FE7400]' 
                          : 'bg-white text-gray-400 border border-gray-300'}`}
                    >
                      {step}
                    </div>
                    <span 
                      className={`text-xs mt-2 whitespace-nowrap transition-colors duration-200 ${
                        currentStep >= step ? 'text-black font-medium' : 'text-gray-400'
                      }`}
                    >
                      {step === 1 ? 'Country' : step === 2 ? 'Credentials' : step === 3 ? 'Verification' : 'Profile'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5 flex items-start">
                <i className="fas fa-exclamation-circle text-red-500 mr-2 mt-0.5 flex-shrink-0"></i>
                <span className="text-red-700 text-sm leading-relaxed">{error}</span>
              </div>
            )}
            
            {/* Step 1: Country Selection */}
            <div className={currentStep !== 1 ? 'hidden' : ''}>
              <h3 className="text-gray-700 text-base mb-6 leading-relaxed">
                Select the country/region that exactly matches the one on your ID or proof of address.
              </h3>
              <div className="mb-6">
                <label htmlFor="country" className="block text-sm font-medium text-gray-600 mb-2">
                  Country/region *
                </label>
                <select 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#FE7400] focus:border-transparent transition-all duration-200"
                  id="country" 
                  name="country" 
                  value={formData.country} 
                  onChange={handleChange}
                  required
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
              <div className="flex items-start mb-6">
                <input 
                  type="checkbox" 
                  id="terms" 
                  name="termsAccepted" 
                  checked={formData.termsAccepted} 
                  onChange={handleChange}
                  className="flex-shrink-0 mr-3 mt-1"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  By creating an account, I agree to TradeX{' '}
                  <a href="#" className="text-[#FE7400] hover:underline font-medium">Terms of Service</a>,{' '}
                  <a href="#" className="text-[#FE7400] hover:underline font-medium">Risk and Compliance Disclosure</a>, and{' '}
                  <a href="#" className="text-[#FE7400] hover:underline font-medium">Privacy Notice</a>.
                </label>
              </div>
              <button 
                className="w-full py-3.5 px-6 rounded-full bg-[#FE7400] text-white font-medium hover:bg-[#e56700] transition-colors duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => goToNextStep(1)} 
                disabled={loading || !formData.country || !formData.termsAccepted}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Processing...
                  </span>
                ) : 'Next'}
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
                  Email address *
                </label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#FE7400] focus:border-transparent transition-all duration-200"
                  id="email" 
                  name="email" 
                  placeholder="Enter your email" 
                  value={formData.email} 
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-600 mb-2">
                  Password *
                </label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#FE7400] focus:border-transparent transition-all duration-200"
                  id="password" 
                 name="password" 
                 placeholder="Create a password (min 8 characters)" 
                 value={formData.password} 
                 onChange={handleChange}
                 autoComplete="new-password"
                 required
               />
             </div>
             <div className="mb-6">
               <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600 mb-2">
                 Confirm password *
               </label>
               <input 
                 type="password" 
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#FE7400] focus:border-transparent transition-all duration-200"
                 id="confirmPassword" 
                 name="confirmPassword" 
                 placeholder="Confirm your password" 
                 value={formData.confirmPassword} 
                 onChange={handleChange}
                 autoComplete="new-password"
                 required
               />
             </div>
             <button 
               className="w-full py-3.5 px-6 rounded-full bg-[#FE7400] text-white font-medium hover:bg-[#e56700] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
               onClick={() => goToNextStep(2)} 
               disabled={loading || !formData.email || !formData.password || !formData.confirmPassword}
             >
               {loading ? (
                 <span className="flex items-center justify-center">
                   <i className="fas fa-spinner fa-spin mr-2"></i>
                   Processing...
                 </span>
               ) : 'Next'}
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
                   className="w-12 h-14 text-center text-lg border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#FE7400] focus:border-transparent transition-all duration-200" 
                   value={digit}
                   onChange={(e) => handleOtpChange(index, e.target.value)}
                   onKeyDown={(e) => handleOtpKeyDown(index, e)}
                   onPaste={index === 0 ? handleOtpPaste : undefined}
                   ref={(el) => { if (otpRefs.current) otpRefs.current[index] = el }}
                   autoFocus={index === 0 && currentStep === 3}
                   inputMode="numeric"
                   pattern="[0-9]*"
                 />
               ))}
             </div>
             <div className="text-center mb-6">
               <button 
                 className={`text-sm font-medium transition-colors ${
                   canResend ? 'text-[#FE7400] hover:underline cursor-pointer' : 'text-gray-400 cursor-not-allowed'
                 }`}
                 onClick={handleResendOtp} 
                 disabled={!canResend || loading}
               >
                 {loading ? (
                   <span className="flex items-center justify-center">
                     <i className="fas fa-spinner fa-spin mr-1"></i>
                     Sending...
                   </span>
                 ) : (
                   `Resend${resendTimer > 0 ? ` (${resendTimer}s)` : ''}`
                 )}
               </button>
             </div>
             <button 
               className="w-full py-3.5 px-6 rounded-full bg-[#FE7400] text-white font-medium hover:bg-[#e56700] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
               onClick={() => goToNextStep(3)} 
               disabled={loading || formData.otp.join('').length !== 6}
             >
               {loading ? (
                 <span className="flex items-center justify-center">
                   <i className="fas fa-spinner fa-spin mr-2"></i>
                   Verifying...
                 </span>
               ) : 'Verify'}
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
                 Full Name *
               </label>
               <input 
                 type="text" 
                 className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#FE7400] focus:border-transparent transition-all duration-200"
                 id="fullName" 
                 name="fullName" 
                 placeholder="Enter your full name" 
                 value={formData.fullName} 
                 onChange={handleChange}
                 autoComplete="name"
                 required
               />
             </div>
             
             <div className="mb-8">
               <label htmlFor="phone" className="block text-sm font-medium text-gray-600 mb-2">
                 Phone Number *
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
                   className="flex-1 px-4 py-3 border border-l-0 border-gray-300 rounded-r-lg bg-[#f5f6fa] focus:outline-none focus:ring-2 focus:ring-[#FE7400] focus:border-transparent transition-all duration-200"
                   id="phone" 
                   name="phone" 
                   placeholder="Enter your phone number" 
                   value={formData.phone} 
                   onChange={handleChange}
                   autoComplete="tel"
                   required
                 />
               </div>
             </div>
             
             <button 
               className="w-full py-3.5 px-6 rounded-full bg-[#FE7400] text-white font-medium hover:bg-[#e56700] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
               onClick={handleSubmit} 
               disabled={loading || !formData.fullName || !formData.phone}
             >
               {loading ? (
                 <span className="flex items-center justify-center">
                   <i className="fas fa-spinner fa-spin mr-2"></i>
                   Creating Account...
                 </span>
               ) : 'Complete Registration'}
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