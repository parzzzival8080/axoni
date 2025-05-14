import React from "react";

// You can replace this SVG with your own illustration asset
const VerifyIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="24" fill="#F4F4F6" />
    <circle cx="60" cy="48" r="20" fill="#E5E7EB" />
    <rect x="34" y="76" width="52" height="16" rx="8" fill="#E5E7EB" />
    <rect x="50" y="98" width="20" height="6" rx="3" fill="#E5E7EB" />
  </svg>
);

const VerifyPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center pt-16 px-4">
      <div className="w-full max-w-2xl flex flex-col items-center">
        <div className="mb-8 flex flex-col items-center">
          <VerifyIllustration />
          <h1 className="mt-8 text-3xl md:text-4xl font-bold text-black dark:text-white text-center">Get verified</h1>
          <p className="mt-4 text-base md:text-lg text-gray-500 dark:text-gray-300 text-center max-w-md">
            Help us protect your account by verifying your identity. This keeps you up-to-date with local laws and unlocks access to everything we have to offer.
          </p>
        </div>
        <div className="w-full flex flex-col items-center bg-gray-50 dark:bg-neutral-900 rounded-xl p-6 md:p-10 mb-8 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-neutral-800 mr-4">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 8-4 8-4s8 0 8 4" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-black dark:text-white">Individual verification</div>
              <div className="text-gray-500 dark:text-gray-400 text-sm">
                For users who want to trade, send, receive, and manage crypto for themselves
              </div>
            </div>
          </div>
          <button className="w-full mt-6 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full py-3 text-lg shadow transition hover:opacity-90">
            Verify identity
          </button>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 mb-8 flex items-center">
          <svg className="mr-2" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><circle cx="12" cy="8" r="1" /></svg>
          Your information is only used for identity verification.
        </div>
        <a href="#" className="text-xs text-black dark:text-white underline hover:text-primary transition">How do I verify an individual account?</a>
      </div>
    </div>
  );
};

export default VerifyPage;
