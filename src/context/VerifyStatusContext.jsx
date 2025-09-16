import { createContext, useState, useEffect, useContext, useRef } from 'react';
import Modal from '../components/common/Modal';

const VerifyStatusContext = createContext();

export const useVerifyStatus = () => useContext(VerifyStatusContext);

// Verification status constants (matching API response values)
const VERIFICATION_STATUS = {
  NOT_STARTED: 'not_started',
  PENDING: 'pending',
  APPROVED: 'approved',
  DECLINED: 'declined'
};

// API configuration
const API_CONFIG = {
  KYC_STATUS_BASE_URL: "https://api.COINCHIcoin.tech/api/v1/kyc-status",
  API_KEY: "5lPMMw7mIuyzQQDjlKJbe0dY",
};

export const VerifyStatusProvider = ({ children }) => {
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [previousVerificationStatus, setPreviousVerificationStatus] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const abortController = useRef(null);

  const checkVerificationStatus = async () => {
    const token = localStorage.getItem('authToken');
    const uid = localStorage.getItem('uid');

    // Only check if user is logged in and has UID
    if (!token || !uid) {
      return;
    }

    // Prevent multiple concurrent requests
    if (isCheckingStatus) {
      return;
    }

    setIsCheckingStatus(true);

    try {
      // Cancel any existing request
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();

      const response = await fetch(
        `${API_CONFIG.KYC_STATUS_BASE_URL}/${uid}?apikey=${API_CONFIG.API_KEY}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'omit',
          signal: abortController.current.signal,
          timeout: 10000,
        }
      );

      if (!response.ok) {
        console.log(`KYC status API returned ${response.status}, treating as not started`);
        setVerificationStatus(VERIFICATION_STATUS.NOT_STARTED);
        return;
      }

      const data = await response.json();
      console.log("KYC Status API Response:", data);

      let currentStatus = VERIFICATION_STATUS.NOT_STARTED;
      
      if (data.status) {
        const status = data.status.toLowerCase();
        switch (status) {
          case 'pending':
            currentStatus = VERIFICATION_STATUS.PENDING;
            break;
          case 'approved':
            currentStatus = VERIFICATION_STATUS.APPROVED;
            break;
          case 'declined':
            currentStatus = VERIFICATION_STATUS.DECLINED;
            break;
          default:
            currentStatus = VERIFICATION_STATUS.NOT_STARTED;
            break;
        }
      }

      // Check if status changed from non-approved to approved (newly approved)
      if (
        (previousVerificationStatus === VERIFICATION_STATUS.PENDING || 
         previousVerificationStatus === VERIFICATION_STATUS.NOT_STARTED) && 
        currentStatus === VERIFICATION_STATUS.APPROVED
      ) {
        setShowVerificationModal(true);
      }

      // Update states
      setPreviousVerificationStatus(verificationStatus);
      setVerificationStatus(currentStatus);

      // Update localStorage for backward compatibility
      const isVerified = currentStatus === VERIFICATION_STATUS.APPROVED;
      localStorage.setItem('is_verified', isVerified.toString());

      console.log('KYC verification status checked:', currentStatus);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Verification status request was cancelled');
        return;
      }
      console.error('Error checking KYC verification status:', error);
      // Don't update status on error to avoid false negatives
    } finally {
      setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    // Initialize with current localStorage value
    const storedVerifyStatus = localStorage.getItem('is_verified');
    if (storedVerifyStatus !== null) {
      const initialIsVerified = storedVerifyStatus === 'true';
      const initialStatus = initialIsVerified ? VERIFICATION_STATUS.APPROVED : VERIFICATION_STATUS.NOT_STARTED;
      setVerificationStatus(initialStatus);
      setPreviousVerificationStatus(initialStatus);
    }

    // Start periodic checking
    const interval = setInterval(checkVerificationStatus, 5000); // Check every 5 seconds

    // Initial check
    checkVerificationStatus();

    return () => {
      clearInterval(interval);
      // Cleanup abort controller
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, []);

  const handleVerificationSuccess = () => {
    setShowVerificationModal(false);
    // Optional: Navigate to a specific page or refresh current page
    window.location.reload();
  };

  const contextValue = {
    verificationStatus,
    isVerified: verificationStatus === VERIFICATION_STATUS.APPROVED,
    checkVerificationStatus,
    isCheckingStatus
  };

  return (
    <VerifyStatusContext.Provider value={contextValue}>
      {children}
      <Modal
        isOpen={showVerificationModal}
        onClose={handleVerificationSuccess}
        title="🎉 Verification Complete!"
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            backgroundColor: '#10B981', 
            borderRadius: '50%', 
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
          }}>
            ✅
          </div>
          <h3 style={{ 
            color: '#10B981', 
            marginBottom: '15px', 
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            Account Verified Successfully!
          </h3>
          <p style={{ 
            color: '#666', 
            marginBottom: '25px', 
            lineHeight: '1.5',
            fontSize: '14px'
          }}>
            Congratulations! Your identity verification has been approved. 
            You now have full access to all platform features.
          </p>
          <button
            onClick={handleVerificationSuccess}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#10B981'}
          >
            Continue
          </button>
        </div>
      </Modal>
    </VerifyStatusContext.Provider>
  );
};