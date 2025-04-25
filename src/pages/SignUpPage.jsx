import React, { useState, useRef } from 'react';
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
    profilePic: null
  });

  // State for error and loading
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  // Ref for file input
  const fileInputRef = useRef(null);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
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
      
      // Call the first API to register the user with email and password
      try {
        setLoading(true);
        
        const baseUrl = 'https://django.bhtokens.com/api/user_account/signup';
        
        console.log('Attempting registration with JSON payload');
        
        // Create JSON payload
        const payload = {
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword
        };
        
        // Log what we're sending
        console.log('Sending JSON payload:', payload);
        
        try {
          // Send as JSON data
          const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });
          
          await handleApiResponse(response);
          
        } catch (fetchError) {
          // Fetch API error
          console.error('Fetch error:', fetchError);
          setError(`Registration request failed: ${fetchError.message}`);
        }
      } catch (err) {
        // General error
        console.error('Registration error:', err);
        setError(`Registration failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Helper function to handle API response
  const handleApiResponse = async (response) => {
    // Log entire response for debugging
    console.log('Raw response status:', response.status);
    
    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // If not JSON, get the text and show it
      const text = await response.text();
      console.log('Non-JSON response:', text);
      // Try to extract error message from HTML/text if possible
      let extractedError = '';
      const match = text.match(/([Ee]rror|[Mm]essage|[Ff]ailed)[^<\n:]*(.*)/);
      if (match && match[2]) {
        extractedError = match[2].trim();
      }
      setError(extractedError || `Server returned non-JSON response: ${text.substring(0, 200)}...`);
      return;
    }
    
    // Parse JSON response
    const data = await response.json();
    console.log('Registration response data:', data);
    
    // Check if registration was successful
    if (response.ok && data) {
      // Set user data from response
      let userId = data.user_id || data.id;
      let token = data.jwt_token || data.token;
      let uid = data.uid; // Get the uid for wallet API
      
      // Store user ID and token
      if (userId && token) {
        setUserId(userId);
        setToken(token);
        
        // Store in localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('user_id', userId);
        
        // Store uid for wallet API if available
        if (uid) {
          localStorage.setItem('uid', uid);
          console.log('Stored uid for wallet API:', uid);
        }
        
        // Move to next step
        setCurrentStep(currentStep + 1);
      } else {
        // Response OK but missing required data
        setError(data.message || data.error || 'Registration response missing required data. Please try again.');
        console.error('Invalid response format:', data);
      }
    } else {
      // Handle error from API
      const errorMessage = data.message || data.error || JSON.stringify(data) || 'Registration failed';
      setError(errorMessage);
      console.error('Registration error:', data);
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
      
      // Get stored token and user ID if not already in state
      const storedToken = token || localStorage.getItem('authToken');
      const storedUserId = userId || localStorage.getItem('user_id');
      
      // Check if we have a user ID
      if (!storedUserId) {
        setError('User ID not found. Please try logging in again.');
        setLoading(false);
        return;
      }
      
      let profileUpdateUrl = '';
      let profileData = null;
      
      // Format the API endpoint
      if (formData.profilePic && formData.profilePic.startsWith('data:image')) {
        // If we have an image, we need to use FormData for multipart/form-data
        profileData = new FormData();
        
        // Convert base64 to blob
        const fetchResponse = await fetch(formData.profilePic);
        const blob = await fetchResponse.blob();
        
        // Create a file from the blob
        const profileImageFile = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
        
        // Use the FormData approach when we have a file
        profileData.append('name', formData.fullName);
        profileData.append('phone_number', formData.phone);
        profileData.append('user_profile', profileImageFile);
        
        profileUpdateUrl = `https://django.bhtokens.com/api/user_account/edit_profile/user=${storedUserId}`;
      } else {
        // If we don't have an image, we can use query params in the URL
        profileUpdateUrl = `https://django.bhtokens.com/api/user_account/edit_profile/user=${storedUserId}?name=${encodeURIComponent(formData.fullName)}&phone_number=${encodeURIComponent(formData.phone)}`;
        profileData = {};
      }
      
      console.log('Profile update URL:', profileUpdateUrl);
      
      // Set the authorization header
      const config = {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        }
      };
      
      // Add Content-Type only if we're using FormData
      if (profileData instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      }
      
      // Call the API to update user profile - changed from PUT to POST
      const response = await axios.post(
        profileUpdateUrl,
        profileData,
        config
      );
      
      console.log('Profile update response:', response.data);
      
      if (response.data.success) {
        // Save user's full name to localStorage
        localStorage.setItem('fullName', formData.fullName);
        
        // Registration fully completed
        alert('Registration successful! Welcome to TradeX.');
        
        // Redirect to login or dashboard
        navigate('/spot-trading');
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || `Failed to update profile: ${err.message}`);
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
              <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                <div className="step-text">Country</div>
              </div>
              <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <div className="step-text">Credentials</div>
              </div>
              <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="step-text">Profile</div>
              </div>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            {/* Step 1: Country Selection */}
            <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
              <h3>Select the country/region that exactly matches the one on your ID or proof of address.</h3>
              
              <div className="form-group">
                <label htmlFor="country">Country/region</label>
                <select 
                  className="form-control" 
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
              
              <div className="checkbox-group">
                <input 
                  type="checkbox" 
                  id="terms" 
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                />
                <p>By creating an account, I agree to TradeX <a href="#">Terms of Service</a>, <a href="#">Risk and Compliance Disclosure</a>, and <a href="#">Privacy Notice</a>.</p>
              </div>
              
              <button 
                className="btn btn-primary" 
                onClick={() => goToNextStep(1)}
                disabled={loading}
              >
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
                <input 
                  type="email" 
                  className="form-control" 
                  id="email" 
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  id="password" 
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  id="confirmPassword" 
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
              
              <button 
                className="btn btn-primary" 
                onClick={() => goToNextStep(2)}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Next'}
              </button>
            </div>
            
            {/* Step 3: Profile Details */}
            <div className={`form-step ${currentStep === 3 ? 'active' : ''}`}>
              <h3>Complete your profile</h3>
              
              <div 
                className="profile-pic-container"
                onClick={() => fileInputRef.current.click()}
              >
                <img 
                  id="profile-preview" 
                  src={formData.profilePic || "https://i.ibb.co/LSsXnHx/profile-placeholder.jpg"} 
                  alt="Profile Picture" 
                />
                <div className="upload-icon" title="Upload profile picture">
                  <i className="fas fa-camera"></i>
                </div>
                <input 
                  type="file" 
                  id="profile-pic-upload" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleProfileUpload}
                  style={{ display: 'none' }}
                />
              </div>
              
              <p className="upload-instructions">Click on the image or camera icon to upload your profile picture</p>
              
              <div className="form-group">
                <label htmlFor="fullName">Full name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  id="fullName" 
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone number</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  id="phone" 
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Sign up'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="chat-bubble">
        <i className="fas fa-comment-dots"></i>
      </div>
    </div>
  );
};

export default SignUpPage; 