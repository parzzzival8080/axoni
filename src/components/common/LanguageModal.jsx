import React, { useState, useEffect } from "react";
import { useCurrency } from "../../context/CurrencyContext";
import "./LanguageModal.css";
import "./okx-translate-spinner.css";

const LanguageModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("language");
  const {
    selectedCurrency,
    setSelectedCurrency,
    currencies,
    loading: currencyLoading,
  } = useCurrency();

  useEffect(() => {
    // Inject CSS fixes for ConveyThis flags
    if (!document.getElementById("conveythis-flag-fixes")) {
      const style = document.createElement("style");
      style.id = "conveythis-flag-fixes";
      style.innerHTML = `
        /* Fix ConveyThis flag display issues */
        .conveythis-flag {
          background-color: transparent !important;
          display: inline-block !important;
          width: 24px !important;
          height: 18px !important;
          background-size: cover !important;
          background-repeat: no-repeat !important;
          background-position: center !important;
          border: 1px solid #ddd !important;
          border-radius: 2px !important;
        }

        /* ConveyThis widget styling inside modal */
        #conveythis_widget {
          background: transparent !important;
        }

        #conveythis_widget .conveythis-language-item {
          padding: 8px 12px !important;
          margin: 4px 0 !important;
          border-radius: 6px !important;
          cursor: pointer !important;
          transition: background-color 0.2s ease !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }

        #conveythis_widget .conveythis-language-item:hover {
          background-color: #f5f5f5 !important;
        }

        #conveythis_widget .conveythis-language-text {
          font-size: 14px !important;
          color: #333 !important;
        }

        /* Ensure flag images load properly */
        img[src*="conveythis"] {
          display: inline-block !important;
          max-width: 24px !important;
          max-height: 18px !important;
        }

        /* Fix for black flag rectangles */
        .conveythis-flag-bg,
        [class*="flag-"],
        [class*="country-"] {
          background-color: transparent !important;
          background-image: url('data:image/svg+xml;base64,') !important;
        }

        /* ConveyThis specific flag fixes */
        .ct-language-flag {
          background-color: transparent !important;
          border: 1px solid #e0e0e0 !important;
          border-radius: 2px !important;
        }

        /* Hide widget when modal is closed - using transform instead of display */
        .conveythis-widget-hidden {
          transform: translateX(-10000px) !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
          position: absolute !important;
          z-index: -1 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const widgetElement = document.getElementById("conveythis_widget");
    const modalContent = document.getElementById("language-modal-content");

    if (widgetElement) {
      if (isOpen && activeTab === "language" && modalContent) {
        // Remove hidden class and show the widget
        widgetElement.classList.remove("conveythis-widget-hidden");

        // Get the position of the modal content
        const modalRect = modalContent.getBoundingClientRect();

        // Position the widget over the modal content with some top spacing
        widgetElement.style.position = "fixed";
        widgetElement.style.left = modalRect.left + "px";
        widgetElement.style.top = modalRect.top + 20 + "px";
        widgetElement.style.width = modalRect.width + "px";
        widgetElement.style.height = "auto";
        widgetElement.style.visibility = "visible";
        widgetElement.style.opacity = "1";
        widgetElement.style.zIndex = "10001";
        widgetElement.style.overflow = "visible";
        widgetElement.style.backgroundColor = "transparent";
        widgetElement.style.padding = "10px";
        widgetElement.style.pointerEvents = "auto";
        widgetElement.style.transform = "none";

        // Force refresh ConveyThis
        setTimeout(() => {
          if (
            window.ConveyThis &&
            typeof window.ConveyThis.refresh === "function"
          ) {
            window.ConveyThis.refresh();
          }
        }, 100);
      } else {
        // Hide the widget when modal is closed or not on language tab
        // Use transform instead of display to preserve DOM structure
        widgetElement.classList.add("conveythis-widget-hidden");
        widgetElement.style.transform = "translateX(-10000px)";
        widgetElement.style.visibility = "hidden";
        widgetElement.style.opacity = "0";
        widgetElement.style.position = "absolute";
        widgetElement.style.zIndex = "-1";
        widgetElement.style.pointerEvents = "none";

        // Don't modify child elements - let ConveyThis manage them
      }
    }
  }, [isOpen, activeTab]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      const widgetElement = document.getElementById("conveythis_widget");
      if (widgetElement) {
        widgetElement.classList.add("conveythis-widget-hidden");
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      {/* Stop propagation to prevent closing when clicking inside the modal */}
      <div className="language-modal" onClick={(e) => e.stopPropagation()}>
        <div className="language-modal-header">
          <div className="language-modal-tabs">
            <div
              className={`language-modal-tab ${activeTab === "language" ? "active" : ""}`}
              onClick={() => setActiveTab("language")}
            >
              Language
            </div>
            <div
              className={`language-modal-tab ${activeTab === "currency" ? "active" : ""}`}
              onClick={() => setActiveTab("currency")}
            >
              Currency
            </div>
          </div>
          <button className="language-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {activeTab === "language" && (
          <div
            className="language-modal-content language-grid"
            id="language-modal-content"
            style={{
              minHeight: "120px",
              maxHeight: "250px",
              height: "auto",
              padding: "20px 16px 16px 16px",
              overflow: "auto",
            }}
          >
            {/* ConveyThis widget will be positioned over this area */}
          </div>
        )}

        {activeTab === "currency" && (
          <div
            className="language-modal-content currency-grid"
            style={{
              minHeight: "120px",
              maxHeight: "250px",
              height: "auto",
              overflow: "auto",
            }}
          >
            {currencyLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading exchange rates...</p>
              </div>
            ) : (
              currencies.map((currency) => (
                <div
                  key={currency.code}
                  className={`language-option ${selectedCurrency === currency.code ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedCurrency(currency.code);
                    onClose();
                  }}
                  style={{
                    cursor: "pointer",
                    backgroundColor:
                      selectedCurrency === currency.code
                        ? "#fff5f0"
                        : "#ffffff",
                    color:
                      selectedCurrency === currency.code
                        ? "#f97316"
                        : "#333333",
                    border:
                      selectedCurrency === currency.code
                        ? "1px solid #f97316"
                        : "1px solid #e5e7eb",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCurrency !== currency.code) {
                      e.target.style.backgroundColor = "#fef7f0";
                      e.target.style.borderColor = "#f97316";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCurrency !== currency.code) {
                      e.target.style.backgroundColor = "#ffffff";
                      e.target.style.borderColor = "#e5e7eb";
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "2px",
                    }}
                  >
                    <span className="currency-symbol">{currency.symbol}</span>
                    <span className="currency-code">{currency.code}</span>
                  </div>
                  <span className="currency-name">{currency.name}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Create the ConveyThis widget container outside the component
// This ensures it's always in the DOM for ConveyThis to find
if (
  typeof window !== "undefined" &&
  !document.getElementById("conveythis_widget")
) {
  const widgetDiv = document.createElement("div");
  widgetDiv.id = "conveythis_widget";
  widgetDiv.className = "conveythis-widget-hidden"; // Start hidden
  widgetDiv.style.position = "absolute";
  widgetDiv.style.transform = "translateX(-10000px)";
  widgetDiv.style.visibility = "hidden";
  widgetDiv.style.opacity = "0";
  widgetDiv.style.pointerEvents = "none";
  widgetDiv.style.zIndex = "-1";
  document.body.appendChild(widgetDiv);
}

export default LanguageModal;
