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
  if (!symbol) return 'BTC';
  
  // Remove any USDT suffix if present
  let formattedSymbol = symbol.replace('/USDT', '').replace('USDT', '');
  
  // Return just the symbol without USDT suffix
  return formattedSymbol;
};

const TradingChartDynamic = ({ selectedSymbol = 'BTC' }) => {
  const chartContainerRef = useRef(null);
  const tvWidgetRef = useRef(null);
  const [chartSymbol, setChartSymbol] = useState(formatSymbolForChart(selectedSymbol));
  const [activeTab, setActiveTab] = useState('Chart');
  const [activeTimeframe, setActiveTimeframe] = useState('1D');
  const [activeTool, setActiveTool] = useState('Line');

  // Update chart symbol when selectedSymbol prop changes
  useEffect(() => {
    const formattedSymbol = formatSymbolForChart(selectedSymbol);
    console.log('FutureTrading TradingChart: Symbol updated to', formattedSymbol);
    setChartSymbol(formattedSymbol);
    
    // If the widget already exists, update its symbol
    if (tvWidgetRef.current) {
      try {
        tvWidgetRef.current.setSymbol(formattedSymbol, activeTimeframe, () => {
          console.log('FutureTrading TradingChart: Symbol successfully updated in widget');
        });
      } catch (error) {
        console.error('FutureTrading TradingChart: Error updating symbol:', error);
      }
    }
  }, [selectedSymbol, activeTimeframe]);

  // Handle timeframe changes
  const handleTimeframeChange = (timeframe) => {
    setActiveTimeframe(timeframe);
    if (tvWidgetRef.current) {
      try {
        tvWidgetRef.current.chart().setResolution(timeframe.toLowerCase().replace('m', '').replace('h', '60').replace('d', '1440'), () => {
          console.log(`FutureTrading TradingChart: Timeframe changed to ${timeframe}`);
        });
      } catch (error) {
        console.error('FutureTrading TradingChart: Error changing timeframe:', error);
      }
    }
  };

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
        theme: "dark",
        custom_css_url: '', 
        loading_screen: { backgroundColor: "#000000" },
        toolbar_bg: '#000000',
        symbol_search_request_delay: 1000,
        auto_save_delay: 5,
        timezone: "Asia/Singapore",
        debug: false,
        time_frames: [
          { text: "1D", resolution: "1D" },
          { text: "4H", resolution: "4H" },
          { text: "1H", resolution: "1H" },
          { text: "15m", resolution: "15" },
          { text: "5m", resolution: "5" }
        ],
        overrides: {
          // Candle styling
          'mainSeriesProperties.candleStyle.upColor': '#00b897',
          'mainSeriesProperties.candleStyle.downColor': '#f23645',
          'mainSeriesProperties.candleStyle.drawBorder': true,
          'mainSeriesProperties.candleStyle.borderUpColor': '#00b897',
          'mainSeriesProperties.candleStyle.borderDownColor': '#f23645',
          'mainSeriesProperties.candleStyle.wickUpColor': '#00b897',
          'mainSeriesProperties.candleStyle.wickDownColor': '#f23645',
          
          // Chart background
          'paneProperties.background': '#000000',
          'paneProperties.backgroundType': 'solid',
          'paneProperties.backgroundGradientStartColor': '#000000',
          'paneProperties.backgroundGradientEndColor': '#000000',
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
          'symbolWatermarkProperties.color': '#000000',
          
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
          'precision': 4,
          
          // Additional background overrides
          'chartProperties.background': '#000000',
          'chartProperties.paneBackgroundColor': '#000000',
          'chartProperties.gridColor': '#1a1a1a',
          'chartProperties.gridProperties.color': '#1a1a1a',
          'chartProperties.gridProperties.style': 0,
          'chartProperties.backgroundColor': '#000000'
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
      <div className="chart-nav">
        <div className="chart-tabs">
          <div className={`tab ${activeTab === 'Chart' ? 'active' : ''}`} onClick={() => setActiveTab('Chart')}>Chart</div>
          <div className={`tab ${activeTab === 'Depth' ? 'active' : ''}`} onClick={() => setActiveTab('Depth')}>Depth</div>
        </div>
        <div className="chart-timeframes">
          <div className={`timeframe ${activeTimeframe === '1D' ? 'active' : ''}`} onClick={() => handleTimeframeChange('1D')}>1D</div>
          <div className={`timeframe ${activeTimeframe === '4H' ? 'active' : ''}`} onClick={() => handleTimeframeChange('4H')}>4H</div>
          <div className={`timeframe ${activeTimeframe === '1H' ? 'active' : ''}`} onClick={() => handleTimeframeChange('1H')}>1H</div>
          <div className={`timeframe ${activeTimeframe === '15m' ? 'active' : ''}`} onClick={() => handleTimeframeChange('15m')}>15m</div>
          <div className={`timeframe ${activeTimeframe === '5m' ? 'active' : ''}`} onClick={() => handleTimeframeChange('5m')}>5m</div>
        </div>
      </div>
      <div className="chart-content">
        <div className="chart-toolbar">
          <div className="chart-tools">
            <div className={`chart-tool ${activeTool === 'Line' ? 'active' : ''}`} onClick={() => setActiveTool('Line')}>Line</div>
            <div className={`chart-tool ${activeTool === 'Candle' ? 'active' : ''}`} onClick={() => setActiveTool('Candle')}>Candle</div>
            <div className={`chart-tool ${activeTool === 'Indicators' ? 'active' : ''}`} onClick={() => setActiveTool('Indicators')}>Indicators</div>
          </div>
          <div className="symbol-display">
            <span className="symbol-name">{chartSymbol}</span>
          </div>
        </div>
        <div className="chart-area" style={{ 
          backgroundColor: '#000000',
          maxWidth: '100%',
          height: '400px',
          maxHeight: '400px',
          border: '1px solid rgb(26, 26, 26)',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {activeTab === 'Chart' && (
            <div
              ref={chartContainerRef}
              className={'TVChartContainer'}
              style={{ 
                height: '100%',
                width: '100%',
                backgroundColor: '#000000',
                border: 'none',
                overflow: 'hidden',
                position: 'relative'
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
          )}
          {activeTab === 'Depth' && (
            <div className="depth-chart-placeholder" style={{
              height: '100%',
              width: '100%',
              backgroundColor: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8A8A8A',
              fontFamily: 'Roboto Mono, monospace'
            }}>
              Depth chart view coming soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingChartDynamic;
