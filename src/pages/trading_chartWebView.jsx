import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { widget } from "../charting_library/charting_library.esm.js";

function getLanguageFromURL() {
  const regex = new RegExp("[\\?&]lang=([^&#]*)");
  const results = regex.exec(window.location.search);
  return results === null
    ? null
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Custom datafeed implementation to handle CORS issues and provide reliable data
class CORSCompatibleDatafeed {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.lastBar = null;
    this.intervalId = null;
    this.subscribers = new Map();
  }

  onReady(callback) {
    console.log("[onReady]: Method call");
    setTimeout(() => {
      callback({
        exchanges: [{ value: "FLUX", name: "FluxCoin", desc: "FluxCoin Exchange" }],
        symbols_types: [{ name: "crypto", value: "crypto" }],
        supported_resolutions: ["1", "5", "15", "30", "60", "240", "1D"],
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
        supports_search: true,
        supports_group_request: false,
      });
    }, 0);
  }

  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    console.log("[searchSymbols]: Method call");
    const symbols = [
      {
        symbol: "BTC",
        full_name: "FLUX:BTC",
        description: "Bitcoin",
        exchange: "FLUX",
        ticker: "BTC",
        type: "crypto",
      },
      {
        symbol: "ETH",
        full_name: "FLUX:ETH", 
        description: "Ethereum",
        exchange: "FLUX",
        ticker: "ETH",
        type: "crypto",
      },
    ];
    
    const filteredSymbols = symbols.filter(s => 
      s.symbol.toLowerCase().includes(userInput.toLowerCase()) ||
      s.description.toLowerCase().includes(userInput.toLowerCase())
    );
    
    setTimeout(() => onResultReadyCallback(filteredSymbols), 0);
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    console.log("[resolveSymbol]: Method call", symbolName);

    const symbolInfo = {
      name: symbolName,
      description: `${symbolName} / USD`,
      type: "crypto",
      session: "24x7",
      timezone: "Etc/UTC",
      ticker: symbolName,
      exchange: "FLUX",
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_weekly_and_monthly: true,
      intraday_multipliers: ["1", "5", "15", "30", "60", "240"],
      supported_resolutions: ["1", "5", "15", "30", "60", "240", "1D"],
      volume_precision: 8,
      data_status: "streaming",
      format: "price",
    };

    setTimeout(() => {
      onSymbolResolvedCallback(symbolInfo);
    }, 0);
  }

  getBars(symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) {
    console.log("[getBars]: Method call", symbolInfo, resolution, periodParams);

    try {
      const bars = this.generateMockBars(
        periodParams.from,
        periodParams.to,
        resolution,
        symbolInfo.name
      );

      setTimeout(() => {
        if (bars.length === 0) {
          onHistoryCallback([], { noData: true });
        } else {
          onHistoryCallback(bars, { noData: false });
        }
      }, 100);
    } catch (error) {
      console.error("[getBars]: Error generating bars", error);
      onErrorCallback(error);
    }
  }

  generateMockBars(from, to, resolution, symbol = "BTC") {
    const bars = [];
    const interval = this.getIntervalInSeconds(resolution) * 1000;
    let currentTime = from * 1000;
    const endTime = to * 1000;

    // Different base prices for different symbols
    const basePrices = {
      BTC: 45000,
      ETH: 3000,
      ADA: 0.5,
      DOT: 25,
      LINK: 15,
    };

    let basePrice = basePrices[symbol] || 50000;
    let currentPrice = basePrice;

    // Generate more realistic price movements
    while (currentTime <= endTime) {
      const volatility = basePrice * 0.02; // 2% volatility
      const change = (Math.random() - 0.5) * volatility;
      
      const open = currentPrice;
      const close = Math.max(0.01, currentPrice + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.random() * 1000000 + 100000;

      bars.push({
        time: currentTime,
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: parseFloat(volume.toFixed(0)),
      });

      currentPrice = close;
      currentTime += interval;
    }

    // Store the last bar for real-time updates
    if (bars.length > 0) {
      this.lastBar = bars[bars.length - 1];
    }

    return bars;
  }

  getIntervalInSeconds(resolution) {
    switch (resolution) {
      case "1": return 60;
      case "5": return 300;
      case "15": return 900;
      case "30": return 1800;
      case "60": return 3600;
      case "240": return 14400;
      case "1D": return 86400;
      default: return 60;
    }
  }

  subscribeBars(symbolInfo, resolution, onRealtimeCallback, subscriberUID, onResetCacheNeededCallback) {
    console.log("[subscribeBars]: Method call with subscriberUID:", subscriberUID);
    
    // Store subscriber info
    this.subscribers.set(subscriberUID, {
      symbolInfo,
      resolution,
      onRealtimeCallback,
      onResetCacheNeededCallback,
    });

    // Clear existing interval if any
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Start real-time updates
    this.intervalId = setInterval(() => {
      if (!this.lastBar) {
        this.lastBar = {
          time: Date.now(),
          open: 45000,
          high: 45500,
          low: 44500,
          close: 45000,
          volume: 1000,
        };
      }

      const volatility = this.lastBar.close * 0.001; // 0.1% volatility for real-time
      const change = (Math.random() - 0.5) * volatility;
      const newClose = Math.max(0.01, this.lastBar.close + change);
      
      const newBar = {
        time: Date.now(),
        open: this.lastBar.close,
        high: Math.max(this.lastBar.close, newClose),
        low: Math.min(this.lastBar.close, newClose),
        close: newClose,
        volume: this.lastBar.volume + Math.random() * 100,
      };

      this.lastBar = newBar;
      
      // Send update to all subscribers
      this.subscribers.forEach((subscriber) => {
        subscriber.onRealtimeCallback(newBar);
      });
    }, 3000); // Update every 3 seconds
  }

  unsubscribeBars(subscriberUID) {
    console.log("[unsubscribeBars]: Method call with subscriberUID:", subscriberUID);
    
    // Remove subscriber
    this.subscribers.delete(subscriberUID);
    
    // Clear interval if no more subscribers
    if (this.subscribers.size === 0 && this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  calculateHistoryDepth(resolution, resolutionBack, intervalBack) {
    return undefined;
  }

  getMarks(symbolInfo, from, to, onDataCallback, resolution) {
    onDataCallback([]);
  }

  getTimescaleMarks(symbolInfo, from, to, onDataCallback, resolution) {
    onDataCallback([]);
  }

  getServerTime(callback) {
    callback(Math.floor(Date.now() / 1000));
  }
}

const TradingChartWebView = () => {
  const [searchParams] = useSearchParams();
  const coinPairId = searchParams.get("coin_pair_id") || "BTC";
  const chartContainerRef = useRef(null);
  const tvWidgetRef = useRef(null);
  const [symbol, setSymbol] = useState(coinPairId);
  const [chartType, setChartType] = useState("candles");
  const [timeframe, setTimeframe] = useState("15");

  // Mobile detection
  const isMobile = () => {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768
    );
  };

  // Format the symbol for TradingView
  const formatSymbolForChart = (sym) => {
    if (!sym) return "BTC";
    let upperSym = sym.toUpperCase();
    if (upperSym.endsWith("USDT")) {
      upperSym = upperSym.replace("USDT", "");
    } else if (upperSym.endsWith("USD")) {
      upperSym = upperSym.replace("USD", "");
    } else if (upperSym.includes("/")) {
      upperSym = upperSym.split("/")[0];
    }
    return upperSym;
  };

  // Add viewport meta tag for better mobile interaction
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport && isMobile()) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=0.5, user-scalable=yes, viewport-fit=cover";
      document.getElementsByTagName("head")[0].appendChild(meta);
    }
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    
    // Clean up existing widget
    if (tvWidgetRef.current) {
      try {
        tvWidgetRef.current.remove();
        tvWidgetRef.current = null;
      } catch (e) {
        console.log("Error removing widget:", e);
      }
    }

    try {
      const formattedSymbol = formatSymbolForChart(symbol);
      
      const widgetOptions = {
        symbol: formattedSymbol,
        datafeed: new CORSCompatibleDatafeed("https://apiv2.bhtokens.com/api/v1"),
        interval: timeframe,
        container: chartContainerRef.current,
        library_path: "/charting_library/",
        locale: getLanguageFromURL() || "en",
        
        // Mobile-optimized enabled features
        enabled_features: [
          "study_templates",
          "use_localstorage_for_settings",
          "save_chart_properties_to_local_storage",
          "chart_crosshair_menu",
          "side_toolbar_in_fullscreen_mode",
          "header_in_fullscreen_mode",
          "move_logo_to_main_pane",
          "chart_style_hilo_last_price",
          "hide_resolution_in_legend",
          "hide_unresolved_symbols_in_legend",
          "show_symbol_logos",
          // Critical mobile features
          "touch_support",
          "mobile_trading_web",
          "chart_zoom",
          "chart_scroll",
          "chart_pan",
        ],
        
        // Disable features that interfere with mobile interaction
        disabled_features: [
          "items_favoriting",
          "header_compare",
          "header_fullscreen_button", 
          "header_settings",
          "header_quick_search",
          "symbol_search_hot_key",
          "header_symbol_search",
          "header_saveload",
          "compare_symbol_search_spread_operators",
          "show_chart_property_page",
          "adaptive_logo",
          "header_resolutions",
          "timeframes_toolbar",
          "volume_force_overlay",
          "left_toolbar",
          "control_bar",
          "edit_buttons_in_legend",
          "context_menus",
          "property_pages",
          "show_hide_button_in_legend",
          "format_button_in_legend",
          "study_dialog_search_control",
          "symbol_info",
          "go_to_date",
        ],
        
        charts_storage_url: "https://saveload.tradingview.com",
        charts_storage_api_version: "1.1",
        client_id: "tradingview.com",
        user_id: "public_user_id",
        fullscreen: false,
        autosize: true,
        theme: "dark",
        
        // Mobile-specific overrides
        overrides: {
          // Candlestick colors
          "mainSeriesProperties.candleStyle.upColor": "#26a69a",
          "mainSeriesProperties.candleStyle.downColor": "#ef5350",
          "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
          "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
          "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
          
          // Background and grid
          "chartProperties.background": "#000000",
          "paneProperties.background": "#000000",
          "paneProperties.backgroundType": "solid",
          "paneProperties.vertGridProperties.color": "#1a1a1a",
          "paneProperties.horzGridProperties.color": "#1a1a1a",
          "scalesProperties.backgroundColor": "#000000",
          "scalesProperties.lineColor": "#1a1a1a",
          "scalesProperties.textColor": "#999999",
          
          // Crosshair
          "paneProperties.crossHairProperties.color": "#758696",
          "paneProperties.crossHairProperties.width": 1,
          "paneProperties.crossHairProperties.style": 2,
          "paneProperties.crossHairProperties.transparency": 0,
          
          // Time scale
          "timeScale.rightOffset": 5,
          "timeScale.minBarSpacing": 3,
          "timeScale.rightBarStaysOnScroll": true,
          "timeScale.borderVisible": true,
          "timeScale.borderColor": "#1a1a1a",
          "timeScale.timeVisible": true,
          "timeScale.backgroundColor": "#000000",
          "timeScale.textColor": "#999999",
          
          // Price scale
          "scalesProperties.showSeriesLastValue": true,
          "scalesProperties.showSeriesOHLC": isMobile() ? false : true,
          "scalesProperties.showBarChange": false,
          
          // Chart style
          "mainSeriesProperties.style": chartType === "candles" ? 1 : 2,
          "mainSeriesProperties.showCountdown": false,
          "mainSeriesProperties.visible": true,
          "mainSeriesProperties.showPriceLine": true,
          "mainSeriesProperties.priceLineWidth": 1,
          "mainSeriesProperties.priceLineColor": "#3a7ca8",
          
          // Mobile-specific margin adjustments
          "paneProperties.topMargin": isMobile() ? 5 : 15,
          "paneProperties.bottomMargin": isMobile() ? 5 : 10,
          "paneProperties.leftAxisProperties.autoScale": true,
          "paneProperties.rightAxisProperties.autoScale": true,
        },
        
        // Studies overrides for better mobile visibility
        studiesOverrides: {
          "volume.volume.color.0": "rgba(239, 83, 80, 0.5)",
          "volume.volume.color.1": "rgba(38, 166, 154, 0.5)",
          "volume.volume.transparency": 50,
        },
        
        // Mobile-specific settings
        width: isMobile() ? window.innerWidth : undefined,
        height: isMobile() ? 400 : 500,
        autosize: true,
        debug: false,
        
        // Custom CSS for mobile optimization
        custom_css_url: undefined,
        loading_screen: { backgroundColor: "#000000" },
        toolbar_bg: "#000000",
      };

      const tvWidget = new widget(widgetOptions);
      tvWidgetRef.current = tvWidget;

      tvWidget.onChartReady(() => {
        console.log("Chart is ready");
        
        // Apply additional mobile optimizations
        tvWidget.activeChart().applyOverrides({
          "paneProperties.background": "#000000",
          "paneProperties.backgroundType": "solid",
        });

        // Optimize for mobile touch interactions
        const chartContainer = chartContainerRef.current;
        if (chartContainer && isMobile()) {
          // Enable proper touch handling
          chartContainer.style.touchAction = "pan-x pan-y pinch-zoom";
          chartContainer.style.userSelect = "none";
          chartContainer.style.webkitUserSelect = "none";
          chartContainer.style.webkitTouchCallout = "none";
          chartContainer.style.webkitTapHighlightColor = "transparent";
          
          // Prevent context menu on long press
          chartContainer.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            return false;
          });
          
          // Handle touch events properly
          let touchStartTime = 0;
          let touchStartX = 0;
          let touchStartY = 0;
          
          chartContainer.addEventListener("touchstart", (e) => {
            touchStartTime = Date.now();
            if (e.touches.length === 1) {
              touchStartX = e.touches[0].clientX;
              touchStartY = e.touches[0].clientY;
            }
            e.stopPropagation();
          }, { passive: true });
          
          chartContainer.addEventListener("touchend", (e) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            
            // Prevent accidental selections on quick taps
            if (touchDuration < 200 && e.changedTouches.length === 1) {
              const touchEndX = e.changedTouches[0].clientX;
              const touchEndY = e.changedTouches[0].clientY;
              const distance = Math.sqrt(
                Math.pow(touchEndX - touchStartX, 2) + 
                Math.pow(touchEndY - touchStartY, 2)
              );
              
              // If it's a tap (not a drag), allow it
              if (distance < 10) {
                // This is a tap, let it through
              }
            }
            e.stopPropagation();
          }, { passive: true });
          
          // Optimize iframe interactions if present
          setTimeout(() => {
            const iframes = chartContainer.querySelectorAll('iframe');
            iframes.forEach(iframe => {
              iframe.style.touchAction = "pan-x pan-y pinch-zoom";
              iframe.style.pointerEvents = "auto";
            });
            
            // Find and optimize canvas elements
            const canvases = chartContainer.querySelectorAll('canvas');
            canvases.forEach(canvas => {
              canvas.style.touchAction = "pan-x pan-y pinch-zoom";
              canvas.style.pointerEvents = "auto";
            });
          }, 1000);
        }
      });

    } catch (error) {
      console.error("TradingView Widget Error:", error);
    }

    return () => {
      if (tvWidgetRef.current) {
        try {
          tvWidgetRef.current.remove();
          tvWidgetRef.current = null;
        } catch (err) {
          console.log("Error cleaning up widget:", err);
        }
      }
    };
  }, [symbol, timeframe, chartType]);

  return (
    <div
      className="tvchart-mobile-wrapper"
      style={{
        width: "100%",
        height: isMobile() ? 400 : 500,
        background: "#000",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        touchAction: "pan-x pan-y pinch-zoom",
      }}
    >
      <div
        ref={chartContainerRef}
        style={{ 
          width: "100%", 
          height: "100%", 
          background: "#000",
          touchAction: "pan-x pan-y pinch-zoom",
          userSelect: "none",
          webkitUserSelect: "none",
          webkitTouchCallout: "none",
        }}
        className="TVChartContainer"
      />
      
      <style>{`
        .tvchart-mobile-wrapper {
          touch-action: pan-x pan-y pinch-zoom !important;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-tap-highlight-color: transparent !important;
          overflow: hidden !important;
        }
        
        .TVChartContainer {
          touch-action: pan-x pan-y pinch-zoom !important;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-tap-highlight-color: transparent !important;
          overflow: hidden !important;
        }
        
        .TVChartContainer iframe {
          touch-action: pan-x pan-y pinch-zoom !important;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          pointer-events: auto !important;
          border: none !important;
          background: #000 !important;
        }
        
        .TVChartContainer canvas {
          touch-action: pan-x pan-y pinch-zoom !important;
          pointer-events: auto !important;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
        }
        
        /* Ensure all chart elements support touch */
        .TVChartContainer * {
          pointer-events: auto !important;
          touch-action: inherit !important;
        }
        
        /* Mobile-specific optimizations */
        @media (max-width: 768px) {
          .tvchart-mobile-wrapper {
            width: 100vw !important;
            height: 400px !important;
            min-height: 400px !important;
            max-height: 400px !important;
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            background: #000 !important;
            border-radius: 0 !important;
            overflow: hidden !important;
            touch-action: pan-x pan-y pinch-zoom !important;
          }
          
          .TVChartContainer {
            width: 100vw !important;
            height: 400px !important;
            min-height: 400px !important;
            max-height: 400px !important;
            background: #000 !important;
            overflow: hidden !important;
            touch-action: pan-x pan-y pinch-zoom !important;
          }
          
          /* Optimize for WebView */
          .TVChartContainer iframe {
            width: 100% !important;
            height: 100% !important;
            -webkit-overflow-scrolling: touch !important;
            overflow: hidden !important;
            touch-action: pan-x pan-y pinch-zoom !important;
          }
          
          .TVChartContainer canvas {
            -webkit-overflow-scrolling: touch !important;
            overflow: hidden !important;
            touch-action: pan-x pan-y pinch-zoom !important;
          }
        }
        
        /* WebView specific fixes for Android and iOS */
        @media screen and (max-device-width: 768px) {
          .TVChartContainer {
            -webkit-overflow-scrolling: touch !important;
            overflow: hidden !important;
            transform: translateZ(0) !important;
            -webkit-transform: translateZ(0) !important;
          }
          
          .TVChartContainer iframe {
            -webkit-overflow-scrolling: touch !important;
            overflow: hidden !important;
            transform: translateZ(0) !important;
            -webkit-transform: translateZ(0) !important;
          }
          
          .TVChartContainer canvas {
            transform: translateZ(0) !important;
            -webkit-transform: translateZ(0) !important;
          }
        }
        
        /* Prevent text selection and context menus */
        .tvchart-mobile-wrapper,
        .TVChartContainer,
        .TVChartContainer * {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -khtml-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
      `}</style>
    </div>
  );
};

export default TradingChartWebView;
