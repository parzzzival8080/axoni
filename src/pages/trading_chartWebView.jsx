import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { widget } from "../charting_library/charting_library.esm.js";

function getLanguageFromURL() {
  const regex = new RegExp("[\\?&]lang=([^&#]*)");
  const results = regex.exec(window.location.search);
  return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
}

const TradingChartWebView = () => {
  const [searchParams] = useSearchParams();
  const coinPairId = searchParams.get("coin_pair_id") || "BTC";
  const chartContainerRef = useRef(null);
  const tvWidgetRef = useRef(null);
  const [symbol, setSymbol] = useState(coinPairId);
  const [chartType, setChartType] = useState("candles");
  const [timeframe, setTimeframe] = useState("1");

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
      datafeedUrl: "https://apiv2.bhtokens.com/api/v1",
      libraryPath: "/charting_library/",
      chartsStorageUrl: "https://saveload.tradingview.com",
      chartsStorageApiVersion: "1.1",
      clientId: "tradingview.com",
      userId: "public_user_id",
      fullscreen: false,
      autosize: true,
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
        datafeed: new window.Datafeeds.UDFCompatibleDatafeed(getChartConfig(symbol).datafeedUrl),
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
          "hide_resolution_in_legend",
          "hide_unresolved_symbols_in_legend",
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
        charts_storage_url: getChartConfig(symbol).chartsStorageUrl,
        charts_storage_api_version: getChartConfig(symbol).chartsStorageApiVersion,
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
          "paneProperties.crossHairProperties.backgroundGradientStartColor": "#000000",
          "paneProperties.crossHairProperties.backgroundGradientEndColor": "#000000",
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
        },
      };
      const tvWidget = new widget(widgetOptions);
      tvWidgetRef.current = tvWidget;
      tvWidget.onChartReady(() => {
        tvWidget.activeChart().applyOverrides({
          "paneProperties.background": "#000000",
          "paneProperties.backgroundType": "solid",
        });
        setTimeout(() => {
          const style = document.createElement("style");
          style.textContent = `
            .tv-chart-container, .chart-container, .chart-markup-table, .chart-page, .layout__area--center {
              background-color: #000000 !important;
            }
            [style*="background-color: rgb(19, 23, 34)"],
            [style*="background-color: #131722"],
            [style*="background-color: rgb(27, 32, 48)"],
            [style*="background-color: #1b2030"] {
              background-color: #000000 !important;
            }
          `;
          document.head.appendChild(style);
        }, 1000);
      });
    } catch (error) {
      // ignore
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
        height: 320,
        background: "#000",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        position: "relative",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div
        ref={chartContainerRef}
        style={{ width: "100%", height: "100%", background: "#000" }}
        className="TVChartContainer"
      />
      <style>{`
        @media (max-width: 600px) {
          .tvchart-mobile-wrapper {
            width: 100vw !important;
            height: 320px !important;
            min-height: 320px !important;
            max-height: 320px !important;
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            background: #000 !important;
            border-radius: 0 !important;
          }
          .TVChartContainer {
            width: 100vw !important;
            height: 320px !important;
            min-height: 320px !important;
            max-height: 320px !important;
            background: #000 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TradingChartWebView;
