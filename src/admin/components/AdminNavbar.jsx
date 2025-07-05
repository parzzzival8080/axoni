import React, { useState } from 'react';

const AdminNavbar = ({ 
  user, 
  onSignOut, 
  activeTab, 
  onTabChange,
  saving,
  hasChanges,
  lastSaved,
  lastAction
}) => {
  const [showConsole, setShowConsole] = useState(false);
  return (
    <header className="bg-black border-b border-gray-800">
      <div className="w-full max-w-none mx-0 px-8 py-4">
        <div className="flex items-center justify-between w-full">
          {/* Left Side - Simple Title */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-white whitespace-nowrap">Admin Panel</h1>
          </div>
          
          {/* Spacer to push right content to the edge */}
          <div className="flex-1"></div>
          
          {/* Right Side - Clean User & Sign Out */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Console Button */}
            <button
              onClick={() => setShowConsole(!showConsole)}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Console</span>
            </button>

            {/* User Email */}
            {user && (
              <span className="hidden md:block text-sm text-gray-400 truncate max-w-xs">
                {user.email}
              </span>
            )}
            
            {/* Simple Sign Out Button */}
            <button
              onClick={onSignOut}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Console Popup */}
      {showConsole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            {/* Console Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <h3 className="text-white font-semibold">Admin Console</h3>
              </div>
              <button
                onClick={() => setShowConsole(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Console Content */}
            <div className="p-4 space-y-4">
              {/* Status Section */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  System Status
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Database Connection:</span>
                    <span className="text-green-400">Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Auto-save:</span>
                    <span className="text-blue-400">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Unsaved Changes:</span>
                    <span className={hasChanges ? "text-orange-400" : "text-green-400"}>
                      {hasChanges ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Saving Progress */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                  Saving Progress
                </h4>
                <div className="space-y-3">
                  {saving ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-blue-400 text-sm">Saving configuration...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 text-sm">Ready to save</span>
                    </div>
                  )}
                  
                  {lastAction && (
                    <div className="text-sm text-gray-300 bg-gray-700 rounded px-3 py-2">
                      <span className="text-gray-400">Last Action:</span> {lastAction}
                    </div>
                  )}
                  
                  {lastSaved && (
                    <div className="text-sm text-gray-300">
                      <span className="text-gray-400">Last Saved:</span> {lastSaved.toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                  Quick Actions
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors">
                    Save Changes
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition-colors">
                    Refresh Data
                  </button>
                </div>
              </div>

              {/* Log Output */}
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="text-white font-medium mb-3 flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                  Recent Activity
                </h4>
                <div className="bg-black rounded p-3 font-mono text-xs text-green-400 max-h-32 overflow-y-auto">
                  <div className="space-y-1">
                    <div>[{new Date().toLocaleTimeString()}] System initialized</div>
                    <div>[{new Date().toLocaleTimeString()}] Configuration loaded</div>
                    {lastAction && (
                      <div>[{new Date().toLocaleTimeString()}] {lastAction}</div>
                    )}
                    <div>[{new Date().toLocaleTimeString()}] Console opened</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminNavbar; 