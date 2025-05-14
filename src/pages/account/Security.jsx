import React from "react";
import ProfileNavBar from '../../components/profile/ProfileNavBar';

const Security = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col items-center pt-16 px-4">
      <ProfileNavBar />
      <div className="w-full max-w-2xl flex flex-col items-center mt-8">
        <h1 className="text-3xl md:text-4xl font-bold text-black dark:text-white text-center">Security Settings</h1>
        <p className="mt-4 text-base md:text-lg text-gray-500 dark:text-gray-300 text-center max-w-md">
          Manage your account security settings and preferences.
        </p>
        
        <div className="w-full mt-8 bg-gray-50 dark:bg-neutral-900 rounded-xl p-6 md:p-10 shadow-sm">
          <div className="space-y-6">
            <div className="pb-4 border-b border-gray-200 dark:border-neutral-800">
              <h2 className="text-xl font-semibold text-black dark:text-white">Password</h2>
              <p className="mt-1 text-gray-500 dark:text-gray-400">Change your password regularly to keep your account secure.</p>
              <button className="mt-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full py-2 px-6 text-sm shadow transition hover:opacity-90">
                Change Password
              </button>
            </div>
            
            <div className="pb-4 border-b border-gray-200 dark:border-neutral-800">
              <h2 className="text-xl font-semibold text-black dark:text-white">Two-Factor Authentication</h2>
              <p className="mt-1 text-gray-500 dark:text-gray-400">Add an extra layer of security to your account.</p>
              <button className="mt-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full py-2 px-6 text-sm shadow transition hover:opacity-90">
                Enable 2FA
              </button>
            </div>
            
            <div className="pb-4">
              <h2 className="text-xl font-semibold text-black dark:text-white">Login History</h2>
              <p className="mt-1 text-gray-500 dark:text-gray-400">Review your recent login activity.</p>
              <button className="mt-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-full py-2 px-6 text-sm shadow transition hover:opacity-90">
                View History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;
