import React, { useEffect, useRef, useState } from 'react';
import './chart_override.css';
import { widget } from '../../charting_library';

function getLanguageFromURL() {
	const regex = new RegExp('[\\?&]lang=([^&#]*)');
	const results = regex.exec(window.location.search);
	return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, ' '));
}


const TradingChart = () => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const [activeTab, setActiveTab] = useState('order-history');

  const defaultProps = {
		symbol: 'BTC',
		interval: '1m',
		datafeedUrl: 'https://api.mpctoken.com/api/v3',
		libraryPath: '/charting_library/',
		chartsStorageUrl: 'https://saveload.tradingview.com',
		chartsStorageApiVersion: '1.1',
		clientId: 'tradingview.com',
		userId: 'public_user_id',
		fullscreen: false,
		autosize: true,
		studiesOverrides: {},
    backgroundColor: '#000000',
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

		const widgetOptions = {
			symbol: defaultProps.symbol,
			// BEWARE: no trailing slash is expected in feed URL
			datafeed: new window.Datafeeds.UDFCompatibleDatafeed(defaultProps.datafeedUrl),
			interval: defaultProps.interval,
			container: chartContainerRef.current,
			library_path: defaultProps.libraryPath,

			locale: getLanguageFromURL() || 'en',
			disabled_features: ['use_localstorage_for_settings'],
			enabled_features: ['study_templates'],
			charts_storage_url: defaultProps.chartsStorageUrl,
			charts_storage_api_version: defaultProps.chartsStorageApiVersion,
			client_id: defaultProps.clientId,
			user_id: defaultProps.userId,
			fullscreen: defaultProps.fullscreen,
			autosize: defaultProps.autosize,
			studies_overrides: defaultProps.studiesOverrides,
      theme: "dark",
      custom_css_url: '', 
      loading_screen: { backgroundColor: "#000000" },
      enabled_features: [
				"hide_left_toolbar_by_default",
				"chart_style_hilo_last_price",
				"hide_resolution_in_legend",
				"hide_unresolved_symbols_in_legend",
				"chart_style_hilo",
				"show_symbol_logos"
			],
			toolbar_bg: '#000000', 
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
				"paneProperties.vertGridProperties.color": "#363c4e",
				"paneProperties.horzGridProperties.color": "#363c4e",
				"scalesProperties.lineColor": "#363c4e",
				"scalesProperties.textColor": "#d9d9d9",
				
				// Additional chart background properties
				"chartProperties.background": "#000000",
				"chartProperties.paneBackgroundColor": "#000000",
				"chartProperties.backgroundColor": "#000000",
				"paneProperties.backgroundType": "solid",
				"paneProperties.backgroundGradientStartColor": "#000000",
				"paneProperties.backgroundGradientEndColor": "#000000",
				"paneProperties.crossHairProperties.color": "#d9d9d9",
				"paneProperties.crossHairProperties.width": 1,
				"paneProperties.crossHairProperties.transparency": 0,
				"paneProperties.crossHairProperties.borderVisible": false,
				"paneProperties.crossHairProperties.backgroundColor": "#000000",
				"paneProperties.crossHairProperties.backgroundType": "solid",
				"paneProperties.crossHairProperties.backgroundGradientStartColor": "#000000",
				"paneProperties.crossHairProperties.backgroundGradientEndColor": "#000000",
			},
			disabled_features: [
				"items_favoriting", 
				// "legend_context_menu",
				// "hide_main_series_symbol_from_indicator_legend",
				// "symbol_info",
				"header_compare",
				"header_fullscreen_button",
				"header_settings",
				"header_quick_search",
				"symbol_search_hot_key",
				"show_hide_button_in_legend",
				"format_button_in_legend",
				"header_symbol_search",
				// "show_object_tree",
				"header_saveload", 
				"compare_symbol_search_spread_operators",
				// "legend_widget",
				"format_button_in_legend",
				"delete_button_in_legend",
				"show_hide_button_in_legend",
				"create_volume_indicator_by_default",
				"show_chart_property_page",
				// "control_bar",
				"always_show_legend_values_on_mobile",
				"adaptive_logo",
				// "header_widget",
				// "main_series_scale_menu",
				"header_resolutions",
				"timeframes_toolbar"
			],
		};

		const tvWidget = new widget(widgetOptions);

		tvWidget.onChartReady(() => {
			// Set chart background to black using the chart's API
			tvWidget.activeChart().applyOverrides({
				"paneProperties.background": "#000000",
				"paneProperties.backgroundType": "solid"
			});
			
			// Target the main chart background specifically
			const chartElements = document.querySelectorAll('.tv-chart-container, .chart-container, .chart-markup-table, .chart-page');
			chartElements.forEach(el => {
				el.style.backgroundColor = '#000000';
			});
			
			// Target the specific chart canvas background - the main chart area
			setTimeout(() => {
				// Use setTimeout to ensure the chart is fully rendered
				// Apply direct style to the main chart area
				const style = document.createElement('style');
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
				const iframes = document.querySelectorAll('iframe');
				iframes.forEach(iframe => {
					try {
						if (iframe.contentDocument) {
							// Create a style element for the iframe
							const iframeStyle = document.createElement('style');
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
							const iframeElements = iframe.contentDocument.querySelectorAll('.chart-page, .chart-container, .tv-chart-container');
							iframeElements.forEach(el => {
								el.style.backgroundColor = '#000000';
							});
						}
					} catch (e) {
						console.error('Error modifying iframe content:', e);
					}
				});
			}, 1000);
			
			tvWidget.headerReady().then(() => {
				const button = tvWidget.createButton();
				button.setAttribute('title', 'Click to show a notification popup');
				button.classList.add('apply-common-tooltip');
				button.addEventListener('click', () => tvWidget.showNoticeDialog({
					title: 'Notification',
					body: 'TradingView Charting Library API works correctly',
					callback: () => {
						console.log('Noticed!');
					},
				}));

				button.innerHTML = 'Check API';
			});
		});

		return () => {
			tvWidget.remove();
		};
	});

  return (
    
    <div className="chart-section" style={{ width: '100%', height: '700px', backgroundColor: '#000000' }}>
     
      <div className="chart-nav">
        <div className="left-tabs">
          <div className="tab active">Chart</div>
          <div className="tab">Overview</div>
          <div className="tab">Feed</div>
        </div>
        <div className="right-actions">
          <div className="expand"><i className="far fa-square"></i></div>
          <div className="more"><i className="fas fa-ellipsis-v"></i></div>
        </div>
      </div>

      <div className="chart-content">
        <div className="chart-toolbar">
          <div className="timeframes">
            <div className="timeframe">1m</div>
            <div className="timeframe">5m</div>
            <div className="timeframe">1h</div>
            <div className="timeframe">4h</div>
          </div>
          {/* <div className="chart-tools">
            <div className="tool"><i className="fas fa-crosshairs"></i></div>
            <div className="tool"><i className="fas fa-chart-bar"></i></div>
            <div className="tool"><i className="fas fa-th-large"></i></div>
            <div className="tool"><i className="fas fa-pencil-alt"></i></div>
            <div className="tool"><i className="fas fa-shapes"></i></div>
            <div className="tool"><i className="fas fa-balance-scale"></i></div>
          </div>
          <div className="view-options">
            <div className="view active">Original</div>
            <div className="view">TradingView</div>
            <div className="view">Depth</div>
            <div className="view">Market cap</div>
            <div className="fullscreen"><i className="fas fa-expand"></i></div>
          </div> */}
        </div>

        {/* <div className="chart-header">
          <div className="chart-symbol">
            <span className="symbol-icon">🔶</span>
            <span className="symbol-text">BTC/USDT · 15 · TradeX</span>
            <span className="prices">O<span className="price-value">85,841.5</span> H<span className="price-value">86,094.0</span> L<span className="price-value">85,600.0</span> C<span className="price-value">86,064.5</span></span>
            <span className="change green">+224.5 (+0.26%)</span>
          </div>
        </div> */}

        <div className="chart-area" style={{ backgroundColor: '#000000' }}>
          {/* <div className="side-toolbar">
            <div className="tool-button"><i className="fas fa-crosshair"></i></div>
            <div className="tool-button"><i className="fas fa-arrows-alt"></i></div>
            <div className="tool-button"><i className="fas fa-chart-line"></i></div>
            <div className="tool-button"><i className="fas fa-ruler-combined"></i></div>
            <div className="tool-button"><i className="fas fa-text-height"></i></div>
            <div className="tool-button"><i className="fas fa-object-group"></i></div>
          </div> */}
          <div
			ref={chartContainerRef}
			className={'TVChartContainer'}
			style={{ 
				backgroundColor: '#000000',
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
		</div>

        {/* <div className="volume-info">
          <div className="volume-label">Volume <span className="volume-sma">SMA</span></div>
          <div className="volume-value">169.03616</div>
        </div> */}

        {/* <div className="chart-footer">
          <div className="time-ranges">
            <div className="range">1D</div>
            <div className="range">5D</div>
            <div className="range">1M</div>
            <div className="range">3M</div>
            <div className="range">6M</div>
            <div className="range">1Y</div>
          </div>
          <div className="time">21:39:40 (UTC+8)</div>
          <div className="scale-options">
            <div className="scale">%</div>
            <div className="scale">log</div>
            <div className="scale active">auto</div>
          </div>
          <div className="sentiment">
            <div className="buy">B <span className="percent">52.50%</span></div>
            <div className="sell">S <span className="percent">47.50%</span></div>
          </div>
        </div> */}
      </div>

      <div className="orders-tabs">
        <div 
          className={`tab ${activeTab === 'open-orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('open-orders')}
        >
          Open orders
        </div>
        <div 
          className={`tab ${activeTab === 'order-history' ? 'active' : ''}`}
          onClick={() => setActiveTab('order-history')}
        >
          Order history
        </div>
        <div 
          className={`tab ${activeTab === 'open-positions' ? 'active' : ''}`}
          onClick={() => setActiveTab('open-positions')}
        >
          Open positions
        </div>
        <div 
          className={`tab ${activeTab === 'position-history' ? 'active' : ''}`}
          onClick={() => setActiveTab('position-history')}
        >
          Position history
        </div>
        <div 
          className={`tab ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          Assets
        </div>
        <div 
          className={`tab ${activeTab === 'bots' ? 'active' : ''}`}
          onClick={() => setActiveTab('bots')}
        >
          Bots
        </div>
        <div className="more-options"><i className="fas fa-ellipsis-v"></i></div>
      </div>
      
      {/* {activeTab === 'order-history' && <OrderHistory />} */}
    </div>
  );
};

export default TradingChart; 