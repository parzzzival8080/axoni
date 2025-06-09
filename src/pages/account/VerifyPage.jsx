import React, { useState, useRef, useEffect } from "react";
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  Camera,
  CheckCircle2,
  FileText,
  Sparkles,
  ImagePlus,
  Info,
  LockKeyhole,
  Loader2
} from "lucide-react";
import ProfileNavBar from "../../components/profile/ProfileNavBar";

// Configuration constants
const API_CONFIG = {
  KYC_STATUS_BASE_URL: "https://apiv2.bhtokens.com/api/v1/kyc-status",
  KYC_UPLOAD_URL: "https://django.bhtokens.com/api/user_account/upload-kyc",
  KYC_SEND_DATA_URL: "https://django.bhtokens.com/api/user_account/send-kyc-data",
  API_KEY: "A20RqFwVktRxxRqrKBtmi6ud"
};

// Verification status enum for better code readability
const VERIFICATION_STATUS = {
  NOT_STARTED: 'not_started',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

// Original VerifyIllustration
const InitialVerifyIllustration = () => (
  <svg width="100" height="100" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="24" fill="#F3F4F6" />
    <circle cx="60" cy="48" r="20" fill="#E5E7EB" />
    <rect x="34" y="76" width="52" height="16" rx="8" fill="#E5E7EB" />
    <rect x="50" y="98" width="20" height="6" rx="3" fill="#E5E7EB" />
  </svg>
);

const countries = [
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" },
  { code: "AT", name: "Austria", flag: "🇦🇹" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "PL", name: "Poland", flag: "🇵🇱" },
  { code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
  { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "GR", name: "Greece", flag: "🇬🇷" },
];

const idTypes = [
  { name: "Driver's License", apiValue: "drivers_license", icon: <FileText size={20} className="mr-2 text-gray-700" />, recommended: true, needsBack: true },
  { name: "National ID Card", apiValue: "national_id", icon: <FileText size={20} className="mr-2 text-gray-700" />, needsBack: true },
  { name: "Passport", apiValue: "passport", icon: <FileText size={20} className="mr-2 text-gray-700" />, needsBack: false },
  { name: "Unified Multi Purpose ID (UMID)", apiValue: "umid", icon: <FileText size={20} className="mr-2 text-gray-700" />, needsBack: true },
  { name: "Postal ID", apiValue: "postal_id", icon: <FileText size={20} className="mr-2 text-gray-700" />, needsBack: true },
  { name: "PRC ID", apiValue: "prc_id", icon: <FileText size={20} className="mr-2 text-gray-700" />, needsBack: true },
];

const FileUploadButton = ({ label, onFileChange, fileName, icon, subtext, disabled }) => {
  const inputRef = useRef(null);
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-black transition-colors bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {icon || <UploadCloud size={32} className="mb-2 text-gray-400" />}
        <span className="text-sm font-medium text-black">{label}</span>
        {fileName && <span className="text-xs text-green-600 mt-1">{fileName}</span>}
        {!fileName && subtext && <span className="text-xs text-gray-500 mt-1">{subtext}</span>}
      </button>
      <input
        type="file"
        ref={inputRef}
        onChange={onFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/jpg"
        disabled={disabled}
      />
    </div>
  );
};

const VerifyPage = () => {
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState("PH");
  const [selectedIdInfo, setSelectedIdInfo] = useState(null);
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState(VERIFICATION_STATUS.NOT_STARTED);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  /**
   * Fetches the current KYC verification status for the user
   * @param {string} userId - The user ID to check status for
   * @returns {Promise<string>} - Returns the verification status
   */
  const fetchVerificationStatus = async (userId) => {
    try {
      const response = await fetch(`${API_CONFIG.KYC_STATUS_BASE_URL}/${userId}?apikey=${API_CONFIG.API_KEY}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.log(`KYC status API returned ${response.status}, treating as not started`);
        return VERIFICATION_STATUS.NOT_STARTED;
      }

      const data = await response.json();
      console.log("KYC Status API Response:", data);
      
      // Check if response contains status
      if (data.status) {
        const status = data.status.toLowerCase();
        // Map API status to our internal status
        switch (status) {
          case 'pending':
            return VERIFICATION_STATUS.PENDING;
          case 'verified':
          case 'approved':
            return VERIFICATION_STATUS.VERIFIED;
          case 'rejected':
          case 'declined':
            return VERIFICATION_STATUS.REJECTED;
          default:
            return VERIFICATION_STATUS.NOT_STARTED;
        }
      }
      
      // If we get an error response (like {"message":"Something went wrong","error":{}}),
      // it means user hasn't started verification process
      if (data.message && data.error !== undefined) {
        console.log("User has not started verification process");
        return VERIFICATION_STATUS.NOT_STARTED;
      }
      
      return VERIFICATION_STATUS.NOT_STARTED;
    } catch (error) {
      console.error("Error fetching verification status:", error);
      // If API call fails, assume user hasn't started verification
      return VERIFICATION_STATUS.NOT_STARTED;
    }
  };

  /**
   * Sends KYC data notification with retry logic
   * @param {string} uid - The user ID to send notification for
   * @param {number} maxRetries - Maximum number of retry attempts
   * @returns {Promise<boolean>} - Returns true if successful
   */
  const sendKycDataNotification = async (uid) => {
    let attempts = 0;
    const maxAttempts = 3;
    let delay = 2000; // Start with 2 seconds delay

    while (attempts < maxAttempts) {
      try {
        console.log(`Sending KYC data notification (attempt ${attempts + 1}/${maxAttempts})`);
        
        const storedUid = localStorage.getItem('uid');
        if (!storedUid) {
          throw new Error("UID not found in localStorage");
        }
        
        const response = await fetch(API_CONFIG.KYC_SEND_DATA_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uid: storedUid }), // Using stored uid from localStorage
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`KYC notification attempt ${attempts} failed:`, {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          
          // If it's a server error (5xx) and we have retries left, continue
          if (response.status >= 500 && attempts < maxAttempts) {
            console.log(`Server error detected, waiting before retry ${attempts + 1}...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Progressive delay
            attempts++;
            continue;
          }
          
          // If it's a client error (4xx) or we're out of retries, throw error
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log(`KYC data notification sent successfully on attempt ${attempts}:`, result);
        return true;

      } catch (error) {
        console.error(`KYC notification attempt ${attempts} error:`, error);
        
        // If this is the last attempt, throw the error
        if (attempts === maxAttempts) {
          throw error;
        }
        
        // Wait before next retry with progressive backoff
        console.log(`Waiting before retry ${attempts + 1}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        attempts++;
      }
    }
    
    return false;
  };

  // Initialize user ID and check verification status on component mount
  useEffect(() => {
    const initializeVerificationCheck = async () => {
      const storedUserId = localStorage.getItem('user_id');
      
      if (!storedUserId) {
        console.error("User ID not found in localStorage");
        setSubmissionError("User ID not found. Please log in again.");
        setIsCheckingStatus(false);
        return;
      }

      setCurrentUserId(storedUserId);

      // Check current verification status
      const status = await fetchVerificationStatus(storedUserId);
      setVerificationStatus(status);
      setIsCheckingStatus(false);

      console.log("Current verification status:", status);
    };

    initializeVerificationCheck();
  }, []);

  const handleNextStep = () => {
    setSubmissionError("");
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setSubmissionError("");
    setCurrentStep((prev) => prev - 1);
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      if (fileType === "idFront") setIdFront(file);
      else if (fileType === "idBack") setIdBack(file);
      else if (fileType === "selfie") setSelfie(file);
      setSubmissionError("");
    }
  };

  /**
   * Validates form data before submission
   * @returns {boolean} - Returns true if validation passes
   */
  const validateSubmissionData = () => {
    if (!currentUserId) {
      setSubmissionError("User ID is missing. Cannot submit verification.");
      return false;
    }

    if (!selectedIdInfo || !selectedIdInfo.apiValue) {
      setSubmissionError("ID type information is missing or invalid. Please re-select an ID type.");
      return false;
    }

    if (!selfie || !idFront) {
      setSubmissionError("Missing required images for submission (selfie or ID front).");
      return false;
    }

    if (selectedIdInfo.needsBack && !idBack) {
      setSubmissionError(`Back side of ${selectedIdInfo.name} is required.`);
      return false;
    }

    return true;
  };

  /**
   * Uploads KYC documents to the server
   * @returns {Promise<boolean>} - Returns true if upload successful
   */
  const uploadKycDocuments = async () => {
    const formData = new FormData();
    formData.append('document_type', selectedIdInfo.apiValue);
    formData.append('captured_selfie', selfie, selfie.name);
    formData.append('front_captured_image', idFront, idFront.name);
    
    // Only append back image if required and present
    if (selectedIdInfo.needsBack && idBack) {
      formData.append('back_captured_image', idBack, idBack.name);
    }

    // CORRECTED: Using 'user_id' parameter name for upload endpoint
    const apiUrl = `${API_CONFIG.KYC_UPLOAD_URL}/user=${currentUserId}`;

    console.log("Uploading documents to:", apiUrl);
    console.log("FormData contents:");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: ${value.name} (${value.size} bytes, ${value.type})`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage;
        const responseText = await response.text();
        
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || `Upload failed with status ${response.status}`;
        } catch (e) {
          errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
        }
        
        console.error("Document upload error:", {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        });
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Document upload successful:", result);
      return true;

    } catch (error) {
      console.error("Document upload failed:", error);
      throw error;
    }
  };

  /**
   * Handles the complete verification submission process
   * Uploads documents and sends notification with proper timing
   */
  const handleSubmitVerification = async () => {
    console.log("Starting verification submission process");

    // Validate all required data
    if (!validateSubmissionData()) {
      return;
    }

    setIsLoading(true);
    setSubmissionError("");

    try {
      // Step 1: Upload KYC documents
      console.log("Step 1: Uploading KYC documents...");
      const uploadSuccess = await uploadKycDocuments();
      
      if (!uploadSuccess) {
        throw new Error("Document upload failed");
      }

      console.log("Step 1 completed: Documents uploaded successfully");

      // Step 2: Wait for backend processing (important!)
      console.log("Step 2: Waiting for backend processing...");
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

      // Step 3: Send KYC data notification with retry logic
      console.log("Step 2: Sending KYC data notification...");
      const notificationSuccess = await sendKycDataNotification(currentUserId);
      console.log(`KYC data notification ${notificationSuccess ? 'successful' : 'failed'}`);
      if (!notificationSuccess) {
        console.warn("KYC data notification failed after retries, but document upload was successful");
        // Don't fail the entire process if notification fails after retries
      }

      // Update verification status and proceed to success step
      setVerificationStatus(VERIFICATION_STATUS.PENDING);
      setCurrentStep(6);

    } catch (error) {
      console.error("Verification submission error:", error);
      setSubmissionError(error.message || "Failed to submit verification. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking verification status
  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center py-8 px-4 font-sans">
        <div className="flex flex-col items-center">
          <Loader2 size={48} className="animate-spin text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Checking verification status...</p>
        </div>
      </div>
    );
  }

  // Show verification status screens for already processed users
  if (verificationStatus === VERIFICATION_STATUS.PENDING) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center py-8 px-4 font-sans">
        <div className="w-full max-w-4xl mb-6">
          <ProfileNavBar />
        </div>
        <div className="w-full max-w-md flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl p-8 mt-12 shadow">
          <span className="inline-flex items-center px-6 py-2 rounded-full bg-orange-100 text-orange-700 font-semibold text-lg border border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700 animate-pulse mb-4">
            <CheckCircle2 size={28} className="mr-2 text-orange-500" strokeWidth={2}/>
            Verification Pending
          </span>
          <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">Your Verification is Under Review</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            Your information has been submitted and is currently under review. You will be notified by email once your account is verified. This may take up to 24 hours.
          </p>
          <Link 
            to="/" 
            className="px-6 py-2 rounded-full bg-[#FE7400] text-white font-semibold text-sm hover:bg-orange-600 transition shadow-lg" 
            style={{ borderRadius: 9999 }}
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (verificationStatus === VERIFICATION_STATUS.VERIFIED) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center py-8 px-4 font-sans">
        <div className="w-full max-w-4xl mb-6">
          <ProfileNavBar />
        </div>
        <div className="w-full max-w-md flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl p-8 mt-12 shadow">
          <CheckCircle2 size={72} className="text-green-500 mb-4" strokeWidth={1.5} />
          <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">You are already verified!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            Thank you for verifying your identity. Your account is fully verified and you have access to all features.
          </p>
          <Link 
            to="/account/profile" 
            className="px-6 py-2 rounded-lg bg-[#FE7400] text-white font-semibold text-sm hover:bg-orange-600 transition"
          >
            Go to Profile
          </Link>
        </div>
      </div>
    );
  }

  if (verificationStatus === VERIFICATION_STATUS.REJECTED) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center py-8 px-4 font-sans">
        <div className="w-full max-w-4xl mb-6">
          <ProfileNavBar />
        </div>
        <div className="w-full max-w-md flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-xl p-8 mt-12 shadow">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">Verification Rejected</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
            Your verification was not approved. Please ensure all documents are clear and information is accurate, then try again.
          </p>
          <button 
            onClick={() => {
              setVerificationStatus(VERIFICATION_STATUS.NOT_STARTED);
              setCurrentStep(1);
            }}
            className="px-6 py-2 rounded-lg bg-[#FE7400] text-white font-semibold text-sm hover:bg-orange-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Calculate progress for steps 2-6 (step 1 doesn't show progress)
  const totalStepsForProgress = 5;
  const progress = currentStep > 1 && currentStep <= totalStepsForProgress + 1 ? ((currentStep - 1) / totalStepsForProgress) * 100 : 0;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="mb-6 flex flex-col items-center text-center">
              <InitialVerifyIllustration />
              <h1 className="mt-5 text-2xl font-semibold text-black dark:text-white">Verify Your Identity</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-sm">
                To comply with regulations and ensure the security of your account, please complete the identity verification process.
              </p>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 p-5 rounded-xl mb-6">
              <div className="flex items-start">
                <ShieldCheck size={24} className="text-black dark:text-white mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-black dark:text-white">Individual Verification</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Suitable for personal use. You'll need a valid ID and a selfie. The process typically takes a few minutes.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleNextStep}
              disabled={!currentUserId}
              className="w-full bg-black text-white font-semibold rounded-lg py-3 text-sm shadow-md hover:bg-gray-800 transition duration-150 flex items-center justify-center disabled:opacity-50"
            >
              Start Verification <ChevronRight size={18} className="ml-1" />
            </button>
            {!currentUserId && submissionError && (
              <p className="mt-3 text-sm text-red-600 text-center">{submissionError}</p>
            )}
          </>
        );

      case 2: // Country Selection
        return (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-1 text-black dark:text-white">Confirm Your Country</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Select your country/region of residence.</p>
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full p-3.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-black focus:border-black outline-none appearance-none text-sm"
              >
                <option value="" disabled>Select Country</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
              <ChevronRight size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <p className="font-medium text-gray-700 dark:text-gray-300">This helps us provide you with the right services. You'll need to provide:</p>
              <ul className="list-disc list-inside pl-1 mt-1 space-y-0.5">
                <li>ID and Selfie Verification</li>
              </ul>
            </div>
          </div>
        );

      case 3: // ID Type Selection
        return (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-1 text-black dark:text-white">Select an ID Type</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Choose the document you'll use for verification.</p>
            <div className="space-y-3">
              {idTypes.map((type) => (
                <button
                  key={type.name}
                  onClick={() => {
                    setSelectedIdInfo(type);
                    handleNextStep();
                  }}
                  className={`w-full p-3.5 text-left border rounded-lg transition-all duration-150 flex items-center justify-between
                                ${selectedIdInfo?.name === type.name
                      ? "bg-gray-100 dark:bg-gray-700 border-black dark:border-white ring-2 ring-black dark:ring-white"
                      : "border-gray-300 dark:border-gray-600 hover:border-black dark:hover:border-white hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800"
                    }`}
                >
                  <div className="flex items-center">
                    {React.cloneElement(type.icon, { className: "mr-2 text-gray-700 dark:text-gray-300" })}
                    <span className="font-medium text-sm text-black dark:text-white">{type.name}</span>
                  </div>
                  <div className="flex items-center">
                  {type.recommended && (
                    <span className="mr-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-medium flex items-center">
                      <Sparkles size={12} className="mr-1 text-white" /> Recommended
                    </span>
                  )}
                  <ChevronRight size={18} className="text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 4: // Upload ID Document
        return (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-1 text-black dark:text-white">Upload ID Document</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Document: <span className="font-semibold text-black dark:text-white">{selectedIdInfo?.name}</span>.
              Ensure photos are clear and all information is legible.
            </p>
            <div className="space-y-5">
              <div>
                <FileUploadButton
                  label="Upload Front Side"
                  onFileChange={(e) => handleFileChange(e, "idFront")}
                  fileName={idFront?.name}
                  icon={<ImagePlus size={32} className="mb-2 text-gray-400" />}
                  subtext="Tap to upload front of ID"
                  disabled={isLoading}
                />
                {idFront && (
                  <div className="mt-3 text-center">
                    <img
                      src={URL.createObjectURL(idFront)}
                      alt="ID Front Preview"
                      className="max-w-full h-auto max-h-48 inline-block rounded border border-gray-300 dark:border-gray-600"
                    />
                  </div>
                )}
              </div>

              {selectedIdInfo?.needsBack && (
                <div>
                  <FileUploadButton
                    label="Upload Back Side"
                    onFileChange={(e) => handleFileChange(e, "idBack")}
                    fileName={idBack?.name}
                   icon={<ImagePlus size={32} className="mb-2 text-gray-400" />}
                   subtext="Tap to upload back of ID"
                   disabled={isLoading}
                 />
                 {idBack && (
                   <div className="mt-3 text-center">
                     <img
                       src={URL.createObjectURL(idBack)}
                       alt="ID Back Preview"
                       className="max-w-full h-auto max-h-48 inline-block rounded border border-gray-300 dark:border-gray-600"
                     />
                   </div>
                 )}
               </div>
             )}
           </div>
         </div>
       );

     case 5: // Take Selfie
       return (
         <div className="w-full">
           <h2 className="text-xl font-semibold mb-1 text-black dark:text-white">Take a Selfie</h2>
           <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
             Position your face in the frame. Ensure good lighting and no accessories like glasses or hats.
           </p>
           <div className="w-full aspect-square max-w-[280px] mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-5 relative overflow-hidden">
             {selfie ? (
               <img src={URL.createObjectURL(selfie)} alt="Selfie preview" className="object-cover w-full h-full" />
             ) : (
               <Camera size={56} className="text-gray-400" />
             )}
           </div>
           <FileUploadButton
             label={selfie ? "Retake Selfie" : "Capture Selfie"}
             onFileChange={(e) => handleFileChange(e, "selfie")}
             fileName={selfie?.name}
             icon={<Camera size={24} className="mb-1 text-gray-400" />}
             subtext="Use your device camera or upload a photo"
             disabled={isLoading}
           />
           {submissionError && <p className="mt-3 text-sm text-red-600 text-center">{submissionError}</p>}
         </div>
       );

     case 6: // Submitted / Thank you
       return (
         <div className="w-full text-center py-12 flex flex-col items-center">
           <div className="flex items-center justify-center mb-4">
             <span className="inline-flex items-center px-6 py-2 rounded-full bg-orange-100 text-orange-700 font-semibold text-lg border border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700 animate-pulse">
               <CheckCircle2 size={32} className="mr-2 text-orange-500" strokeWidth={2}/>
               Pending Review
             </span>
           </div>
           <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">Verification Submitted</h2>
           <p className="text-base text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
             Thank you! Your information has been submitted and is now <span className='font-semibold text-orange-500 dark:text-orange-400'>pending review</span>.<br/>
             You will receive an email once your verification has been processed. This may take up to 24 hours.
           </p>
           <button
             onClick={() => {
               window.location.href = "/";
             }}
             className="px-8 py-2.5 bg-black text-white font-semibold rounded-lg text-sm shadow-md hover:bg-gray-800 transition"
             style={{ borderRadius: 9999 }}
           >
             Done
           </button>
         </div>
       );
     default:
       return <p className="text-gray-700 dark:text-gray-300">An unexpected error occurred. Please try again.</p>;
   }
 };

 const showNavigation = currentStep > 1 && currentStep < 6;

 const isNextDisabled = () => {
   if (isLoading) return true;
   if (!currentUserId) return true;
   if (currentStep === 2 && !selectedCountry) return true;
   if (currentStep === 4 && (!idFront || (selectedIdInfo?.needsBack && !idBack))) return true;
   if (currentStep === 5 && !selfie) return true;
   return false;
 };

 return (
   <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center py-8 px-4 font-sans">
     <div className="w-full max-w-4xl mb-6">
       <ProfileNavBar />
     </div>
     <div className="w-full max-w-md"> {/* This div constrains the overall width */}
       {currentStep > 1 && currentStep < 6 && (
           <div className="mb-5 text-center">
            <LockKeyhole size={28} className="text-black dark:text-white mx-auto mb-2" />
            <h1 className="text-2xl font-semibold text-black dark:text-white">Identity Verification</h1>
           <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-3 mb-1">
               <div
               className="bg-black dark:bg-white h-1.5 rounded-full transition-all duration-300 ease-out"
               style={{ width: `${progress}%` }}
               ></div>
           </div>
           <p className="text-xs text-gray-500 dark:text-gray-400">Step {currentStep-1} of {totalStepsForProgress}</p>
          </div>
       )}

       {/* Main content area: styling updated for less "card" feel */}
       <div className={`w-full bg-white dark:bg-gray-800 rounded-xl 
            ${currentStep === 1 || currentStep === 6 ? 'flex flex-col items-center' : ''}
            ${(currentStep > 1 && currentStep < 6) ? 'p-6 sm:p-8' : ''} 
            ${currentStep === 1 ? 'p-6 sm:p-8' : ''} 
            ${currentStep === 6 ? 'py-8' : ''}      
            `}>
         {renderStepContent()}
         {showNavigation && (
           <div className="mt-8 flex items-center justify-between">
             <button
               onClick={handlePrevStep}
               disabled={isLoading || !currentUserId}
               className="px-5 py-2.5 text-sm font-medium text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 flex items-center disabled:opacity-70"
             >
               <ChevronLeft size={16} className="mr-1" /> Back
             </button>
             <button
               onClick={currentStep === 5 ? handleSubmitVerification : handleNextStep}
               disabled={isNextDisabled()}
               className="px-5 py-2.5 bg-black text-white font-semibold rounded-lg text-sm shadow-md hover:bg-gray-800 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
             >
               {isLoading && currentStep === 5 ? (
                 <Loader2 size={18} className="animate-spin" />
               ) : (
                 <>
                   {currentStep === 5 ? "Submit Verification" : "Next"}
                   {currentStep < 5 && <ChevronRight size={16} className="ml-1" />}
                 </>
               )}
             </button>
           </div>
         )}
       </div>

       {currentStep < 6 && (
         <div className="text-xs text-gray-500 dark:text-gray-400 mt-6 text-center max-w-xs mx-auto">
           <Info size={14} className="inline mr-1 mb-0.5 text-gray-400" />
           Your information is encrypted and stored securely. It will only be used for identity verification purposes.
           <a href="#" className="ml-1 text-black dark:text-white hover:underline font-medium">Learn more</a>
         </div>
       )}
     </div>
   </div>
 );
};

export default VerifyPage;