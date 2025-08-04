import React, { useEffect, useRef, useState } from "react";
import OrderHistory from "./OrderHistory";
import "./index.css";
import "./chart_override.css";
import { widget } from "../../charting_library/charting_library.esm.js";

function getLanguageFromURL() {
  const regex = new RegExp("[\\?&]lang=([^&#]*)");
  const results = regex.exec(window.location.search);
  return results === null
    ? null
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

const TradingChart = ({ selectedSymbol = "BTC" }) => {
  const chartContainerRef = useRef(null);
  const tvWidgetRef = useRef(null);
  const [activeTab, setActiveTab] = useState("order-history");
  const [symbol, setSymbol] = useState(selectedSymbol || "BTC");
  const [shouldReinitialize, setShouldReinitialize] = useState(false);
  const [chartType, setChartType] = useState("candles");
  const [timeframe, setTimeframe] = useState(() => {
    return sessionStorage.getItem('slTimeFrame') || '1';
  });
  const timeframes = [
     { value: '1', label: '1min' },
     { value: '5', label: '5min' },
     { value: '60', label: '1hr' },
     { value: '1D', label: '1D' }
   ];

  // Format the symbol for TradingView (use just the base symbol without USDT suffix)
  const formatSymbolForChart = (sym) => {
    console.log("Formatting symbol:", sym);
    if (!sym) return "BTC";

    // Convert to uppercase and remove any trading pair suffixes
    let upperSym = sym.toUpperCase();

    // Remove common trading pair suffixes if present
    if (upperSym.endsWith("USDT")) {
      upperSym = upperSym.replace("USDT", "");
    } else if (upperSym.endsWith("USD")) {
      upperSym = upperSym.replace("USD", "");
    } else if (upperSym.includes("/")) {
      upperSym = upperSym.split("/")[0];
    }

    return upperSym;
  };

  // Default props with dynamic symbol - ensure symbol is never empty
  const getChartConfig = (currentSymbol) => {
    const formattedSymbol = formatSymbolForChart(currentSymbol);
    console.log("Current Symbol in getChartConfig:", currentSymbol);
    console.log("Formatted Symbol for Chart:", formattedSymbol);
    const interval = sessionStorage.getItem("slTimeFrame");
    return {
      symbol: formattedSymbol,
      interval: interval,
      datafeedUrl: "https://api.kinecoin.co/api/v1",
      libraryPath: "/charting_library/",
      chartsStorageUrl: "https://saveload.tradingview.com",
      chartsStorageApiVersion: "1.1",
      clientId: "tradingview.com",
      userId: "public_user_id",
      fullscreen: false,
      studiesOverrides: {
        "volume.volume.color.0": "rgba(239, 83, 80, 0.5)",
        "volume.volume.color.1": "rgba(38, 166, 154, 0.5)",
        "volume.volume.transparency": 50,
        "volume.volume ma.color": "#9B7DFF",
        "volume.volume ma.transparency": 30,
        "volume.volume ma.linewidth": 2,
        "volume.show ma": true,
        "volume.options.showStudyArguments": false,
        "bollinger bands.median.color": "#9B7DFF",
        "bollinger bands.upper.color": "rgba(155, 125, 255, 0.5)",
        "bollinger bands.lower.color": "rgba(155, 125, 255, 0.5)",
        "bollinger bands.median.linewidth": 2,
        "bollinger bands.upper.linewidth": 2,
        "bollinger bands.lower.linewidth": 2,
        "macd.histogram.color": "#9B7DFF",
      },
      backgroundColor: "#000000",
    };
  };

  // Handle timeframe changes with session storage
  const handleTimeframeChange = (newTimeframe) => {
    console.log('=== TIMEFRAME CHANGE DEBUG ===');
    console.log('Previous timeframe state:', timeframe);
    console.log('New timeframe selected:', newTimeframe);
    console.log('Previous slTimeFrame in sessionStorage:', sessionStorage.getItem('slTimeFrame'));
    
    // Update both sessionStorage and component state
    setTimeframe(newTimeframe);
    sessionStorage.setItem('slTimeFrame', newTimeframe);
    
    console.log('Updated slTimeFrame in sessionStorage:', sessionStorage.getItem('slTimeFrame'));
    console.log('Component timeframe state updated to:', newTimeframe);
    
    // Force chart reinitialization for timeframe change
    if (tvWidgetRef.current) {
      console.log('Removing existing chart for timeframe change');
      tvWidgetRef.current.remove();
      tvWidgetRef.current = null;
      setShouldReinitialize(true);
    }
    
    console.log('=== END TIMEFRAME DEBUG ===');
  };

  // Effect to handle symbol changes
  useEffect(() => {
    console.log("Symbol Effect - selectedSymbol:", selectedSymbol);
    console.log("Symbol Effect - current symbol state:", symbol);

    if (selectedSymbol && selectedSymbol !== symbol) {
      console.log("Symbol change detected:", selectedSymbol);
      setSymbol(selectedSymbol);
      
      // Force chart reinitialization
      if (tvWidgetRef.current) {
        console.log("Removing existing chart for reinitialization");
        tvWidgetRef.current.remove();
        tvWidgetRef.current = null;
        setShouldReinitialize(true);
      }
    }
  }, [selectedSymbol]);

  // Effect to initialize or reinitialize chart
  useEffect(() => {
    console.log("Chart Init Effect - using symbol:", symbol);
    console.log("Chart Init Effect - dependencies:", [symbol]);
    if (!chartContainerRef.current) {
      console.log("Chart container ref not available");
      return;
    }

    // Cleanup previous widget if it exists
    if (tvWidgetRef.current) {
      try {
        console.log("Removing previous chart widget");
        tvWidgetRef.current.remove();
        tvWidgetRef.current = null;
      } catch (e) {
        console.error("Error removing previous chart:", e);
      }
    }

    try {
      // Format the symbol for the chart
      const formattedSymbol = formatSymbolForChart(symbol);
      console.log("Initializing chart with formatted symbol:", formattedSymbol);
      console.log("Initializing chart with config:", getChartConfig(symbol));

      // Inject styles to force black background
      const styleElement = document.createElement("style");
      styleElement.textContent = `
      /* Force black background on TradingView chart */
      .chart-container,
      .tv-chart-container,
      .chart-page,
      .chart-markup-table,
      .layout__area--center {
        background-color: #000000 !important;
      }
      
      /* Target specific TradingView elements */
      .chart-container__chartarea--themed-dark,
      .chart-container__chartarea {
        background-color: #000000 !important;
      }
      
      /* Target any element with navy blue background */
      *[style*="background-color: rgb(19, 23, 34)"],
      *[style*="background-color: #131722"],
      *[style*="background-color: rgb(27, 32, 48)"],
      *[style*="background-color: #1b2030"] {
        background-color: #000000 !important;
      }
      
      /* Force black background on specific chart elements */
      .chart-widget,
      .chart-gui-wrapper,
      .chart-container-border {
        background-color: #000000 !important;
      }
    `;
      document.head.appendChild(styleElement);

      // Create widget options
      const widgetOptions = {
        symbol: formattedSymbol,
        // BEWARE: no trailing slash is expected in feed URL
        datafeed: new window.Datafeeds.UDFCompatibleDatafeed(
          getChartConfig(symbol).datafeedUrl
        ),
        interval: getChartConfig(symbol).interval,
        container: chartContainerRef.current,
        library_path: getChartConfig(symbol).libraryPath,

        locale: getLanguageFromURL() || "en",
        disabled_features: [
          "use_localstorage_for_settings",
          "items_favoriting",
          "header_compare",
          "header_fullscreen_button",
          "header_settings",
          "header_quick_search",
          "symbol_search_hot_key",
          "show_hide_button_in_legend",
          "format_button_in_legend",
          "header_symbol_search",
          "header_saveload",
          "compare_symbol_search_spread_operators",
          "delete_button_in_legend",
          "create_volume_indicator_by_default",
          "always_show_legend_values_on_mobile",
          "adaptive_logo",
          "header_resolutions",
          "timeframes_toolbar",
        ],
        enabled_features: [
          "study_templates",
          "chart_style_hilo_last_price",
          // "hide_resolution_in_legend",
          // "hide_unresolved_symbols_in_legend",
          "chart_style_hilo",
          "show_symbol_logos",
          "left_toolbar",
          "show_object_tree",
          "control_bar",
          "legend_widget",
          "main_series_scale_menu",
          "drawing_tools",
          "show_chart_property_page",
          "volume_force_overlay",
        ],
        supported_resolutions: ["1", "5", "60", "240", "1D"],
        charts_storage_url: getChartConfig(symbol).chartsStorageUrl,
        charts_storage_api_version:
          getChartConfig(symbol).chartsStorageApiVersion,
        client_id: getChartConfig(symbol).clientId,
        user_id: getChartConfig(symbol).userId,
        fullscreen: getChartConfig(symbol).fullscreen,
        autosize: true,
        studiesOverrides: getChartConfig(symbol).studiesOverrides,
        theme: "dark",
        custom_css_url: "",
        loading_screen: { backgroundColor: "#000000" },
        toolbar_bg: "#000000",
        overrides: {
          // Candle styling
          "mainSeriesProperties.candleStyle.upColor": "#26a69a",
          "mainSeriesProperties.candleStyle.downColor": "#ef5350",
          "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
          "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
          "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",

          // Scale and grid properties
          "scalesProperties.backgroundColor": "#000000",
          "paneProperties.vertGridProperties.color": "#1a1a1a",
          "paneProperties.horzGridProperties.color": "#1a1a1a",
          "scalesProperties.lineColor": "#1a1a1a",
          "scalesProperties.textColor": "#999999",

          // Additional chart background properties
          "chartProperties.background": "#000000",
          "chartProperties.paneBackgroundColor": "#000000",
          "chartProperties.backgroundColor": "#000000",
          "paneProperties.background": "#000000",
          "paneProperties.backgroundType": "solid",
          "paneProperties.backgroundGradientStartColor": "#000000",
          "paneProperties.backgroundGradientEndColor": "#000000",
          "paneProperties.crossHairProperties.color": "#758696",
          "paneProperties.crossHairProperties.width": 1,
          "paneProperties.crossHairProperties.style": 2,
          "paneProperties.crossHairProperties.transparency": 0,
          "paneProperties.crossHairProperties.borderVisible": false,
          "paneProperties.crossHairProperties.backgroundColor": "#000000",
          "paneProperties.crossHairProperties.backgroundType": "solid",
          "paneProperties.crossHairProperties.backgroundGradientStartColor":
            "#000000",
          "paneProperties.crossHairProperties.backgroundGradientEndColor":
            "#000000",

          // Toolbar and drawing tools
          editorFontsList: "'Trebuchet MS', Verdana, Arial, sans-serif",
          "paneProperties.topMargin": 15,
          "paneProperties.bottomMargin": 10,

          // Chart type and style
          "mainSeriesProperties.style": chartType === "candles" ? 1 : 2,
          "mainSeriesProperties.showCountdown": true,
          "mainSeriesProperties.visible": true,
          "mainSeriesProperties.showPriceLine": true,
          "mainSeriesProperties.priceLineWidth": 1,
          "mainSeriesProperties.priceLineColor": "#3a7ca8",
          "mainSeriesProperties.baseLineColor": "#5d606b",
          "mainSeriesProperties.showPrevClosePriceLine": false,
          "mainSeriesProperties.haStyle.upColor": "#26a69a",
          "mainSeriesProperties.haStyle.downColor": "#ef5350",
          "mainSeriesProperties.haStyle.drawWick": true,
          "mainSeriesProperties.haStyle.drawBorder": true,
          "mainSeriesProperties.haStyle.borderColor": "#378658",
          "mainSeriesProperties.haStyle.borderUpColor": "#26a69a",
          "mainSeriesProperties.haStyle.borderDownColor": "#ef5350",
          "mainSeriesProperties.haStyle.wickColor": "#737375",
          "mainSeriesProperties.haStyle.wickUpColor": "#26a69a",
          "mainSeriesProperties.haStyle.wickDownColor": "#ef5350",

          // Time axis
          "timeScale.rightOffset": 5,
          "timeScale.minBarSpacing": 4,
          "timeScale.rightBarStaysOnScroll": false,
          "timeScale.borderVisible": true,
          "timeScale.borderColor": "#1a1a1a",
          "timeScale.timeVisible": true,
          "timeScale.secondsVisible": true,
          "timeScale.backgroundColor": "#000000",
          "timeScale.textColor": "#999999",
        },
      };

      const tvWidget = new widget(widgetOptions);
      tvWidgetRef.current = tvWidget;

      tvWidget.onChartReady(() => {
        console.log("Chart is ready with symbol:", formattedSymbol);

        // Set chart background to black using the chart's API
        tvWidget.activeChart().applyOverrides({
          "paneProperties.background": "#000000",
          "paneProperties.backgroundType": "solid",
        });

        // Target the main chart background specifically
        const chartElements = document.querySelectorAll(
          ".tv-chart-container, .chart-container, .chart-markup-table, .chart-page"
        );
        chartElements.forEach((el) => {
          el.style.backgroundColor = "#000000";
        });

        // Target the specific chart canvas background - the main chart area
        setTimeout(() => {
          // Use setTimeout to ensure the chart is fully rendered
          // Apply direct style to the main chart area
          const style = document.createElement("style");
          style.textContent = `
						/* Target the main chart area directly */
						.chart-container__chartarea--themed-dark { background-color: #000000 !important; }
						.chart-container__chartarea { background-color: #000000 !important; }
						.layout__area--center { background-color: #000000 !important; }
						.tv-chart-container { background-color: #000000 !important; }
						.chart-markup-table { background-color: #000000 !important; }
						
						/* Target the navy blue background specifically */
						[style*="background-color: rgb(19, 23, 34)"] { background-color: #000000 !important; }
						[style*="background-color: #131722"] { background-color: #000000 !important; }
						[style*="background-color: rgb(27, 32, 48)"] { background-color: #000000 !important; }
						[style*="background-color: #1b2030"] { background-color: #000000 !important; }
						
						/* Target any element with navy blue background */
						*[style*="background-color: rgb(19, 23, 34)"],
						*[style*="background-color: #131722"],
						*[style*="background-color: rgb(27, 32, 48)"],
						*[style*="background-color: #1b2030"] {
							background-color: #000000 !important;
						}
					`;
          document.head.appendChild(style);

          // Find and modify the iframe content
          const iframes = document.querySelectorAll("iframe");
          iframes.forEach((iframe) => {
            try {
              if (iframe.contentDocument) {
                // Create a style element for the iframe
                const iframeStyle = document.createElement("style");
                iframeStyle.textContent = `
									/* Target the navy blue background specifically in iframe */
									body, html, .chart-page, .chart-container, .tv-chart-container, 
									.layout__area--center, .chart-markup-table {
										background-color: #000000 !important;
									}
									
									/* Target any element with navy blue background */
									*[style*="background-color: rgb(19, 23, 34)"],
									*[style*="background-color: #131722"],
									*[style*="background-color: rgb(27, 32, 48)"],
									*[style*="background-color: #1b2030"] {
										background-color: #000000 !important;
									}
								`;
                iframe.contentDocument.head.appendChild(iframeStyle);

                // Directly set background color on elements
                const iframeElements = iframe.contentDocument.querySelectorAll(
                  ".chart-page, .chart-container, .tv-chart-container"
                );
                iframeElements.forEach((el) => {
                  el.style.backgroundColor = "#000000";
                });
              }
            } catch (e) {
              console.error("Error modifying iframe content:", e);
            }
          });
        }, 1000);

        tvWidget.headerReady().then(() => {
          const button = tvWidget.createButton();
          button.setAttribute("title", "Click to check API");
          button.addEventListener("click", () => {
            console.log("API Check button clicked");
            // Example of checking API status
            fetch("https://api.kinecoin.co/api/v1/status")
              .then((response) => response.json())
              .then((data) => {
                console.log("API Status:", data);
                alert(`API Status: ${data.status || "Connected"}`);
              })
              .catch((error) => {
                console.error("API Check Error:", error);
                alert("API Check Failed: " + error.message);
              });
          });

          button.innerHTML = "Check API";
        });
      });
    } catch (error) {
      console.error("Error initializing chart:", error);
    }

    // Return cleanup function
    return () => {
      if (tvWidgetRef.current) {
        try {
          console.log("Removing chart widget on cleanup");
          tvWidgetRef.current.remove();
          tvWidgetRef.current = null;
        } catch (err) {
          console.error("Error removing chart:", err);
        }
      }
    };
    setShouldReinitialize(false);
  }, [symbol, chartType, shouldReinitialize]);

  return (
    <div className="trading-chart trading-chart-container md:relative md:z-auto z-0 overflow-hidden">
      {/* Timeframe Tabs */}
      <div className="timeframe-tabs mb-6">
        <div className="flex space-x-1 bg-black border border-orange-500/20 rounded-lg p-1 w-fit">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => handleTimeframeChange(tf.value)}
              className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 min-w-[60px] ${
                timeframe === tf.value
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-black shadow-lg shadow-orange-500/25 border border-orange-400'
                  : 'bg-transparent text-orange-300 hover:text-orange-200 hover:bg-orange-500/10 border border-transparent'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-content">
        <div
          className="chart-area"
          style={{
            backgroundColor: "#000000",
            maxWidth: "100%",
            border: "none",
          }}
        >
          <div
            ref={chartContainerRef}
            className={"TVChartContainer"}
            style={{
              height: "100%",
              backgroundColor: "#000000",
              border: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TradingChart;
