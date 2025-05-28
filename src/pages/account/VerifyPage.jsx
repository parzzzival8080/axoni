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
  Loader2
} from "lucide-react";
import ProfileNavBar from "../../components/profile/ProfileNavBar";
import { Link } from "react-router-dom";

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
        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FE7400] focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
        style={{ borderColor: '#FE7400' }}
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
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setCurrentUserId(storedUserId);
    } else {
      console.error("User ID not found in localStorage. Verification may fail.");
      setSubmissionError("User ID not found. Please log in again.");
    }
    // Check verification status
    if (localStorage.getItem('is_verified') === 'true') {
      setAlreadyVerified(true);
    }
  }, []);

  const handleNextStep = () => {
    setSubmissionError("");
    setCurrentStep((prev) => prev + 1);
  }
  const handlePrevStep = () => {
    setSubmissionError("");
    setCurrentStep((prev) => prev - 1);
  }

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      if (fileType === "idFront") setIdFront(file);
      else if (fileType === "idBack") setIdBack(file);
      else if (fileType === "selfie") setSelfie(file);
      setSubmissionError("");
    }
  };

  const handleSubmitVerification = async () => {
    console.log("handleSubmitVerification called");
    console.log("Current User ID:", currentUserId);
    console.log("Selected ID Info:", selectedIdInfo);

    if (!currentUserId) {
        setSubmissionError("User ID is missing. Cannot submit verification.");
        console.error("Validation fail: currentUserId is missing");
        return;
    }
    if (!selectedIdInfo || !selectedIdInfo.apiValue) {
        setSubmissionError("ID type information is missing or invalid. Please re-select an ID type.");
        console.error("Validation fail: selectedIdInfo or selectedIdInfo.apiValue is missing. selectedIdInfo:", selectedIdInfo);
        return;
    }
    if (!selfie || !idFront) {
        setSubmissionError("Missing required images for submission (selfie or ID front).");
        console.error("Validation fail: Selfie or ID Front is missing.");
        return;
    }
    // Conditional check for back_captured_image based on selectedIdInfo.needsBack
    if (selectedIdInfo.needsBack && !idBack) {
        // Check if your backend requires back_captured_image conditionally or always.
        // The backend code snippet checks: if not all([captured_selfie, front_captured_image, back_captured_image]):
        // This implies back_captured_image is ALWAYS required by that specific check.
        // If it's truly conditional, the backend check needs adjustment.
        // For now, aligning with the provided backend snippet that implies it's always needed:
        // However, if your selectedIdInfo.needsBack IS ACCURATE, and backend implies always needs it, this is a mismatch.
        // Let's assume for a moment your `selectedIdInfo.needsBack` is the source of truth for whether to *send* it.
        // The backend check `if not all([...])` should be more granular if `back_captured_image` is optional.
        // For now, sticking to your frontend logic for `needsBack`.
        setSubmissionError(`Back side of ${selectedIdInfo.name} is required.`);
        console.error("Validation fail: Back side of ID is missing when required by frontend logic.");
        return;
    }


    const documentTypeApiValue = selectedIdInfo.apiValue;
    console.log("Document Type to be sent in FormData:", documentTypeApiValue);

    if (!documentTypeApiValue || typeof documentTypeApiValue !== 'string' || documentTypeApiValue.trim() === "") {
        console.error("CRITICAL FAILURE: documentTypeApiValue is invalid. Value:", `'${documentTypeApiValue}'`);
        setSubmissionError("A critical error occurred: Invalid document type configured.");
        setIsLoading(false);
        return;
    }

    setIsLoading(true);
    setSubmissionError("");

    const formData = new FormData();
    formData.append('document_type', documentTypeApiValue); // <-- KEY CHANGE: Add document_type to FormData
    formData.append('captured_selfie', selfie, selfie.name);
    formData.append('front_captured_image', idFront, idFront.name);
    
    // Only append back_captured_image if it's needed and present
    if (selectedIdInfo.needsBack && idBack) {
      formData.append('back_captured_image', idBack, idBack.name);
    } else if (selectedIdInfo.needsBack && !idBack) {
        // This case should have been caught by the earlier validation, but as a safeguard:
        console.error("Error: Back ID needed but not provided for FormData.");
        setSubmissionError(`Back side of ${selectedIdInfo.name} is required for submission.`);
        setIsLoading(false);
        return;
    }


    // API URL no longer needs document_type as a query parameter
    const apiUrl = `https://django.bhtokens.com/api/user_account/upload-kyc/user=${currentUserId}`;

    console.log("Final API URL being called (POST):", apiUrl);
    console.log("FormData content (cannot directly log files, but check keys):");
    for (let key of formData.keys()) {
        console.log(`FormData key: ${key}`);
    }


    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
        // Headers like 'Content-Type': 'multipart/form-data' are set automatically by the browser with FormData
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
      
      localStorage.setItem('is_verified', 'true');
      setCurrentStep(6);

    } catch (error) {
      console.error("Catch Block - API Submission Error Object:", error);
      setSubmissionError(error.message || "Failed to submit verification. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalStepsForProgress = 5;
  const progress = currentStep > 1 && currentStep <= totalStepsForProgress + 1 ? ((currentStep - 1) / totalStepsForProgress) * 100 : 0;

  const renderStepContent = () => {
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
              disabled={!currentUserId && currentStep === 1}
              className="w-full font-semibold rounded-lg py-3 text-sm shadow-md transition duration-150 flex items-center justify-center disabled:opacity-50"
              style={{ background: '#FE7400', color: 'white' }}
            >
              Start Verification <ChevronRight size={18} className="ml-1" />
            </button>
            {!currentUserId && currentStep === 1 && submissionError && <p className="mt-3 text-sm text-red-600 text-center">{submissionError}</p>}
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

      case 6: // Submitted / Thank you
        return (
          <div className="w-full text-center py-8">
            <CheckCircle2 size={56} className="mx-auto mb-4 text-green-500" strokeWidth={1.5}/>
            <h2 className="text-2xl font-semibold mb-2 text-black">Verification Submitted</h2>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              Thank you! Your information has been submitted for review. We'll notify you via email once the verification process is complete.
            </p>
            <button
              onClick={() => {
                setCurrentStep(1);
                setSelectedCountry("PH");
                setSelectedIdInfo(null);
                setIdFront(null);
                setIdBack(null);
                setSelfie(null);
                setSubmissionError("");
              }}
              className="px-8 py-2.5 font-semibold rounded-lg text-sm shadow-md transition"
              style={{ background: '#FE7400', color: 'white' }}
            >
              Done
            </button>
          </div>
        );
      default:
        return <p className="text-gray-700">An unexpected error occurred. Please try again.</p>;
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

  if (alreadyVerified) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center py-8 px-4 font-sans">
        <div className="w-full max-w-4xl mb-6">
          <ProfileNavBar />
        </div>
        <div className="w-full max-w-md flex flex-col items-center justify-center bg-white rounded-xl p-8 mt-12 shadow">
          <CheckCircle2 size={72} className="text-green-500 mb-4" strokeWidth={1.5} />
          <h2 className="text-2xl font-bold mb-2 text-black">You are already verified!</h2>
          <p className="text-gray-600 mb-6 text-center">Thank you for verifying your identity. Your account is fully verified and you have access to all features.</p>
          <Link to="/account/profile" className="px-6 py-2 rounded-lg bg-[#FE7400] text-white font-semibold text-sm hover:bg-orange-600 transition">Go to Profile</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-8 px-4 font-sans">
      <div className="w-full max-w-4xl mb-6">
        <ProfileNavBar />
      </div>
      <div className="w-full max-w-md"> {/* This div constrains the overall width */}
        {currentStep > 1 && currentStep < 6 && (
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

        {/* Main content area: styling updated for less "card" feel */}
        <div className={`w-full bg-white rounded-xl 
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
                className="px-5 py-2.5 text-sm font-medium border rounded-lg transition duration-150 flex items-center disabled:opacity-70"
                style={{ borderColor: '#FE7400', color: '#FE7400', background: 'white' }}
              >
                <ChevronLeft size={16} className="mr-1" /> Back
              </button>
              <button
                onClick={currentStep === 5 ? handleSubmitVerification : handleNextStep}
                disabled={isNextDisabled()}
                className="px-5 py-2.5 font-semibold rounded-lg text-sm shadow-md transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
                style={{ background: '#FE7400', color: 'white' }}
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
          <div className="text-xs text-gray-500 mt-6 text-center max-w-xs mx-auto">
            <Info size={14} className="inline mr-1 mb-0.5 text-gray-400" />
            Your information is encrypted and stored securely. It will only be used for identity verification purposes.
            <a href="#" className="ml-1 text-black hover:underline font-medium">Learn more</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;