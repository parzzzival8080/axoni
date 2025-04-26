import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import LoginForm from '../components/login/LoginForm';
import SignUpPage from '../pages/SignUpPage';

// Test account credentials
const TEST_EMAIL = 'mark@gmail.com';
const TEST_PASSWORD = '123';

// Mock axios
jest.mock('axios');

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location
delete window.location;
window.location = { href: jest.fn() };

describe('Login Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('should login successfully and redirect to spot trading', async () => {
    // Mock successful login response
    const mockLoginResponse = {
      data: {
        success: true,
        user_id: '12345',
        email: TEST_EMAIL,
        uid: 'test-uid',
        jwt_token: 'fake-token'
      }
    };
    
    // Mock successful profile response
    const mockProfileResponse = {
      data: {
        user: {
          name: 'Mark',
          uid: 'test-uid'
        }
      }
    };
    
    // Setup axios mocks
    axios.post.mockResolvedValueOnce(mockLoginResponse);
    axios.get.mockResolvedValueOnce(mockProfileResponse);
    
    render(<LoginForm />);
    
    // Enter email
    const emailInput = screen.getByPlaceholderText(/Email address/i);
    fireEvent.change(emailInput, { target: { value: TEST_EMAIL } });
    
    // Click next button
    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    
    // Wait for password field to appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    });
    
    // Enter password
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    fireEvent.change(passwordInput, { target: { value: TEST_PASSWORD } });
    
    // Click login button
    const loginButton = screen.getByText(/Log in/i);
    fireEvent.click(loginButton);
    
    // Verify API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'https://django.bhtokens.com/api/user_account/login',
        { email: TEST_EMAIL, password: TEST_PASSWORD }
      );
    });
    
    // Verify localStorage was updated with all required values
    expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', 'fake-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user_id', '12345');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('uid', 'test-uid');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify({
      user_id: '12345',
      email: TEST_EMAIL,
      uid: 'test-uid',
    }));
    
    // Verify redirect
    expect(window.location.href).toBe('/spot-trading');
  });

  test('should show error message on login failure', async () => {
    // Mock failed login response
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          message: 'Invalid credentials'
        }
      }
    });
    
    render(<LoginForm />);
    
    // Enter email
    const emailInput = screen.getByPlaceholderText(/Email address/i);
    fireEvent.change(emailInput, { target: { value: TEST_EMAIL } });
    
    // Click next button
    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    
    // Wait for password field to appear
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    });
    
    // Enter wrong password
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    fireEvent.change(passwordInput, { target: { value: 'wrong-password' } });
    
    // Click login button
    const loginButton = screen.getByText(/Log in/i);
    fireEvent.click(loginButton);
    
    // Verify API call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'https://django.bhtokens.com/api/user_account/login',
        { email: TEST_EMAIL, password: 'wrong-password' }
      );
    });
    
    // Error message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/Login failed/i)).toBeInTheDocument();
    });
  });
});

describe('Signup Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Reset fetch mock
    global.fetch = jest.fn();
  });

  test('should register a new user successfully', async () => {
    // Mock successful registration response
    const mockSignupResponse = {
      status: 200,
      headers: {
        get: () => 'application/json'
      },
      json: () => Promise.resolve({
        success: true,
        user_id: '12345',
        token: 'fake-token',
        uid: 'new-user-uid'
      })
    };
    
    global.fetch.mockResolvedValue(mockSignupResponse);
    
    render(<SignUpPage />);
    
    // Step 1: Country selection
    const countrySelect = screen.getByLabelText(/Select your country/i);
    fireEvent.change(countrySelect, { target: { value: 'US' } });
    
    const termsCheckbox = screen.getByLabelText(/I agree to the/i);
    fireEvent.click(termsCheckbox);
    
    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    
    // Wait for step 2 to appear
    await waitFor(() => {
      expect(screen.getByText(/Create your account/i)).toBeInTheDocument();
    });
    
    // Fill in email and password fields
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: TEST_EMAIL } });
    
    const passwordInput = screen.getByLabelText(/^Password$/i);
    fireEvent.change(passwordInput, { target: { value: TEST_PASSWORD } });
    
    const confirmPasswordInput = screen.getByLabelText(/Confirm password/i);
    fireEvent.change(confirmPasswordInput, { target: { value: TEST_PASSWORD } });
    
    // Click next button
    const step2NextButton = screen.getByText(/Next/i);
    fireEvent.click(step2NextButton);
    
    // Verify API call
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    // Verify the correct URL and payload were used
    const fetchCall = global.fetch.mock.calls[0];
    expect(fetchCall[0]).toBe('https://django.bhtokens.com/api/user_account/signup');
    expect(fetchCall[1].method).toBe('POST');
    expect(fetchCall[1].headers['Content-Type']).toBe('application/json');
    
    // Verify the payload contains the test credentials
    const payload = JSON.parse(fetchCall[1].body);
    expect(payload.email).toBe(TEST_EMAIL);
    expect(payload.password).toBe(TEST_PASSWORD);
  });

  test('should validate passwords match during signup', async () => {
    render(<SignUpPage />);
    
    // Step 1: Country selection
    const countrySelect = screen.getByLabelText(/Select your country/i);
    fireEvent.change(countrySelect, { target: { value: 'US' } });
    
    const termsCheckbox = screen.getByLabelText(/I agree to the/i);
    fireEvent.click(termsCheckbox);
    
    const nextButton = screen.getByText(/Next/i);
    fireEvent.click(nextButton);
    
    // Wait for step 2 to appear
    await waitFor(() => {
      expect(screen.getByText(/Create your account/i)).toBeInTheDocument();
    });
    
    // Fill in email and mismatched passwords
    const emailInput = screen.getByLabelText(/Email/i);
    fireEvent.change(emailInput, { target: { value: TEST_EMAIL } });
    
    const passwordInput = screen.getByLabelText(/^Password$/i);
    fireEvent.change(passwordInput, { target: { value: TEST_PASSWORD } });
    
    const confirmPasswordInput = screen.getByLabelText(/Confirm password/i);
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword' } });
    
    // Click next button
    const step2NextButton = screen.getByText(/Next/i);
    fireEvent.click(step2NextButton);
    
    // Should show error message about passwords not matching
    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
    
    // API should not be called
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
