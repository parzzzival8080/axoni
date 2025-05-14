import React, { useState, useRef, useEffect } from "react";
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
  Loader2,
  Check // Added for the verified screen icon
} from "lucide-react";
import ProfileNavBar from "../../components/profile/ProfileNavBar"; // Assuming this path is correct

// Illustration for the "Already Verified" screen (based on user's image)
const VerifiedIllustration = () => (
  <div className="relative w-28 h-28 mb-6 animate-pulse"> {/* Slightly larger and pulsing container */}
    {/* Outer dashed/dotted circles - simplified with borders and animation */}
    <div className="absolute inset-0 border-2 border-gray-300 border-dashed rounded-full animate-spin-slow"></div>
    <div className="absolute inset-2 border-t-2 border-gray-200 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
    {/* Inner static circle with checkmark */}
    <div className="absolute inset-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
      <Check size={48} className="text-white" strokeWidth={3}/> {/* Larger check, more prominent */}
    </div>
  </div>
);


// Original VerifyIllustration for the first step of KYC
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
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState("PH");
  const [selectedIdInfo, setSelectedIdInfo] = useState(null);
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false); // New state for verification status

  useEffect(() => {
    // Fetch user_id from localStorage
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setCurrentUserId(storedUserId);
    } else {
      console.error("User ID not found in localStorage. Verification may fail.");
      // Potentially set an error or redirect if user_id is critical for page load
      // For now, the KYC flow will show an error if user_id is missing at submission
    }

    // Check verification status from localStorage
    const storedIsVerified = localStorage.getItem('is_verified');
    if (storedIsVerified === 'true') {
      setIsAlreadyVerified(true);
    }
  }, []); // Empty dependency array ensures this runs once on mount

  const handleNextStep = () => {
    setSubmissionError(""); // Clear previous errors
    setCurrentStep((prev) => prev + 1);
  }
  const handlePrevStep = () => {
    setSubmissionError(""); // Clear previous errors
    setCurrentStep((prev) => prev - 1);
  }

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      if (fileType === "idFront") setIdFront(file);
      else if (fileType === "idBack") setIdBack(file);
      else if (fileType === "selfie") setSelfie(file);
      setSubmissionError(""); // Clear error if user changes a file
    }
  };

  const handleSubmitVerification = async () => {
    console.log("handleSubmitVerification called");
    console.log("Current User ID:", currentUserId);
    console.log("Selected ID Info:", selectedIdInfo);

    if (!currentUserId) {
        setSubmissionError("User ID is missing. Cannot submit verification.");
        return;
    }
    if (!selectedIdInfo || !selectedIdInfo.apiValue) {
        setSubmissionError("ID type information is missing or invalid. Please re-select an ID type.");
        return;
    }
    if (!selfie || !idFront) {
        setSubmissionError("Missing required images for submission (selfie or ID front).");
        return;
    }
    if (selectedIdInfo.needsBack && !idBack) {
        setSubmissionError(`Back side of ${selectedIdInfo.name} is required.`);
        return;
    }

    const documentTypeApiValue = selectedIdInfo.apiValue;
    if (!documentTypeApiValue || typeof documentTypeApiValue !== 'string' || documentTypeApiValue.trim() === "") {
        console.error("CRITICAL FAILURE: documentTypeApiValue is invalid. Value:", `'${documentTypeApiValue}'`);
        setSubmissionError("A critical error occurred: Invalid document type configured.");
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    setSubmissionError("");

    const formData = new FormData();
    formData.append('document_type', documentTypeApiValue);
    formData.append('captured_selfie', selfie, selfie.name);
    formData.append('front_captured_image', idFront, idFront.name);
    
    if (selectedIdInfo.needsBack && idBack) {
      formData.append('back_captured_image', idBack, idBack.name);
    } else if (selectedIdInfo.needsBack && !idBack) {
        // This should ideally be caught by earlier validation
        setSubmissionError(`Back side of ${selectedIdInfo.name} is required for submission.`);
        setIsLoading(false);
        return;
    }

    const apiUrl = `https://django.bhtokens.com/api/user_account/upload-kyc/user=${currentUserId}`;
    console.log("Final API URL being called (POST):", apiUrl);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorData;
        const responseText = await response.text();
        try {
            errorData = JSON.parse(responseText);
        } catch (e) {
            errorData = { message: `API Error: ${response.status} ${response.statusText}. Response: ${responseText}` };
        }
        console.error("API Error Response (Raw Text):", responseText);
        console.error("API Error Response (Parsed or Constructed):", errorData);
        throw new Error(errorData.message || `API request failed. See console for details.`);
      }
      
      // On successful submission
      localStorage.setItem('is_verified', 'true'); // Set verification status in localStorage
      setIsAlreadyVerified(true); // Update state to show verified screen immediately
      // No need to setCurrentStep(6) as isAlreadyVerified will control the display

    } catch (error) {
      console.error("Catch Block - API Submission Error Object:", error);
      setSubmissionError(error.message || "Failed to submit verification. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalStepsForProgress = 5; // Total steps in the KYC flow itself
  const progress = currentStep > 1 && currentStep <= totalStepsForProgress + 1 ? ((currentStep - 1) / totalStepsForProgress) * 100 : 0;

  // Main return for the component
  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-8 px-4 font-sans">
      {/* ProfileNavBar is always displayed at the top */}
      <div className="w-full max-w-4xl mb-6">
        <ProfileNavBar />
      </div>

      {/* Conditional rendering based on verification status */}
      {isAlreadyVerified ? (
        // "Identity Verified" screen
        <div className="w-full max-w-md flex flex-col items-center justify-center text-center p-6 sm:p-8"> {/* Centering content */}
            <VerifiedIllustration />
            <h1 className="text-2xl sm:text-3xl font-semibold text-black mt-4">Identity verified</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-3 max-w-xs mx-auto">
              You've completed your identity verification. Get started on your crypto journey now!
            </p>
            {/* Optional: Add a button to navigate away, e.g., to dashboard 
            <button 
              onClick={() => { // Replace with your navigation logic (e.g., using react-router-dom)
                  // Example: history.push('/dashboard'); 
                  console.log("Navigate to dashboard or home page");
              }}
              className="mt-8 px-8 py-3 bg-black text-white font-semibold rounded-lg text-sm shadow-md hover:bg-gray-800 transition-colors duration-150"
            >
              Explore Now
            </button>
            */}
        </div>
      ) : (
        // KYC Verification Flow
        <div className="w-full max-w-md"> 
          {currentStep > 1 && currentStep < 6 && ( // Header for steps 2-5
              <div className="mb-5 text-center">
               <LockKeyhole size={28} className="text-black mx-auto mb-2" />
               <h1 className="text-2xl font-semibold text-black">Identity Verification</h1>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3 mb-1">
                  <div
                  className="bg-black h-1.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                  ></div>
              </div>
              <p className="text-xs text-gray-500">Step {currentStep-1} of {totalStepsForProgress}</p>
             </div>
          )}

          {/* Main content area for KYC steps */}
          <div className={`w-full bg-white rounded-xl 
               ${currentStep === 1 || currentStep === 6 ? 'flex flex-col items-center' : ''}
               ${(currentStep >= 1 && currentStep <= 5) ? 'p-6 sm:p-8' : ''} {/* Consistent padding for active KYC steps */}
               ${currentStep === 6 ? 'py-8' : ''} {/* Specific padding if step 6 is reached (e.g. error before verified) */}
               `}>
            {renderStepContent()} {/* Renders content for the current KYC step */}
            {currentStep > 1 && currentStep < 6 && ( // Navigation for steps 2-5
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={handlePrevStep}
                  disabled={isLoading || !currentUserId}
                  className="px-5 py-2.5 text-sm font-medium text-black border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-150 flex items-center disabled:opacity-70"
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

          {/* Footer information - only show during KYC flow */}
          {currentStep < 6 && (
            <div className="text-xs text-gray-500 mt-6 text-center max-w-xs mx-auto">
              <Info size={14} className="inline mr-1 mb-0.5 text-gray-400" />
              Your information is encrypted and stored securely. It will only be used for identity verification purposes.
              <a href="#" className="ml-1 text-black hover:underline font-medium">Learn more</a>
            </div>
          )}
        </div>
      )}
    </div>
  );


  // Renders content based on the current KYC step (only if not already verified)
  function renderStepContent() {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="mb-6 flex flex-col items-center text-center">
              <InitialVerifyIllustration />
              <h1 className="mt-5 text-2xl font-semibold text-black">Verify Your Identity</h1>
              <p className="mt-2 text-sm text-gray-600 max-w-sm">
                To comply with regulations and ensure the security of your account, please complete the identity verification process.
              </p>
            </div>
            <div className="w-full bg-gray-100 p-5 rounded-xl mb-6">
              <div className="flex items-start">
                <ShieldCheck size={24} className="text-black mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-black">Individual Verification</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Suitable for personal use. You'll need a valid ID and a selfie. The process typically takes a few minutes.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleNextStep}
              disabled={!currentUserId && !submissionError} // Disable if no user ID and no other submission error displayed
              className="w-full bg-black text-white font-semibold rounded-lg py-3 text-sm shadow-md hover:bg-gray-800 transition duration-150 flex items-center justify-center disabled:opacity-50"
            >
              Start Verification <ChevronRight size={18} className="ml-1" />
            </button>
            {/* Show error if user_id is missing OR if there's a submissionError */}
            {(submissionError || (!currentUserId && currentStep === 1)) && (
                <p className="mt-3 text-sm text-red-600 text-center">
                    {submissionError || "User ID not found. Please log in again."}
                </p>
            )}
          </>
        );

      case 2: // Country Selection
        return (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-1 text-black">Confirm Your Country</h2>
            <p className="text-sm text-gray-500 mb-5">Select your country/region of residence.</p>
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full p-3.5 pr-10 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-black focus:border-black outline-none appearance-none text-sm"
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
            <div className="mt-4 text-xs text-gray-500">
              <p className="font-medium text-gray-700">This helps us provide you with the right services. You'll need to provide:</p>
              <ul className="list-disc list-inside pl-1 mt-1 space-y-0.5">
                <li>ID and Selfie Verification</li>
              </ul>
            </div>
          </div>
        );

      case 3: // ID Type Selection
        return (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-1 text-black">Select an ID Type</h2>
            <p className="text-sm text-gray-500 mb-5">Choose the document you'll use for verification.</p>
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
                      ? "bg-gray-100 border-black ring-2 ring-black"
                      : "border-gray-300 hover:border-black hover:bg-gray-50 bg-white"
                    }`}
                >
                  <div className="flex items-center">
                    {type.icon}
                    <span className="font-medium text-sm text-black">{type.name}</span>
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
            <h2 className="text-xl font-semibold mb-1 text-black">Upload ID Document</h2>
            <p className="text-sm text-gray-500 mb-5">
              Document: <span className="font-semibold text-black">{selectedIdInfo?.name}</span>.
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
                      className="max-w-full h-auto max-h-48 inline-block rounded border border-gray-300"
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
                        className="max-w-full h-auto max-h-48 inline-block rounded border border-gray-300"
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
            <h2 className="text-xl font-semibold mb-1 text-black">Take a Selfie</h2>
            <p className="text-sm text-gray-500 mb-5">
              Position your face in the frame. Ensure good lighting and no accessories like glasses or hats.
            </p>
            <div className="w-full aspect-square max-w-[280px] mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-5 relative overflow-hidden">
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

      // Step 6 is effectively the "Thank you / Pending" screen.
      // If isAlreadyVerified becomes true, this step won't be shown due to the top-level conditional rendering.
      // This step would only show if some other logic sets currentStep to 6 AND isAlreadyVerified is false.
      case 6: 
        return (
          <div className="w-full text-center py-8">
            <CheckCircle2 size={56} className="mx-auto mb-4 text-green-500" strokeWidth={1.5}/>
            <h2 className="text-2xl font-semibold mb-2 text-black">Verification Submitted</h2>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Thank you! Your information has been submitted for review. We'll notify you via email once the verification process is complete.
            </p>
            <button
              onClick={() => { /* Consider navigation logic, e.g., to a dashboard */
                console.log("Done button clicked on Step 6");
              }}
              className="px-8 py-2.5 bg-black text-white font-semibold rounded-lg text-sm shadow-md hover:bg-gray-800 transition"
            >
              Done
            </button>
          </div>
        );
      default:
        return <p className="text-gray-700">An unexpected error occurred. Please try again.</p>;
    }
  } // End of renderStepContent function

  // The isNextDisabled function is part of the main VerifyPage component scope
  function isNextDisabled() {
    if (isLoading) return true;
    if (!currentUserId) return true;
    if (currentStep === 2 && !selectedCountry) return true;
    if (currentStep === 4 && (!idFront || (selectedIdInfo?.needsBack && !idBack))) return true;
    if (currentStep === 5 && !selfie) return true;
    return false;
  };

}; // End of VerifyPage component

export default VerifyPage;

// To use the custom animation 'spin-slow', you might need to add it to your tailwind.config.js:
// module.exports = {
//   theme: {
//     extend: {
//       animation: {
//         'spin-slow': 'spin 3s linear infinite',
//       },
//     },
//   },
//   plugins: [],
// }
