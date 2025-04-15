document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded, initializing chart...");

    // Initialize chart container
    const chartContainer = document.getElementById('chart');

    if (!chartContainer) {
        console.error('Chart container not found');
        return;
    }

    // Fallback chart using Canvas API if TradingView libraries fail
    function createFallbackChart() {
        console.log("Creating fallback chart...");

        // Clear container
        chartContainer.innerHTML = '';

        // Create canvas element
        const canvas = document.createElement('canvas');
        canvas.width = chartContainer.clientWidth;
        canvas.height = 400;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        chartContainer.appendChild(canvas);

        const ctx = canvas.getContext('2d');

        // Draw background
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid lines
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;

        // Vertical grid lines
        for (let x = 0; x < canvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        // Horizontal grid lines
        for (let y = 0; y < canvas.height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Sample data for candlestick chart
        const data = [
            { time: 0, open: 86000, high: 86200, low: 85800, close: 86100 },
            { time: 1, open: 86100, high: 86300, low: 85900, close: 86000 },
            { time: 2, open: 86000, high: 86400, low: 85950, close: 86250 },
            { time: 3, open: 86250, high: 86500, low: 86100, close: 86400 },
            { time: 4, open: 86400, high: 86600, low: 86200, close: 86300 },
            { time: 5, open: 86300, high: 86450, low: 86100, close: 86350 },
            { time: 6, open: 86350, high: 86500, low: 86200, close: 86450 },
            { time: 7, open: 86450, high: 86550, low: 86300, close: 86400 },
            { time: 8, open: 86400, high: 86500, low: 86250, close: 86350 },
            { time: 9, open: 86350, high: 86450, low: 86150, close: 86250 },
            { time: 10, open: 86250, high: 86350, low: 86050, close: 86150 },
            { time: 11, open: 86150, high: 86300, low: 86000, close: 86200 },
            { time: 12, open: 86200, high: 86400, low: 86100, close: 86350 },
            { time: 13, open: 86350, high: 86500, low: 86200, close: 86400 },
            { time: 14, open: 86400, high: 86600, low: 86300, close: 86500 },
            { time: 15, open: 86500, high: 86700, low: 86400, close: 86600 },
            { time: 16, open: 86600, high: 86800, low: 86500, close: 86750 },
            { time: 17, open: 86750, high: 86900, low: 86600, close: 86850 },
            { time: 18, open: 86850, high: 87000, low: 86700, close: 86900 },
            { time: 19, open: 86900, high: 87100, low: 86800, close: 87050 },
            { time: 20, open: 87050, high: 87200, low: 86900, close: 87000 },
            { time: 21, open: 87000, high: 87150, low: 86850, close: 86950 },
            { time: 22, open: 86950, high: 87050, low: 86800, close: 86900 },
            { time: 23, open: 86900, high: 87000, low: 86750, close: 86850 },
            { time: 24, open: 86850, high: 86950, low: 86700, close: 86800 },
            { time: 25, open: 86800, high: 86900, low: 86650, close: 86750 },
            { time: 26, open: 86750, high: 86850, low: 86600, close: 86700 },
            { time: 27, open: 86700, high: 86800, low: 86550, close: 86650 },
            { time: 28, open: 86650, high: 86750, low: 86500, close: 86600 },
            { time: 29, open: 86600, high: 86700, low: 86450, close: 86550 },
            { time: 30, open: 86550, high: 86650, low: 86400, close: 86500 },
            { time: 31, open: 86500, high: 86600, low: 86350, close: 86450 },
            { time: 32, open: 86450, high: 86550, low: 86300, close: 86064.5 }
        ];

        // Define chart area
        const chartMargin = { top: 20, right: 20, bottom: 30, left: 50 };
        const chartWidth = canvas.width - chartMargin.left - chartMargin.right;
        const chartHeight = canvas.height - chartMargin.top - chartMargin.bottom;

        // Find min/max values
        let minPrice = Math.min(...data.map(d => d.low));
        let maxPrice = Math.max(...data.map(d => d.high));

        // Add some padding
        const pricePadding = (maxPrice - minPrice) * 0.1;
        minPrice -= pricePadding;
        maxPrice += pricePadding;

        // Scale functions
        const xScale = (time) => chartMargin.left + (time / data.length) * chartWidth;
        const yScale = (price) => chartMargin.top + chartHeight - ((price - minPrice) / (maxPrice - minPrice)) * chartHeight;

        // Draw candlesticks
        const candleWidth = chartWidth / data.length * 0.8;

        data.forEach(candle => {
            const x = xScale(candle.time);
            const open = yScale(candle.open);
            const close = yScale(candle.close);
            const high = yScale(candle.high);
            const low = yScale(candle.low);

            // Draw wick
            ctx.strokeStyle = candle.open > candle.close ? '#f23645' : '#00b897';
            ctx.beginPath();
            ctx.moveTo(x, high);
            ctx.lineTo(x, low);
            ctx.stroke();

            // Draw body
            ctx.fillStyle = candle.open > candle.close ? '#f23645' : '#00b897';
            ctx.fillRect(x - candleWidth / 2, open, candleWidth, close - open);
        });

        // Draw current price line
        const currentPrice = data[data.length - 1].close;
        const currentPriceY = yScale(currentPrice);

        ctx.strokeStyle = '#00b897';
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(chartMargin.left, currentPriceY);
        ctx.lineTo(canvas.width - chartMargin.right, currentPriceY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Add price label
        ctx.fillStyle = '#00b897';
        ctx.font = '12px Arial';
        ctx.fillText(currentPrice.toFixed(1), canvas.width - chartMargin.right + 5, currentPriceY);

        // Draw axes
        ctx.strokeStyle = '#333';
        ctx.beginPath();
        ctx.moveTo(chartMargin.left, chartMargin.top);
        ctx.lineTo(chartMargin.left, canvas.height - chartMargin.bottom);
        ctx.lineTo(canvas.width - chartMargin.right, canvas.height - chartMargin.bottom);
        ctx.stroke();

        // Add volume histogram
        const volumeHeight = chartHeight * 0.15;
        const volumeTop = canvas.height - chartMargin.bottom - volumeHeight;

        data.forEach(candle => {
            const x = xScale(candle.time);
            const volume = Math.random() * volumeHeight;

            ctx.fillStyle = candle.open > candle.close ? 'rgba(242, 54, 69, 0.5)' : 'rgba(0, 184, 151, 0.5)';
            ctx.fillRect(x - candleWidth / 2, volumeTop + (volumeHeight - volume), candleWidth, volume);
        });

        // Add 'TradingView' watermark
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.font = '14px Arial';
        ctx.fillText('TradingView', chartMargin.left + 10, canvas.height - chartMargin.bottom - 10);

        return true;
    }

    // Try to initialize TradingView chart first
    try {
        if (typeof LightweightCharts === 'undefined') {
            throw new Error('LightweightCharts library not loaded');
        }

        const chart = LightweightCharts.createChart(chartContainer, {
            width: chartContainer.clientWidth,
            height: 400,
            layout: {
                background: { type: 'solid', color: '#000000' },
                textColor: '#D9D9D9',
            },
            grid: {
                vertLines: { color: '#1a1a1a', style: 1 },
                horzLines: { color: '#1a1a1a', style: 1 },
            },
            crosshair: {
                mode: LightweightCharts.CrosshairMode.Normal,
                vertLine: {
                    color: '#505050',
                    width: 1,
                    style: 1,
                    labelBackgroundColor: '#232323',
                },
                horzLine: {
                    color: '#505050',
                    width: 1,
                    style: 1,
                    labelBackgroundColor: '#232323',
                },
            },
            timeScale: {
                borderColor: '#1a1a1a',
                timeVisible: true,
                secondsVisible: false,
            },
            rightPriceScale: {
                borderColor: '#1a1a1a',
            },
            watermark: {
                visible: true,
                text: 'TradingView',
                color: 'rgba(255, 255, 255, 0.1)',
                fontSize: 24,
                horzAlign: 'left',
                vertAlign: 'bottom',
            }
        });

        console.log("Chart created successfully");

        // Resize chart on window resize
        window.addEventListener('resize', () => {
            chart.applyOptions({
                width: chartContainer.clientWidth,
                height: chartContainer.clientHeight,
            });
        });

        // Create candlestick series
        const candleSeries = chart.addCandlestickSeries({
            upColor: '#00b897',
            downColor: '#f23645',
            borderUpColor: '#00b897',
            borderDownColor: '#f23645',
            wickUpColor: '#00b897',
            wickDownColor: '#f23645',
        });

        // Add volume series
        const volumeSeries = chart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: '',
            scaleMargins: {
                top: 0.85,
                bottom: 0,
            },
        });

        // Sample data for Bitcoin price
        const candlestickData = [
            { time: '2023-01-01', open: 83000, high: 83500, low: 82500, close: 83200 },
            { time: '2023-01-02', open: 83200, high: 84000, low: 83000, close: 83800 },
            { time: '2023-01-10', open: 86500, high: 87000, low: 86200, close: 86800 },
            { time: '2023-01-20', open: 89000, high: 89500, low: 88800, close: 88500 },
            { time: '2023-02-01', open: 86100, high: 86500, low: 85800, close: 86300 },
            { time: '2023-02-10', open: 88200, high: 88700, low: 88000, close: 88500 },
            { time: '2023-02-20', open: 90800, high: 91200, low: 90500, close: 91000 },
            { time: '2023-03-01', open: 85841.5, high: 86094.0, low: 85600.0, close: 86064.5 }
        ];

        // Create volume data that matches candlestick data
        const volumeData = candlestickData.map(item => ({
            time: item.time,
            value: Math.random() * 50 + 100,
            color: item.close >= item.open ? '#26a69a' : '#ef5350'
        }));

        // Set the last volume to match the image
        volumeData[volumeData.length - 1].value = 169.03616;

        // Set the data for the series
        candleSeries.setData(candlestickData);
        volumeSeries.setData(volumeData);

        // Focus chart on specific time range
        chart.timeScale().fitContent();

        console.log("Chart data set successfully");
    } catch (error) {
        console.error('Error initializing TradingView chart:', error);
        // Fall back to simple canvas chart
        createFallbackChart();
    }

    // Populate order book
    const sellOrdersContainer = document.querySelector('.sell-orders');
    const buyOrdersContainer = document.querySelector('.buy-orders');

    // Generate sell orders
    const sellOrders = [
        { price: 86069.1, amount: 0.03507, total: 0.67155 },
        { price: 86066.0, amount: 0.02870, total: 0.63648 },
        { price: 86064.5, amount: 0.03130, total: 0.60778 },
        { price: 86064.0, amount: 0.02870, total: 0.57648 },
        { price: 86063.9, amount: 0.00083, total: 0.54778 },
        { price: 86062.5, amount: 0.03507, total: 0.54695 },
        { price: 86062.1, amount: 0.12436, total: 0.51188 },
        { price: 86062.0, amount: 0.02870, total: 0.38752 },
        { price: 86061.9, amount: 0.05477, total: 0.35882 },
        { price: 86060.1, amount: 0.30406, total: 0.30406 }
    ];

    // Generate buy orders
    const buyOrders = [
        { price: 86060.0, amount: 0.45549, total: 0.45549 },
        { price: 86059.9, amount: 0.03179, total: 0.48728 },
        { price: 86058.7, amount: 0.00102, total: 0.48830 },
        { price: 86058.1, amount: 0.04867, total: 0.53697 },
        { price: 86058.0, amount: 0.09355, total: 0.63052 },
        { price: 86056.0, amount: 0.02870, total: 0.65922 },
        { price: 86055.7, amount: 0.00580, total: 0.66502 },
        { price: 86055.6, amount: 0.02560, total: 0.69062 },
        { price: 86055.5, amount: 0.04000, total: 0.73062 },
        { price: 86055.4, amount: 0.01162, total: 0.74224 }
    ];

    if (sellOrdersContainer && buyOrdersContainer) {
        // Clear existing orders
        sellOrdersContainer.innerHTML = '';
        buyOrdersContainer.innerHTML = '';

        // Create order rows and add to containers - UPDATED FOR LOW OPACITY
        sellOrders.forEach(order => {
            const row = document.createElement('div');
            row.className = 'order-row';

            // Create low-opacity background div
            const bgDiv = document.createElement('div');
            bgDiv.className = 'row-bg sell-bg';
            bgDiv.style.position = 'absolute';
            bgDiv.style.left = '0';
            bgDiv.style.top = '0';
            bgDiv.style.height = '100%';
            bgDiv.style.width = '30%';
            bgDiv.style.backgroundColor = 'rgba(255, 68, 68, 0.3)';
            bgDiv.style.zIndex = '1';

            row.appendChild(bgDiv);

            row.innerHTML += `
                <div class="order-price">${order.price.toFixed(1)}</div>
                <div class="order-amount">${order.amount.toFixed(5)}</div>
                <div class="order-total">${order.total.toFixed(5)}</div>
            `;

            sellOrdersContainer.appendChild(row);
        });

        buyOrders.forEach(order => {
            const row = document.createElement('div');
            row.className = 'order-row';

            // Create low-opacity background div
            const bgDiv = document.createElement('div');
            bgDiv.className = 'row-bg buy-bg';
            bgDiv.style.position = 'absolute';
            bgDiv.style.left = '0';
            bgDiv.style.top = '0';
            bgDiv.style.height = '100%';
            bgDiv.style.width = '30%';
            bgDiv.style.backgroundColor = 'rgba(0, 186, 136, 0.3)';
            bgDiv.style.zIndex = '1';

            row.appendChild(bgDiv);

            row.innerHTML += `
                <div class="order-price">${order.price.toFixed(1)}</div>
                <div class="order-amount">${order.amount.toFixed(5)}</div>
                <div class="order-total">${order.total.toFixed(5)}</div>
            `;

            buyOrdersContainer.appendChild(row);
        });

        // Add hover effects to order rows
        document.querySelectorAll('.order-row').forEach(row => {
            row.addEventListener('mouseenter', function() {
                this.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
            });
            row.addEventListener('mouseleave', function() {
                this.style.backgroundColor = 'transparent';
            });
        });
    }

    // Handle range slider functionality
    const rangeSlider = document.querySelector('.range-slider');
    const amountInput = document.getElementById('amount-input');

    if (rangeSlider && amountInput) {
        rangeSlider.addEventListener('input', function() {
            const value = this.value;
            if (value > 0) {
                const btcAmount = (value / 10000).toFixed(5);
                amountInput.value = `${btcAmount} BTC`;
            } else {
                amountInput.value = 'Min 0.00001 BTC';
            }
        });
    }

    // Add event handlers for UI elements
    const closeTooltip = document.querySelector('.close-tooltip');
    const tooltip = document.querySelector('.tooltip');

    if (closeTooltip && tooltip) {
        closeTooltip.addEventListener('click', function() {
            tooltip.style.display = 'none';
        });
    }

    const closeQuickstart = document.querySelector('.close-quickstart');
    const quickStart = document.querySelector('.quick-start');

    if (closeQuickstart && quickStart) {
        closeQuickstart.addEventListener('click', function() {
            quickStart.style.display = 'none';
        });
    }

    // Initialize tab functionality
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            if (this.classList.contains('dropdown')) return;

            // Find all sibling tabs
            const siblings = Array.from(this.parentElement.children).filter(el =>
                el.classList.contains('tab')
            );

            // Remove active class from siblings
            siblings.forEach(sib => sib.classList.remove('active'));

            // Add active class to clicked tab
            this.classList.add('active');
        });
    });

    // Initialize timeframe selection
    document.querySelectorAll('.timeframe').forEach(timeframe => {
        timeframe.addEventListener('click', function() {
            if (this.classList.contains('dropdown')) return;

            // Find all timeframes
            const allTimeframes = document.querySelectorAll('.timeframe');

            // Remove active class
            allTimeframes.forEach(tf => tf.classList.remove('active'));

            // Add active to clicked timeframe
            this.classList.add('active');
        });
    });

    console.log('Trading interface initialization complete');
});