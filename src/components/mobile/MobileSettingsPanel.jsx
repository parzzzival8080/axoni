import React, { useState } from "react";
import { Moon, Sun, Globe } from "lucide-react";
import { useDarkMode } from "../../hooks/useDarkMode";
import LanguageModal from "../common/LanguageModal";

const MobileSettingsPanel = () => {
  const { isDark, toggleDarkMode } = useDarkMode();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  return (
    <>
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Settings
        </h3>
        <div className="space-y-2">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-between w-full px-3 py-3 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <div className="flex items-center gap-3">
              {isDark ? (
                <Moon size={20} className="text-[#2EBD85]" />
              ) : (
                <Sun size={20} className="text-gray-600" />
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {isDark ? "Dark Mode" : "Light Mode"}
              </span>
            </div>
            <div
              className={`w-10 h-6 rounded-full relative transition-colors ${
                isDark ? "bg-[#2EBD85]" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                  isDark ? "translate-x-[18px]" : "translate-x-0.5"
                }`}
              />
            </div>
          </button>

          {/* Language / Currency */}
          <button
            onClick={() => setShowLanguageModal(true)}
            className="flex items-center justify-between w-full px-3 py-3 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Language / Currency
              </span>
            </div>
            <span className="text-xs text-gray-400">›</span>
          </button>
        </div>
      </div>

      <LanguageModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />
    </>
  );
};

export default MobileSettingsPanel;
