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

// Custom datafeed implementation to handle CORS issues
class CORSCompatibleDatafeed {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  onReady(callback) {
    console.log("[onReady]: Method call");
    setTimeout(() => {
      callback({
        exchanges: [],
        symbols_types: [],
        supported_resolutions: ["1", "5", "15", "30", "60", "240", "1D"],
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
      });
    }, 0);
  }

  searchSymbols(userInput, exchange, symbolType, onResultReadyCallback) {
    console.log("[searchSymbols]: Method call");
    onResultReadyCallback([]);
  }

  resolveSymbol(symbolName, onSymbolResolvedCallback, onResolveErrorCallback) {
    console.log("[resolveSymbol]: Method call", symbolName);

    const symbolInfo = {
      name: symbolName,
      description: symbolName,
      type: "crypto",
      session: "24x7",
      timezone: "Etc/UTC",
      ticker: symbolName,
      exchange: "KINE",
      minmov: 1,
      pricescale: 100000000,
      has_intraday: true,
      intraday_multipliers: ["1", "5", "15", "30", "60", "240"],
      supported_resolutions: ["1", "5", "15", "30", "60", "240", "1D"],
      volume_precision: 8,
      data_status: "streaming",
    };

    setTimeout(() => {
      onSymbolResolvedCallback(symbolInfo);
    }, 0);
  }

  getBars(
    symbolInfo,
    resolution,
    periodParams,
    onHistoryCallback,
    onErrorCallback
  ) {
    console.log("[getBars]: Method call", symbolInfo, resolution, periodParams);

    // Generate mock data to avoid CORS issues
    const bars = this.generateMockBars(
      periodParams.from,
      periodParams.to,
      resolution
    );

    setTimeout(() => {
      if (bars.length === 0) {
        onHistoryCallback([], { noData: true });
      } else {
        onHistoryCallback(bars, { noData: false });
      }
    }, 100);
  }

  generateMockBars(from, to, resolution) {
    const bars = [];
    const interval = this.getIntervalInSeconds(resolution) * 1000;
    let currentTime = from * 1000;
    const endTime = to * 1000;

    let basePrice = 50000; // Starting price for BTC-like data
    let currentPrice = basePrice;

    while (currentTime <= endTime) {
      const change = (Math.random() - 0.5) * 1000; // Random price change
      const open = currentPrice;
      const close = currentPrice + change;
      const high = Math.max(open, close) + Math.random() * 500;
      const low = Math.min(open, close) - Math.random() * 500;
      const volume = Math.random() * 1000000;

      bars.push({
        time: currentTime,
        open: open,
        high: high,
        low: low,
        close: close,
        volume: volume,
      });

      currentPrice = close;
      currentTime += interval;
    }

    return bars;
  }

  getIntervalInSeconds(resolution) {
    switch (resolution) {
      case "1":
        return 60;
      case "5":
        return 300;
      case "15":
        return 900;
      case "30":
        return 1800;
      case "60":
        return 3600;
      case "240":
        return 14400;
      case "1D":
        return 86400;
      default:
        return 60;
    }
  }

  subscribeBars(
    symbolInfo,
    resolution,
    onRealtimeCallback,
    subscriberUID,
    onResetCacheNeededCallback
  ) {
    console.log(
      "[subscribeBars]: Method call with subscriberUID:",
      subscriberUID
    );
    // Mock real-time updates
    this.intervalId = setInterval(() => {
      const lastBar = this.lastBar || {
        time: Date.now(),
        open: 50000,
        high: 50500,
        low: 49500,
        close: 50000,
        volume: 1000,
      };

      const change = (Math.random() - 0.5) * 100;
      const newBar = {
        ...lastBar,
        time: Date.now(),
        close: lastBar.close + change,
        high: Math.max(lastBar.high, lastBar.close + change),
        low: Math.min(lastBar.low, lastBar.close + change),
        volume: lastBar.volume + Math.random() * 100,
      };

      this.lastBar = newBar;
      onRealtimeCallback(newBar);
    }, 5000);
  }

  unsubscribeBars(subscriberUID) {
    console.log(
      "[unsubscribeBars]: Method call with subscriberUID:",
      subscriberUID
    );
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

const TradingChartWebView = () => {
  const [searchParams] = useSearchParams();
  const coinPairId = searchParams.get("coin_pair_id") || "BTC";
  const chartContainerRef = useRef(null);
  const tvWidgetRef = useRef(null);
  const [symbol, setSymbol] = useState(coinPairId);
  const [chartType, setChartType] = useState("candles");
  const [timeframe, setTimeframe] = useState("1");

  // Mobile detection
  const isMobile = () => {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768
    );
  };

  // Format the symbol for TradingView (use just the base symbol without USDT suffix)
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

  const getChartConfig = (currentSymbol) => {
    const formattedSymbol = formatSymbolForChart(currentSymbol);
    return {
      symbol: formattedSymbol,
      interval: timeframe,
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

  // Add viewport meta tag for better mobile interaction
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport && isMobile()) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content =
        "width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover";
      document.getElementsByTagName("head")[0].appendChild(meta);
    }
  }, []);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (tvWidgetRef.current) {
      try {
        tvWidgetRef.current.remove();
        tvWidgetRef.current = null;
      } catch (e) {
        // ignore
      }
    }
    try {
      const formattedSymbol = formatSymbolForChart(symbol);
      const widgetOptions = {
        symbol: formattedSymbol,
        datafeed: new window.Datafeeds.UDFCompatibleDatafeed(
          getChartConfig(symbol).datafeedUrl
        ),
        interval: getChartConfig(symbol).interval,
        container: chartContainerRef.current,
        library_path: getChartConfig(symbol).libraryPath,
        locale: getLanguageFromURL() || "en",
        enabled_features: [
          "hide_left_toolbar_by_default",
          "chart_style_hilo_last_price",
          "hide_resolution_in_legend",
          "hide_unresolved_symbols_in_legend",
          "show_symbol_logos",
          "touch_support",
          "mobile_trading_web",
          "chart_crosshair_menu",
          "use_localstorage_for_settings",
          "side_toolbar_in_fullscreen_mode",
          "header_in_fullscreen_mode",
        ],
        toolbar_bg: "#1f2630",
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
          "create_volume_indicator_by_default",
          "show_chart_property_page",
          "adaptive_logo",
          "header_resolutions",
          "timeframes_toolbar",
          // Remove these to allow mobile interactions
          // "show_hide_button_in_legend",
          // "format_button_in_legend",
          // "delete_button_in_legend",
          // "always_show_legend_values_on_mobile",
        ],
        charts_storage_url: getChartConfig(symbol).chartsStorageUrl,
        charts_storage_api_version:
          getChartConfig(symbol).chartsStorageApiVersion,
        client_id: getChartConfig(symbol).clientId,
        user_id: getChartConfig(symbol).userId,
        fullscreen: getChartConfig(symbol).fullscreen,
        autosize: true,
        studiesOverrides: getChartConfig(symbol).studiesOverrides,
        theme: "dark",
        custom_css_url: "/chart_styles.css",
        loading_screen: { backgroundColor: "#000000" },
        overrides: {
          "mainSeriesProperties.candleStyle.upColor": "#26a69a",
          "mainSeriesProperties.candleStyle.downColor": "#ef5350",
          "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
          "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
          "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
          "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
          "scalesProperties.backgroundColor": "#000000",
          "paneProperties.vertGridProperties.color": "#1a1a1a",
          "paneProperties.horzGridProperties.color": "#1a1a1a",
          "scalesProperties.lineColor": "#1a1a1a",
          "scalesProperties.textColor": "#999999",
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
          editorFontsList: "'Trebuchet MS', Verdana, Arial, sans-serif",
          "paneProperties.topMargin": 15,
          "paneProperties.bottomMargin": 10,
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
          "timeScale.rightOffset": 5,
          "timeScale.minBarSpacing": 4,
          "timeScale.rightBarStaysOnScroll": false,
          "timeScale.borderVisible": true,
          "timeScale.borderColor": "#1a1a1a",
          "timeScale.timeVisible": true,
          "timeScale.secondsVisible": true,
          "timeScale.backgroundColor": "#000000",
          "timeScale.textColor": "#999999",
          // Mobile-specific overrides for better touch interaction
          "scalesProperties.showSeriesLastValue": true,
          "scalesProperties.showSeriesOHLC": false,
          "scalesProperties.showBarChange": false,
          "crosshair.mode": 1, // Normal crosshair mode for mobile
          "crosshair.color": "#758696",
          "crosshair.width": 1,
          "crosshair.style": 2,
          "crosshair.transparency": 0,
        },
        // Add mobile-specific settings
        mobile: {
          disableFeatures: [],
          enableFeatures: ["touch_support", "mobile_trading_web"],
        },
        // Additional mobile optimizations
        debug: false,
        autosize: true,
        width: isMobile() ? window.innerWidth : undefined,
        height: 320,
      };
      const tvWidget = new widget(widgetOptions);
      tvWidgetRef.current = tvWidget;
      tvWidget.onChartReady(() => {
        tvWidget.activeChart().applyOverrides({
          "paneProperties.background": "#000000",
          "paneProperties.backgroundType": "solid",
        });

        // Enable mobile touch interactions
        const chartContainer = chartContainerRef.current;
        if (chartContainer) {
          // Prevent default touch behaviors that might interfere
          chartContainer.style.touchAction = "manipulation";
          chartContainer.style.userSelect = "none";
          chartContainer.style.webkitUserSelect = "none";
          chartContainer.style.webkitTouchCallout = "none";

          // Add event listeners for better mobile interaction
          chartContainer.addEventListener(
            "touchstart",
            (e) => {
              e.stopPropagation();
            },
            { passive: true }
          );

          chartContainer.addEventListener(
            "touchmove",
            (e) => {
              e.stopPropagation();
            },
            { passive: true }
          );

          chartContainer.addEventListener(
            "touchend",
            (e) => {
              e.stopPropagation();
            },
            { passive: true }
          );
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
          // ignore
        }
      }
    };
    // eslint-disable-next-line
  }, [symbol, timeframe, chartType]);

  return (
    <div
      className="tvchart-mobile-wrapper"
      style={{
        width: "100%",
        height: 400,
        background: "#000",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        position: "relative",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        ref={chartContainerRef}
        style={{ width: "100%", height: "100%", background: "#000" }}
        className="TVChartContainer"
      />
      <style>{`
        .tvchart-mobile-wrapper {
          touch-action: manipulation !important;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        
        .TVChartContainer {
          touch-action: manipulation !important;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        
        .TVChartContainer iframe {
          touch-action: manipulation !important;
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          pointer-events: auto !important;
        }
        
        /* Ensure chart elements are touchable */
        .TVChartContainer * {
          pointer-events: auto !important;
        }
        
        /* Mobile-specific styles */
        @media (max-width: 600px) {
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
            overflow: visible !important;
          }
          .TVChartContainer {
            width: 100vw !important;
            height: 400px !important;
            min-height: 400px !important;
            max-height: 400px !important;
            background: #000 !important;
            overflow: visible !important;
          }
          
          /* Ensure mobile touch events work properly */
          .TVChartContainer canvas {
            touch-action: manipulation !important;
            pointer-events: auto !important;
          }
          
          /* Fix for webview touch issues */
          .TVChartContainer div {
            touch-action: manipulation !important;
            pointer-events: auto !important;
          }
        }
        
        /* WebView specific fixes */
        @media screen and (max-device-width: 768px) {
          .TVChartContainer {
            -webkit-overflow-scrolling: touch !important;
            overflow: visible !important;
          }
          
          .TVChartContainer iframe {
            -webkit-overflow-scrolling: touch !important;
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TradingChartWebView;
