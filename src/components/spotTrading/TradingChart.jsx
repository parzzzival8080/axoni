import React, { useEffect, useRef } from 'react';

const TradingChart = () => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartContainerRef.current && window.LightweightCharts) {
      try {
        // Initialize chart with global LightweightCharts object
        const chart = window.LightweightCharts.createChart(chartContainerRef.current, {
          width: chartContainerRef.current.clientWidth,
          height: 400,
          layout: {
            backgroundColor: '#000000',
            textColor: '#D9D9D9',
          },
          grid: {
            vertLines: {
              color: '#1a1a1a',
            },
            horzLines: {
              color: '#1a1a1a',
            },
          },
          crosshair: {
            vertLine: {
              color: '#505050',
              width: 1,
              labelBackgroundColor: '#232323',
            },
            horzLine: {
              color: '#505050',
              width: 1,
              labelBackgroundColor: '#232323',
            }
          },
          timeScale: {
            borderColor: '#1a1a1a',
          },
        });

        // Sample data for candlestick chart
        const data = [
          { time: '2023-01-01', open: 86000, high: 86200, low: 85800, close: 86100 },
          { time: '2023-01-02', open: 86100, high: 86300, low: 85900, close: 86000 },
          { time: '2023-01-03', open: 86000, high: 86400, low: 85950, close: 86250 },
          { time: '2023-01-04', open: 86250, high: 86500, low: 86100, close: 86400 },
          { time: '2023-01-05', open: 86400, high: 86600, low: 86200, close: 86300 },
          { time: '2023-01-06', open: 86300, high: 86450, low: 86100, close: 86350 },
          { time: '2023-01-07', open: 86350, high: 86500, low: 86200, close: 86450 },
          { time: '2023-01-08', open: 86450, high: 86550, low: 86300, close: 86400 },
          { time: '2023-01-09', open: 86400, high: 86500, low: 86250, close: 86350 },
          { time: '2023-01-10', open: 86350, high: 86450, low: 86150, close: 86250 },
          { time: '2023-01-11', open: 86250, high: 86350, low: 86050, close: 86150 },
          { time: '2023-01-12', open: 86150, high: 86300, low: 86000, close: 86200 },
          { time: '2023-01-13', open: 86200, high: 86400, low: 86100, close: 86350 },
          { time: '2023-01-14', open: 86350, high: 86500, low: 86200, close: 86400 },
          { time: '2023-01-15', open: 86400, high: 86600, low: 86300, close: 86500 },
          { time: '2023-01-16', open: 86500, high: 86700, low: 86400, close: 86600 },
          { time: '2023-01-17', open: 86600, high: 86800, low: 86500, close: 86750 },
          { time: '2023-01-18', open: 86750, high: 86900, low: 86600, close: 86850 },
          { time: '2023-01-19', open: 86850, high: 87000, low: 86700, close: 86900 },
          { time: '2023-01-20', open: 86900, high: 87100, low: 86800, close: 87050 },
        ];

        // Create series for candlestick data
        const candlestickSeries = chart.addCandlestickSeries({
          upColor: '#00b897',
          downColor: '#f23645',
          borderVisible: false,
          wickUpColor: '#00b897',
          wickDownColor: '#f23645',
        });

        // Add data to candlestick series
        candlestickSeries.setData(data);

        // Create volume series
        const volumeSeries = chart.addHistogramSeries({
          color: '#26a69a',
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: '',
        });

        // Configure volume scale
        volumeSeries.priceScale().applyOptions({
          scaleMargins: {
            top: 0.8,
            bottom: 0,
          },
        });

        // Create volume data
        const volumeData = data.map(item => ({
          time: item.time,
          value: Math.random() * 200 + 100,
          color: item.open <= item.close ? 'rgba(0, 184, 151, 0.5)' : 'rgba(242, 54, 69, 0.5)',
        }));

        // Add data to volume series
        volumeSeries.setData(volumeData);

        // Fit content to view
        chart.timeScale().fitContent();

        // Handle window resize
        const handleResize = () => {
          if (chartContainerRef.current && chart) {
            chart.applyOptions({
              width: chartContainerRef.current.clientWidth,
            });
          }
        };

        window.addEventListener('resize', handleResize);
        chartRef.current = chart;

        return () => {
          window.removeEventListener('resize', handleResize);
          chart.remove();
        };
      } catch (error) {
        console.error("Error initializing chart:", error);
      }
    }
  }, []);

  return (
    <div className="chart-section">
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
            <div className="timeframe">1s</div>
            <div className="timeframe">1m</div>
            <div className="timeframe">5m</div>
            <div className="timeframe active">15m</div>
            <div className="timeframe">1h</div>
            <div className="timeframe">4h</div>
            <div className="timeframe">1D</div>
            <div className="timeframe dropdown"><i className="fas fa-chevron-down"></i></div>
          </div>
          <div className="chart-tools">
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
          </div>
        </div>

        <div className="chart-header">
          <div className="chart-symbol">
            <span className="symbol-icon">🔶</span>
            <span className="symbol-text">BTC/USDT · 15 · TradeX</span>
            <span className="prices">O<span className="price-value">85,841.5</span> H<span className="price-value">86,094.0</span> L<span className="price-value">85,600.0</span> C<span className="price-value">86,064.5</span></span>
            <span className="change green">+224.5 (+0.26%)</span>
          </div>
        </div>

        <div className="chart-area">
          <div className="side-toolbar">
            <div className="tool-button"><i className="fas fa-crosshair"></i></div>
            <div className="tool-button"><i className="fas fa-arrows-alt"></i></div>
            <div className="tool-button"><i className="fas fa-chart-line"></i></div>
            <div className="tool-button"><i className="fas fa-ruler-combined"></i></div>
            <div className="tool-button"><i className="fas fa-text-height"></i></div>
            <div className="tool-button"><i className="fas fa-object-group"></i></div>
          </div>
          <div id="chart" ref={chartContainerRef} style={{ width: '100%', height: '400px' }}></div>
        </div>

        <div className="volume-info">
          <div className="volume-label">Volume <span className="volume-sma">SMA</span></div>
          <div className="volume-value">169.03616</div>
        </div>

        <div className="chart-footer">
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
        </div>
      </div>

      <div className="orders-tabs">
        <div className="tab active">Open orders</div>
        <div className="tab">Order history</div>
        <div className="tab">Open positions</div>
        <div className="tab">Position history</div>
        <div className="tab">Assets</div>
        <div className="tab">Bots</div>
        <div className="more-options"><i className="fas fa-ellipsis-v"></i></div>
      </div>
    </div>
  );
};

export default TradingChart; 