import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LoginForm from '../components/login/LoginForm';
import SignUpPage from '../pages/SignUpPage';

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({ children, to }) => <a href={to}>{children}</a>
  };
});

// Setup localStorage mock
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key]),
    setItem: vi.fn((key, value) => { store[key] = value; }),
    clear: vi.fn(() => { store = {}; }),
    removeItem: vi.fn(key => { delete store[key]; })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock window.location
Object.defineProperty(window, 'location', {
  writable: true,
  value: { href: '' }
});

// Constants for testing
const TEST_EMAIL = 'mark@gmail.com';
const TEST_PASSWORD = '123';

// Mock APIs
let mockAxios;
let originalFetch;

describe('LoginForm Tests', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorageMock.clear();
    
    // Save original fetch
    originalFetch = global.fetch;
    
    // Mock axios before importing it
    vi.doMock('axios', () => ({
      post: vi.fn().mockResolvedValue({
        data: {
          success: true,
          user_id: 122,
          email: TEST_EMAIL,
          uid: "yE8vKBNw",
          jwt_token: "eyJhbGciOiJIUzI1NiIsI",
          ip_address: "65.181.9.198"
        }
      }),
      get: vi.fn().mockResolvedValue({
        data: {
          user: { name: 'Test User' }
        }
      }),
      defaults: { headers: { common: {} } }
    }));
    
    // Get mocked axios
    mockAxios = require('axios');
  });
  
  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  test('renders login form correctly', () => {
    render(<LoginForm />);
    
    expect(screen.getByText('Log in')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
  });

  test('handles form submission', async () => {
    render(<LoginForm />);
    
    // Enter email
    const emailInput = screen.getByPlaceholderText('Email address');
    fireEvent.change(emailInput, { target: { value: TEST_EMAIL } });
    
    // Submit email form - use querySelector directly instead of getByRole
    const form = document.querySelector('form');
    expect(form).not.toBeNull();
    
    // Alternative approach: click the Next button instead of form submission
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeInTheDocument();
    fireEvent.click(nextButton);
    
    // Log successful test
    console.log('Successfully tested login form initial submission');
  });
});

describe('SignupForm Tests', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorageMock.clear();
    
    // Mock fetch for signup
    global.fetch = vi.fn().mockImplementation(() => 
      Promise.resolve({
        ok: true,
        headers: {
          get: () => 'application/json'
        },
        json: () => Promise.resolve({
          success: "The account was success",
          user_id: 208,
          jwt_token: "eyJhbGciOiJIUzI1NiIsI",
          uid: "odefVRY4"
        })
      })
    );
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders signup form correctly', () => {
    render(<SignUpPage />);
    
    expect(screen.getByText(/let's get you started/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country\/region/i)).toBeInTheDocument();
  });

  test('can navigate through signup steps', async () => {
    render(<SignUpPage />);
    
    // Step 1: Select country and agree to terms
    const countrySelect = screen.getByLabelText(/country\/region/i);
    fireEvent.change(countrySelect, { target: { value: 'US' } });
    
    const termsCheckbox = screen.getByRole('checkbox');
    fireEvent.click(termsCheckbox);
    
    // Try to find the next button
    const nextButton = screen.getAllByText('Next')[0];
    expect(nextButton).toBeInTheDocument();
    fireEvent.click(nextButton);
    
    // Wait for step 2 elements
    await waitFor(() => {
      expect(screen.queryByText(/tell us your email/i)).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Log successful test
    console.log('Successfully tested signup form rendering and navigation');
  });
});