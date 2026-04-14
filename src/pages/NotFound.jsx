import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-[#2EBD85] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-3">
          Page Not Found
        </h2>
        <p className="text-[#848E9C] text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-2.5 bg-[#2EBD85] hover:bg-[#259A6C] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2.5 bg-[#1E1E1E] hover:bg-[#2A2A2A] text-white text-sm font-medium rounded-lg border border-[#2A2A2A] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
