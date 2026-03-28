import React, { useRef } from "react";
import { UploadCloud, Loader2 } from "lucide-react";
import { SUPPORTED_FILE_TYPES } from "../../pages/account/verifyConstants";

const FileUploadButton = ({
  label,
  onFileChange,
  fileName,
  icon,
  subtext,
  disabled,
  isCameraAvailable,
  onCameraClick,
  isCameraLoading,
}) => {
  const inputRef = useRef(null);

  const handleClick = async () => {
    if (disabled) return;

    if (isCameraAvailable && onCameraClick) {
      try {
        await onCameraClick();
      } catch (error) {
        console.log("Camera failed, falling back to file upload:", error);
        if (inputRef.current) {
          inputRef.current.click();
        }
      }
    } else {
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
        className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#2A2A2A] rounded-lg hover:border-[#2EBD85] transition-colors bg-[#1E1E1E] text-[#848E9C] focus:outline-none focus:ring-2 focus:ring-[#2EBD85] focus:ring-offset-2 focus:ring-offset-[#121212] disabled:opacity-70 disabled:cursor-not-allowed"
        translate="no"
      >
        {isCameraLoading ? (
          <Loader2 size={32} className="mb-2 text-[#5E6673] animate-spin" />
        ) : (
          icon || <UploadCloud size={32} className="mb-2 text-[#5E6673]" />
        )}
        <span className="text-sm font-medium text-white">
          {isCameraLoading ? "Starting Camera..." : label}
        </span>
        {fileName && (
          <span className="text-xs text-[#2EBD85] mt-1 break-all">
            {fileName}
          </span>
        )}
        {!fileName && !isCameraLoading && subtext && (
          <span className="text-xs text-[#5E6673] mt-1">{subtext}</span>
        )}
        {!fileName && !isCameraLoading && isCameraAvailable && (
          <span className="text-xs text-[#F5A623] mt-1">
            Camera will open first, or choose file
          </span>
        )}
      </button>
      <input
        type="file"
        ref={inputRef}
        onChange={onFileChange}
        className="hidden"
        accept={SUPPORTED_FILE_TYPES.join(",")}
        disabled={disabled}
        translate="no"
      />
    </div>
  );
};

export default FileUploadButton;
