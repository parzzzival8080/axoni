import { useState } from 'react';
import axios from 'axios';

const LoginForm = () => {
  const [activeTab, setActiveTab] = useState('email');
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
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
        localStorage.setItem('user_id', user_id || uid);
        
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
              <a href="/forgot-password">Forgot password?</a>
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