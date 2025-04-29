import React, { useEffect, useRef, useState } from 'react';
import './chart_override.css';
import { widget } from '../../charting_library';

function getLanguageFromURL() {
	const regex = new RegExp('[\\?&]lang=([^&#]*)');
	const results = regex.exec(window.location.search);
	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Helper function to format the symbol for the chart
const formatSymbolForChart = (symbol) => {
  if (!symbol) return 'BTCUSDT';
  
  // Remove any USDT suffix if present
  let formattedSymbol = symbol.replace('/USDT', '').replace('USDT', '');
  
  // Add USDT suffix in the format required by TradingView
  return `${formattedSymbol}USDT`;
};

const TradingChartDynamic = ({ selectedSymbol = 'BTC' }) => {
  const chartContainerRef = useRef(null);
  const tvWidgetRef = useRef(null);
  const [chartSymbol, setChartSymbol] = useState(formatSymbolForChart(selectedSymbol));

  // Update chart symbol when selectedSymbol prop changes
  useEffect(() => {
    const formattedSymbol = formatSymbolForChart(selectedSymbol);
    console.log('FutureTrading TradingChart: Symbol updated to', formattedSymbol);
    setChartSymbol(formattedSymbol);
    
    // If the widget already exists, update its symbol
    if (tvWidgetRef.current) {
      try {
        tvWidgetRef.current.setSymbol(formattedSymbol, '1D', () => {
          console.log('FutureTrading TradingChart: Symbol successfully updated in widget');
        });
      } catch (error) {
        console.error('FutureTrading TradingChart: Error updating symbol:', error);
      }
    }
  }, [selectedSymbol]);

  useEffect(() => {
    // Inject styles to force black background
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Force black background on TradingView chart */
      .chart-container,
      .tv-chart-container,
      .layout__area--center,
      .chart-page,
      .chart-container__chartarea,
      .chart-container__chartarea--themed-dark,
      .chart-markup-table,
      .tv-chart-container__bg {
        background-color: #000000 !important;
      }
      
      /* Target the chart canvas */
      .chart-container canvas {
        background-color: #000000 !important;
      }
      
      /* Target the specific navy blue background */
      body .chart-page,
      body .chart-container,
      body .chart-container__chartarea,
      body .chart-container__chartarea--themed-dark,
      body .layout__area--center,
      body .tv-chart-container,
      body iframe {
        background-color: #000000 !important;
      }
      
      /* Target the main chart area where candlesticks are displayed */
      .chart-container__chartarea--themed-dark {
        background-color: #000000 !important;
      }
      
      /* Force all elements to have black background */
      .TVChartContainer iframe,
      .TVChartContainer iframe body,
      .TVChartContainer iframe html {
        background-color: #000000 !important;
      }
      
      /* Target the specific navy background in TradingView */
      .chart-page .chart-container {
        background-color: #000000 !important;
      }
      
      /* Target the background of the price and time scales */
      .chart-page .chart-container .price-axis,
      .chart-page .chart-container .time-axis {
        background-color: #000000 !important;
      }
    `;
    document.head.appendChild(styleElement);

    // Only initialize the widget if it doesn't exist yet
    if (!tvWidgetRef.current && chartContainerRef.current) {
      console.log('FutureTrading TradingChart: Initializing widget with symbol', chartSymbol);
      
      const widgetOptions = {
        symbol: chartSymbol,
        // BEWARE: no trailing slash is expected in feed URL
        datafeed: new window.Datafeeds.UDFCompatibleDatafeed('https://api.mpctoken.com/api/v3'),
        interval: '1D',
        container: chartContainerRef.current,
        library_path: '/charting_library/',
        locale: getLanguageFromURL() || 'en',
        disabled_features: ['use_localstorage_for_settings'],
        enabled_features: [
          'study_templates',
          'hide_left_toolbar_by_default',
          'chart_style_hilo_last_price',
          'hide_resolution_in_legend',
          'hide_unresolved_symbols_in_legend',
          'chart_style_hilo',
          'show_symbol_logos'
        ],
        charts_storage_url: 'https://saveload.tradingview.com',
        charts_storage_api_version: '1.1',
        client_id: 'tradingview.com',
        user_id: 'public_user_id',
        fullscreen: false,
        autosize: true,
        studies_overrides: {},
        theme: 'Dark',
        custom_css_url: '',
        loading_screen: { backgroundColor: '#000000' },
        toolbar_bg: '#000000',
        overrides: {
          // Candle styling
          'mainSeriesProperties.candleStyle.upColor': '#00b897',
          'mainSeriesProperties.candleStyle.downColor': '#f23645',
          'mainSeriesProperties.candleStyle.borderUpColor': '#00b897',
          'mainSeriesProperties.candleStyle.borderDownColor': '#f23645',
          'mainSeriesProperties.candleStyle.wickUpColor': '#00b897',
          'mainSeriesProperties.candleStyle.wickDownColor': '#f23645',
          
          // Chart background
          'paneProperties.background': '#000000',
          'paneProperties.vertGridProperties.color': '#1a1a1a',
          'paneProperties.horzGridProperties.color': '#1a1a1a',
          
          // Crosshair
          'crossHairProperties.color': '#758696',
          
          // Price scale
          'scalesProperties.backgroundColor': '#000000',
          'scalesProperties.lineColor': '#1a1a1a',
          'scalesProperties.textColor': '#999',
          
          // Watermark
          'symbolWatermarkProperties.transparency': 0,
          
          // Legend
          'mainSeriesProperties.showPriceLine': true,
          'mainSeriesProperties.priceLineWidth': 1,
          'mainSeriesProperties.priceLineColor': '#3179f5',
          'mainSeriesProperties.statusViewStyle.fontSize': 13,
          'mainSeriesProperties.statusViewStyle.text': '',
          'mainSeriesProperties.statusViewStyle.backgroundColor': '#000000',
          'mainSeriesProperties.statusViewStyle.color': '#fff',
          
          // Timeframes
          'timeScale.rightOffset': 5,
          'timeScale.barSpacing': 5,
          'timeScale.minBarSpacing': 5,
          'timeScale.rightBarStaysOnScroll': true,
          'timeScale.borderVisible': false,
          'timeScale.borderColor': '#1a1a1a',
          'timeScale.visible': true,
          'timeScale.timeVisible': true,
          'timeScale.secondsVisible': true,
          'timeScale.lockVisibleTimeRangeOnResize': false,
          
          // Volume
          'volume.volume.color.0': '#f23645',
          'volume.volume.color.1': '#00b897',
          'volume.volume.transparency': 70,
          'volume.volume ma.color': '#FF9800',
          'volume.volume ma.transparency': 30,
          'volume.volume ma.linewidth': 2,
          'volume.show ma': true,
          'volume.options.showStudyArguments': false,
          'volume.options.showStudyTitles': false,
          'volume.options.showStudyValues': false,
          'volume.options.showLegend': false,
          'volume.options.showBarChange': false,
          
          // Precision
          'precision': 4
        }
      };

      try {
        const tvWidget = new widget(widgetOptions);
        tvWidgetRef.current = tvWidget;

        tvWidget.onChartReady(() => {
          console.log('FutureTrading TradingChart: Chart is ready');
        });
      } catch (error) {
        console.error('FutureTrading TradingChart: Error initializing widget:', error);
      }
    }

    // Cleanup function
    return () => {
      if (tvWidgetRef.current) {
        try {
          console.log('FutureTrading TradingChart: Cleaning up widget');
          tvWidgetRef.current.remove();
          tvWidgetRef.current = null;
        } catch (error) {
          console.error('FutureTrading TradingChart: Error during cleanup:', error);
        }
      }
      
      // Remove the injected styles
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, []); // Empty dependency array to run only once on mount

  return (
    <div className="chart-section">
      <div className="chart-area" style={{ backgroundColor: '#000000' }}>
        <div
          ref={chartContainerRef}
          className={'TVChartContainer'}
          style={{ 
            backgroundColor: '#000000',
            position: 'relative',
            height: '100%'
          }}>
          {/* Overlay div to force black background */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: '#000000',
            zIndex: -1
          }}></div>
        </div>        
      </div>
    </div>
  );
};

export default TradingChartDynamic;
