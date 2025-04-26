import React, { useEffect, useRef, useState } from 'react';
import OrderHistory from './OrderHistory';
import './index.css';
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
	};

  useEffect(() => {
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
      enabled_features: [
				"hide_left_toolbar_by_default",
				"chart_style_hilo_last_price",
				"hide_resolution_in_legend",
				"hide_unresolved_symbols_in_legend",
				"chart_style_hilo",
				"show_symbol_logos"
			],
			toolbar_bg: '#1f2630',
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
    
    <div className="chart-section" style={{ width: '100%', height: '700px' }}>
     
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

        <div className="chart-area">
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
			className={'TVChartContainer'}></div>        </div>

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
      
      {activeTab === 'order-history' && <OrderHistory />}
    </div>
  );
};

export default TradingChart; 