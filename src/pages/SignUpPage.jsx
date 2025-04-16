import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import './SignUp.css';
import Navbar from '../components/common/Navbar';

const SignUpPage = () => {
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
  const goToNextStep = (step) => {
    if (step === 1) {
      if (!formData.country || !formData.termsAccepted) {
        alert('Please select a country and agree to the terms');
        return;
      }
    } else if (step === 2) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        alert('Please fill in all fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
    }
    
    setCurrentStep(currentStep + 1);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert('Please fill in all fields');
      return;
    }
    alert('Registration successful! Welcome to TradeX.');
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
              
              <button className="btn btn-primary" onClick={() => goToNextStep(1)}>Next</button>
              
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
              
              <button className="btn btn-primary" onClick={() => goToNextStep(2)}>Next</button>
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
              
              <button className="btn btn-primary" onClick={handleSubmit}>Sign up</button>
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