import React, { useState, useRef, useEffect, useCallback } from "react";
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
import axios from "axios";

// Configuration constants
// Update the API_CONFIG with CORS headers
const API_CONFIG = {
  KYC_STATUS_BASE_URL: "https://api.kinecoin.co/api/v1/kyc-status",
  KYC_UPLOAD_URL: "https://django.kinecoin.co/api/user_account/upload-kyc",
  KYC_SEND_DATA_URL: "https://django.kinecoin.co/api/user_account/send-kyc-data",
  API_KEY: "A20RqFwVktRxxRqrKBtmi6ud",
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  COMPRESSION_THRESHOLD: 2 * 1024 * 1024, // 2MB
  REQUEST_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
  // Add common headers
  HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  }
};


// Verification status enum for better code readability
const VERIFICATION_STATUS = {
  NOT_STARTED: 'not_started',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

// Supported file types
const SUPPORTED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

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
{ code: "AD", name: "Andorra", flag: "🇦🇩" },
{ code: "AM", name: "Armenia", flag: "🇦🇲" },
{ code: "AT", name: "Austria", flag: "🇦🇹" },
{ code: "AZ", name: "Azerbaijan", flag: "🇦🇿" },
{ code: "BE", name: "Belgium", flag: "🇧🇪" },
{ code: "BG", name: "Bulgaria", flag: "🇧🇬" },
{ code: "BY", name: "Belarus", flag: "🇧🇾" },
{ code: "CA", name: "Canada", flag: "🇨🇦" },
{ code: "CH", name: "Switzerland", flag: "🇨🇭" },
{ code: "CY", name: "Cyprus", flag: "🇨🇾" },
{ code: "CZ", name: "Czech Republic", flag: "🇨🇿" },
{ code: "DE", name: "Germany", flag: "🇩🇪" },
{ code: "DK", name: "Denmark", flag: "🇩🇰" },
{ code: "ES", name: "Spain", flag: "🇪🇸" },
{ code: "FI", name: "Finland", flag: "🇫🇮" },
{ code: "FR", name: "France", flag: "🇫🇷" },
{ code: "GB", name: "United Kingdom", flag: "🇬🇧" },
{ code: "GE", name: "Georgia", flag: "🇬🇪" },
{ code: "GR", name: "Greece", flag: "🇬🇷" },
{ code: "HR", name: "Croatia", flag: "🇭🇷" },
{ code: "HU", name: "Hungary", flag: "🇭🇺" },
{ code: "IE", name: "Ireland", flag: "🇮🇪" },
{ code: "IS", name: "Iceland", flag: "🇮🇸" },
{ code: "IT", name: "Italy", flag: "🇮🇹" },
{ code: "IN", name: "India", flag: "🇮🇳" },       // Added India
{ code: "PK", name: "Pakistan", flag: "🇵🇰" },    // Added Pakistan
{ code: "LU", name: "Luxembourg", flag: "🇱🇺" },
{ code: "MC", name: "Monaco", flag: "🇲🇨" },
{ code: "MD", name: "Moldova", flag: "🇲🇩" },
{ code: "ME", name: "Montenegro", flag: "🇲🇪" },
{ code: "MK", name: "North Macedonia", flag: "🇲🇰" },
{ code: "MT", name: "Malta", flag: "🇲🇹" },
{ code: "MY", name: "Malaysia", flag: "🇲🇾" },
{ code: "NL", name: "Netherlands", flag: "🇳🇱" },
{ code: "NO", name: "Norway", flag: "🇳🇴" },
{ code: "PH", name: "Philippines", flag: "🇵🇭" },
{ code: "PL", name: "Poland", flag: "🇵🇱" },
{ code: "PT", name: "Portugal", flag: "🇵🇹" },
{ code: "RO", name: "Romania", flag: "🇷🇴" },
{ code: "SE", name: "Sweden", flag: "🇸🇪" },
{ code: "SG", name: "Singapore", flag: "🇸🇬" },
{ code: "US", name: "United States", flag: "🇺🇸" }


];

const idTypes = [
  { name: "Driver's License", apiValue: "drivers_license", icon: <FileText size={20} className="mr-2 text-gray-700" />, recommended: true, needsBack: true },
  { name: "National ID Card", apiValue: "national_id", icon: <FileText size={20} className="mr-2 text-gray-700" />, needsBack: true },
  { name: "Passport", apiValue: "passport", icon: <FileText size={20} className="mr-2 text-gray-700" />, needsBack: false },
  { name: "Unified Multi Purpose ID (UMID)", apiValue: "umid", icon: <FileText size={20} className="mr-2 text-gray-700" />, needsBack: true },
  { name: "Postal ID", apiValue: "postal_id", icon: <FileText size={20} className="mr-2 text-gray-700" />, needsBack: true },
  { name: "PRC ID", apiValue: "prc_id", icon: <FileText size={20} className="mr-2 text-gray-700" />, needsBack: true },
];

const FileUploadButton = ({ label, onFileChange, fileName, icon, subtext, disabled, isCameraAvailable, onCameraClick, isCameraLoading }) => {
  const inputRef = useRef(null);
  
  const handleClick = async () => {
    if (disabled) return;
    
    // If camera is available, try to use it first
    if (isCameraAvailable && onCameraClick) {
      try {
        await onCameraClick();
      } catch (error) {
        console.log("Camera failed, falling back to file upload:", error);
        // If camera fails, fall back to file upload
        if (inputRef.current) {
          inputRef.current.click();
        }
      }
    } else {
      // No camera available, use file upload
      if (inputRef.current) {
        inputRef.current.click();
      }
    }
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-black transition-colors bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isCameraLoading ? (
          <Loader2 size={32} className="mb-2 text-gray-400 animate-spin" />
        ) : (
          icon || <UploadCloud size={32} className="mb-2 text-gray-400" />
        )}
        <span className="text-sm font-medium text-black">
          {isCameraLoading ? "Starting Camera..." : label}
        </span>
        {fileName && <span className="text-xs text-green-600 mt-1 break-all">{fileName}</span>}
        {!fileName && !isCameraLoading && subtext && (
          <span className="text-xs text-gray-500 mt-1">{subtext}</span>
        )}
        {!fileName && !isCameraLoading && isCameraAvailable && (
          <span className="text-xs text-blue-600 mt-1">Camera will open first, or choose file</span>
        )}
      </button>
      
      <input
        type="file"
        ref={inputRef}
        onChange={onFileChange}
        className="hidden"
        accept={SUPPORTED_FILE_TYPES.join(',')}
        disabled={disabled}
      />
    </div>
  );
};

const VerifyPage = () => {
  // ALL HOOKS MUST BE DECLARED AT THE TOP LEVEL - NO CONDITIONAL HOOKS
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
  
  // Camera states
  const [isCameraMode, setIsCameraMode] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [stream, setStream] = useState(null);
  const [isCameraAvailable, setIsCameraAvailable] = useState(false);

  // Refs for cleanup
  const imagePreviewUrls = useRef([]);
  const abortController = useRef(null);
  
  // Camera refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // ALL useCallback hooks must be declared here - no conditional callbacks
  // Cleanup function for image URLs
  const cleanupImageUrls = useCallback(() => {
    imagePreviewUrls.current.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.warn('Failed to revoke URL:', error);
      }
    });
    imagePreviewUrls.current = [];
  }, []);

  // File validation helper
  const validateFile = useCallback((file) => {
    if (!file) {
      return { isValid: false, error: 'No file selected' };
    }

    if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
      return { 
        isValid: false, 
        error: 'Unsupported file type. Please use PNG, JPEG, JPG, or WebP format.' 
      };
    }

    if (file.size > API_CONFIG.MAX_FILE_SIZE) {
      return { 
        isValid: false, 
        error: `File size too large. Maximum size is ${API_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB.` 
      };
    }

    if (file.size === 0) {
      return { isValid: false, error: 'File appears to be empty' };
    }

    return { isValid: true };
  }, []);

  const fetchVerificationStatus = useCallback(async (uid) => {
    if (!uid) {
      throw new Error('UID is required');
    }
  
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
          mode: 'cors', // Enable CORS
          credentials: 'omit', // Don't send credentials
          signal: abortController.current.signal,
        }
      );
  
      if (!response.ok) {
        console.log(`KYC status API returned ${response.status}, treating as not started`);
        return VERIFICATION_STATUS.NOT_STARTED;
      }
  
      const data = await response.json();
      console.log("KYC Status API Response:", data);
      
      if (data.status) {
        const status = data.status.toLowerCase();
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
      
      if (data.message && data.error !== undefined) {
        console.log("User has not started verification process");
        return VERIFICATION_STATUS.NOT_STARTED;
      }
      
      return VERIFICATION_STATUS.NOT_STARTED;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Verification status request was cancelled');
        return VERIFICATION_STATUS.NOT_STARTED;
      }
      console.error("Error fetching verification status:", error);
      return VERIFICATION_STATUS.NOT_STARTED;
    }
  }, []);


  const sendKycDataNotification = useCallback(async (uid) => {
    let attempts = 0;
    const maxAttempts = API_CONFIG.MAX_RETRIES;

    while (attempts < maxAttempts) {
      try {
        console.log(`Sending KYC data notification (attempt ${attempts + 1}/${maxAttempts})`);
        
        const storedUid = localStorage.getItem('uid');
        if (!storedUid) {
          throw new Error("UID not found in localStorage");
        }

        if (abortController.current) {
          abortController.current.abort();
        }
        abortController.current = new AbortController();
        
        const response = await fetch(API_CONFIG.KYC_SEND_DATA_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uid: storedUid }),
          signal: abortController.current.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`KYC notification attempt ${attempts + 1} failed:`, {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });
          
          if (response.status >= 500 && attempts < maxAttempts - 1) {
            console.log(`Server error detected, waiting before retry ${attempts + 2}...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1)));
            attempts++;
            continue;
          }
          
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        console.log(`KYC data notification sent successfully on attempt ${attempts + 1}:`, result);
        return true;

      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('KYC notification request was cancelled');
          return false;
        }

        console.error(`KYC notification attempt ${attempts + 1} error:`, error);
        
        if (attempts === maxAttempts - 1) {
          throw error;
        }
        
        console.log(`Waiting before retry ${attempts + 2}...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempts + 1)));
        attempts++;
      }
    }
    
    return false;
  }, []);

  const handleNextStep = useCallback(() => {
    setSubmissionError("");
    setCurrentStep((prev) => prev + 1);
  }, []);

  const handlePrevStep = useCallback(() => {
    setSubmissionError("");
    setCurrentStep((prev) => prev - 1);
  }, []);

  const handleFileChange = useCallback((e, fileType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      setSubmissionError(validation.error);
      return;
    }

    setSubmissionError("");

    const previewUrl = URL.createObjectURL(file);
    imagePreviewUrls.current.push(previewUrl);

    if (fileType === "idFront") {
      setIdFront(file);
    } else if (fileType === "idBack") {
      setIdBack(file);
    } else if (fileType === "selfie") {
      setSelfie(file);
    }
  }, [validateFile]);

  const validateSubmissionData = useCallback(() => {
    if (!currentUserId) {
      setSubmissionError("UID is missing. Cannot submit verification.");
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

    const filesToValidate = [
      { file: selfie, name: 'Selfie' },
      { file: idFront, name: 'ID Front' }
    ];

    if (selectedIdInfo.needsBack && idBack) {
      filesToValidate.push({ file: idBack, name: 'ID Back' });
    }

    for (const { file, name } of filesToValidate) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        setSubmissionError(`${name}: ${validation.error}`);
        return false;
      }
    }

    return true;
  }, [currentUserId, selectedIdInfo, selfie, idFront, idBack, validateFile]);

  const compressImage = useCallback(async (file, maxWidth = 1200, quality = 0.8) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      const timeout = setTimeout(() => {
        reject(new Error('Image compression timeout'));
      }, 10000);
      
      img.onload = () => {
        clearTimeout(timeout);
        try {
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          }, file.type, quality);
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to load image for compression'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const uploadWithFetch = useCallback(async (apiUrl, formData) => {
    console.log("Trying fallback upload with fetch API...");
    
    try {
      if (abortController.current) {
        abortController.current.abort();
      }
      abortController.current = new AbortController();
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type for FormData
        },
        signal: abortController.current.signal,
      });
  
      if (!response.ok) {
        const responseText = await response.text();
        console.error("Fetch upload error:", {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        });
        throw new Error(`Upload failed with status ${response.status}: ${responseText}`);
      }
  
      const result = await response.json();
      console.log("Fetch upload successful:", result);
      return true;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Upload request was cancelled');
        return false;
      }
      console.error("Fetch upload also failed:", error);
      throw error;
    }
  }, []);

const uploadKycDocuments = useCallback(async () => {
  console.log("Starting document upload process...");
  
  let compressedSelfie = selfie;
  let compressedIdFront = idFront;
  let compressedIdBack = idBack;
  
  try {
    console.log("Compressing images...");
    if (selfie.size > API_CONFIG.COMPRESSION_THRESHOLD) {
      compressedSelfie = await compressImage(selfie);
      console.log(`Selfie compressed: ${selfie.size} -> ${compressedSelfie.size} bytes`);
    }
    
    if (idFront.size > API_CONFIG.COMPRESSION_THRESHOLD) {
      compressedIdFront = await compressImage(idFront);
      console.log(`ID Front compressed: ${idFront.size} -> ${compressedIdFront.size} bytes`);
    }
    
    if (selectedIdInfo.needsBack && idBack && idBack.size > API_CONFIG.COMPRESSION_THRESHOLD) {
      compressedIdBack = await compressImage(idBack);
      console.log(`ID Back compressed: ${idBack.size} -> ${compressedIdBack.size} bytes`);
    }
  } catch (compressionError) {
    console.warn("Image compression failed, using original images:", compressionError);
  }

  const formData = new FormData();
  formData.append('document_type', selectedIdInfo.apiValue);
  formData.append('captured_selfie', compressedSelfie, compressedSelfie.name);
  formData.append('front_captured_image', compressedIdFront, compressedIdFront.name);
  
  if (selectedIdInfo.needsBack && compressedIdBack) {
    formData.append('back_captured_image', compressedIdBack, compressedIdBack.name);
  }

  const apiUrl = `${API_CONFIG.KYC_UPLOAD_URL}/user=${currentUserId}`;

  console.log("Uploading documents to:", apiUrl);
  console.log("Current User ID (integer):", currentUserId, "Type:", typeof currentUserId);
  console.log("UID from localStorage:", localStorage.getItem('uid'));
  console.log("FormData contents:");
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`${key}: ${value.name} (${value.size} bytes, ${value.type})`);
    } else {
      console.log(`${key}: ${value}`);
    } 
  }

  try {
    const files = [compressedSelfie, compressedIdFront];
    if (selectedIdInfo.needsBack && compressedIdBack) {
      files.push(compressedIdBack);
    }

    for (const file of files) {
      if (file && file.size > API_CONFIG.MAX_FILE_SIZE) {
        throw new Error(`File ${file.name} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please use files smaller than ${API_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB.`);
      }
    }

    console.log("File size check passed, starting upload...");

    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type for FormData, let axios handle it
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
        timeout: API_CONFIG.REQUEST_TIMEOUT,
        maxContentLength: 20 * 1024 * 1024,
        maxBodyLength: 20 * 1024 * 1024,
        withCredentials: false,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
      });

      console.log("Document upload successful with axios:", response.data);
      return true;
    } catch (axiosError) {
      console.warn("Axios upload failed, trying fetch fallback:", axiosError);
      return await uploadWithFetch(apiUrl, formData);
    }

  } catch (error) {
    console.error("Document upload failed:", error);
    
    if (error.code === 'ECONNABORTED' || error.name === 'TimeoutError') {
      throw new Error("Upload timeout. Please try again with smaller images or check your internet connection.");
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error("Network connection error. Please check your internet connection and try again. If the problem persists, try using smaller image files.");
    } else if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      console.log("Server error response:", { status, data });
      
      let errorMessage = `Upload failed with status ${status}`;
      if (data && typeof data === 'object' && data.message) {
        errorMessage = data.message;
      } else if (data && typeof data === 'string') {
        errorMessage = data;
      }
      
      throw new Error(errorMessage);
    } else if (error.request) {
      console.log("Network error details:", error.request);
      throw new Error("Unable to connect to the server. Please check your internet connection and try again.");
    } else {
      throw new Error(error.message || "An unexpected error occurred during upload.");
    }
  }
}, [selfie, idFront, idBack, selectedIdInfo, currentUserId, compressImage, uploadWithFetch]);


  const handleSubmitVerification = useCallback(async () => {
    console.log("Starting verification submission process");

    if (!validateSubmissionData()) {
      return;
    }

    setIsLoading(true);
    setSubmissionError("");

    try {
      console.log("Step 1: Uploading KYC documents...");
      const uploadSuccess = await uploadKycDocuments();
      
      if (!uploadSuccess) {
        throw new Error("Document upload failed");
      }

      console.log("Step 1 completed: Documents uploaded successfully");

      console.log("Step 2: Waiting for backend processing...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log("Step 3: Sending KYC data notification...");
      try {
        const storedUid = localStorage.getItem('uid');
        const notificationSuccess = await sendKycDataNotification(storedUid); // Use UID for notification
        console.log(`KYC data notification ${notificationSuccess ? 'successful' : 'failed'}`);
        if (!notificationSuccess) {
          console.warn("KYC data notification failed after retries, but document upload was successful");
        }
      } catch (notificationError) {
        console.warn("KYC notification failed:", notificationError);
      }

      setVerificationStatus(VERIFICATION_STATUS.PENDING);
      setCurrentStep(6);

    } catch (error) {
      console.error("Verification submission error:", error);
      const errorMessage = error.message || "Failed to submit verification. Please try again.";
      setSubmissionError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [validateSubmissionData, uploadKycDocuments, sendKycDataNotification]);

  const handleFileReset = useCallback((fileType) => {
    if (fileType === "idFront") {
      setIdFront(null);
    } else if (fileType === "idBack") {
      setIdBack(null);
    } else if (fileType === "selfie") {
      setSelfie(null);
      // Also stop camera if it's running
      stopCamera();
      setIsCameraMode(false);
    }
    setSubmissionError("");
  }, []);

  // Check camera availability
  const checkCameraAvailability = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsCameraAvailable(false);
        return;
      }
      
      // Try to enumerate devices to check if camera exists
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasCamera = devices.some(device => device.kind === 'videoinput');
      setIsCameraAvailable(hasCamera);
    } catch (error) {
      console.log("Camera availability check failed:", error);
      setIsCameraAvailable(false);
    }
  }, []);

  // Camera functions
  const startCamera = useCallback(async () => {
    setIsCameraLoading(true);
    setCameraError("");
    
    try {
      console.log("Requesting camera access...");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user", // Front-facing camera for selfie
          width: { ideal: 640 },
          height: { ideal: 640 }
        }
      });
      
      console.log("Camera access granted, setting stream...");
      setStream(mediaStream);
      setIsCameraMode(true);
      
      // Wait for next render cycle to ensure video element is available
      setTimeout(() => {
        if (videoRef.current && mediaStream) {
          console.log("Setting video source...");
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(e => {
            console.error("Error playing video:", e);
          });
        }
      }, 100);
      
      setIsCameraLoading(false);
      return true; // Success
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraError("Camera access denied or not available. Please check your browser permissions.");
      setIsCameraLoading(false);
      throw error; // Re-throw so FileUploadButton can catch and fallback
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraMode(false);
    setCameraError("");
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const timestamp = new Date().getTime();
        const file = new File([blob], `selfie_${timestamp}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        
        setSelfie(file);
        stopCamera();
        setSubmissionError("");
      }
    }, 'image/jpeg', 0.8);
  }, [stopCamera]);

  const isNextDisabled = useCallback(() => {
    if (isLoading) return true;
    if (!currentUserId) return true;
    if (currentStep === 2 && !selectedCountry) return true;
    if (currentStep === 4 && (!idFront || (selectedIdInfo?.needsBack && !idBack))) return true;
    if (currentStep === 5 && !selfie) return true;
    return false;
  }, [isLoading, currentUserId, currentStep, selectedCountry, idFront, selectedIdInfo, idBack, selfie]);

  // useEffect for video stream connection
  useEffect(() => {
    if (isCameraMode && stream && videoRef.current) {
      console.log("Connecting stream to video element...");
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => {
        console.error("Error playing video:", e);
      });
    }
  }, [isCameraMode, stream]);

  // useEffect - must be at the top level, no conditional effects
  useEffect(() => {
    const initializeVerificationCheck = async () => {
      const storedUid = localStorage.getItem('uid');
      const storedUserId = localStorage.getItem('user_id'); // Get the integer user_id
      
      if (!storedUid || !storedUserId) {
        console.error("UID or User ID not found in localStorage");
        setSubmissionError("User information not found. Please log in again.");
        setIsCheckingStatus(false);
        return;
      }

      setCurrentUserId(storedUserId); // Use the integer user_id for KYC upload

      try {
        const status = await fetchVerificationStatus(storedUid); // Use UID for status check
        setVerificationStatus(status);
        console.log("Current verification status:", status);
      } catch (error) {
        console.error("Failed to check verification status:", error);
        setSubmissionError("Failed to check verification status. Please try again.");
      } finally {
        setIsCheckingStatus(false);
      }
    };

    // Check camera availability
    checkCameraAvailability();

    initializeVerificationCheck();

    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
      cleanupImageUrls();
      // Stop camera stream if active
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [fetchVerificationStatus, cleanupImageUrls, checkCameraAvailability]);

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
            className="px-6 py-2 rounded-full bg-[#F88726] text-white font-semibold text-sm hover:bg-orange-600 transition shadow-lg" 
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
           className="px-6 py-2 rounded-lg bg-[#F88726] text-white font-semibold text-sm hover:bg-orange-600 transition"
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
             setIdFront(null);
             setIdBack(null);
             setSelfie(null);
             setSelectedIdInfo(null);
             setSelectedCountry("PH");
             setSubmissionError("");
             cleanupImageUrls();
           }}
           className="px-6 py-2 rounded-lg bg-[#F88726] text-white font-semibold text-sm hover:bg-orange-600 transition"
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
             disabled={!currentUserId || isLoading}
             className="w-full bg-black text-white font-semibold rounded-lg py-3 text-sm shadow-md hover:bg-gray-800 transition duration-150 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isLoading ? (
               <Loader2 size={18} className="animate-spin mr-2" />
             ) : (
               <>
                 Start Verification <ChevronRight size={18} className="ml-1" />
               </>
             )}
           </button>
           {submissionError && (
             <p className="mt-3 text-sm text-red-600 dark:text-red-400 text-center">{submissionError}</p>
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
               onChange={(e) => {
                 setSelectedCountry(e.target.value);
                 setSubmissionError("");
               }}
               className="w-full p-3.5 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:ring-2 focus:ring-black focus:border-black outline-none appearance-none text-sm"
               disabled={isLoading}
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
           {submissionError && (
             <p className="mt-3 text-sm text-red-600 dark:text-red-400">{submissionError}</p>
           )}
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
                   setSubmissionError("");
                   handleNextStep();
                 }}
                 disabled={isLoading}
                 className={`w-full p-3.5 text-left border rounded-lg transition-all duration-150 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed
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
           {submissionError && (
             <p className="mt-3 text-sm text-red-600 dark:text-red-400">{submissionError}</p>
           )}
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
                 isCameraAvailable={false}
               />
               {idFront && (
                 <div className="mt-3 text-center">
                   <img
                     src={URL.createObjectURL(idFront)}
                     alt="ID Front Preview"
                     className="max-w-full h-auto max-h-48 inline-block rounded border border-gray-300 dark:border-gray-600"
                     onError={(e) => {
                       console.error("Failed to load image preview");
                       e.target.style.display = 'none';
                     }}
                   />
                   <button
                     onClick={() => handleFileReset("idFront")}
                     className="block mx-auto mt-2 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                     disabled={isLoading}
                   >
                     Remove Image
                   </button>
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
                   isCameraAvailable={false}
                 />
                 {idBack && (
                   <div className="mt-3 text-center">
                     <img
                       src={URL.createObjectURL(idBack)}
                       alt="ID Back Preview"
                       className="max-w-full h-auto max-h-48 inline-block rounded border border-gray-300 dark:border-gray-600"
                       onError={(e) => {
                         console.error("Failed to load image preview");
                         e.target.style.display = 'none';
                       }}
                     />
                     <button
                       onClick={() => handleFileReset("idBack")}
                       className="block mx-auto mt-2 text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                       disabled={isLoading}
                     >
                       Remove Image
                     </button>
                   </div>
                 )}
               </div>
             )}
           </div>
           {submissionError && (
             <p className="mt-3 text-sm text-red-600 dark:text-red-400">{submissionError}</p>
           )}
         </div>
       );

     case 5: // Take Selfie
       return (
         <div className="w-full">
           <h2 className="text-xl font-semibold mb-1 text-black dark:text-white">Take a Selfie</h2>
           <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
             Position your face in the frame. Ensure good lighting and no accessories like glasses or hats.
           </p>
           
           {/* Camera/Image Preview Area */}
           <div className="w-full aspect-square max-w-[280px] mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-5 relative overflow-hidden">
             {isCameraMode && !selfie ? (
               <video
                 ref={videoRef}
                 className="object-cover w-full h-full scale-x-[-1]" // Mirror effect for front camera
                 autoPlay
                 playsInline
                 muted
                 onLoadedMetadata={() => console.log("Video metadata loaded")}
                 onCanPlay={() => console.log("Video can play")}
                 onError={(e) => console.error("Video error:", e)}
               />
             ) : selfie ? (
               <img 
                 src={URL.createObjectURL(selfie)} 
                 alt="Selfie preview" 
                 className="object-cover w-full h-full"
                 onError={(e) => {
                   console.error("Failed to load selfie preview");
                   e.target.style.display = 'none';
                 }}
               />
             ) : (
               <Camera size={56} className="text-gray-400" />
             )}
             
             {/* Capture button overlay when camera is active */}
             {isCameraMode && !selfie && (
               <button
                 onClick={capturePhoto}
                 disabled={isLoading}
                 className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
               >
                 <div className="w-12 h-12 bg-red-500 rounded-full"></div>
               </button>
             )}
           </div>

           {/* Hidden canvas for photo capture */}
           <canvas ref={canvasRef} className="hidden" />

           {/* Action Buttons */}
           {!selfie && !isCameraMode && (
             <FileUploadButton
               label="Upload Photo"
               onFileChange={(e) => handleFileChange(e, "selfie")}
               fileName={selfie?.name}
               icon={<ImagePlus size={32} className="mb-2 text-gray-400" />}
               subtext="Choose from your device"
               disabled={isLoading}
               isCameraAvailable={isCameraAvailable}
               onCameraClick={startCamera}
               isCameraLoading={isCameraLoading}
             />
           )}

           {/* Camera Controls */}
           {isCameraMode && !selfie && (
             <div className="flex justify-center space-x-3">
               <button
                 onClick={stopCamera}
                 disabled={isLoading}
                 className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
               >
                 Cancel
               </button>
             </div>
           )}

           {/* Selfie Actions */}
           {selfie && (
             <div className="text-center space-y-3">
               <div className="flex justify-center space-x-3">
                 <button
                   onClick={() => handleFileReset("selfie")}
                   className="px-4 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                   disabled={isLoading}
                 >
                   Retake Photo
                 </button>
               </div>
             </div>
           )}

           {/* Error Messages */}
           {cameraError && (
             <p className="mt-3 text-sm text-red-600 dark:text-red-400 text-center">{cameraError}</p>
           )}
           {submissionError && (
             <p className="mt-3 text-sm text-red-600 dark:text-red-400 text-center">{submissionError}</p>
           )}
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

 return (
   <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center py-8 px-4 font-sans">
     <div className="w-full max-w-4xl mb-6">
       <ProfileNavBar />
     </div>
     <div className="w-full max-w-md">
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

       {/* Main content area */}
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
               className="px-5 py-2.5 text-sm font-medium text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
             >
               <ChevronLeft size={16} className="mr-1" /> Back
             </button>
             <button
               onClick={currentStep === 5 ? handleSubmitVerification : handleNextStep}
               disabled={isNextDisabled()}
               className="px-5 py-2.5 bg-black text-white font-semibold rounded-lg text-sm shadow-md hover:bg-gray-800 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
             >
               {isLoading && currentStep === 5 ? (
                 <>
                   <Loader2 size={18} className="animate-spin mr-2" />
                   Submitting...
                 </>
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