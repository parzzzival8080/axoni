import React, { useState, useEffect, useRef, useCallback } from 'react';
// For subtle animations
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faSync } from '@fortawesome/free-solid-svg-icons';
import { formatNumber } from '../../utils/numberFormatter';
import axios from 'axios';

const OrderBook = ({ cryptoData, forceRefresh = 0 }) => {
  // Feature detection (for older browsers, incognito, etc.)
  const supportsWebSocket = typeof window !== 'undefined' && 'WebSocket' in window;
  const supportsFetch = typeof window !== 'undefined' && 'fetch' in window;
  // If not supported, fallback to REST only
  const canUseWebSocket = supportsWebSocket && supportsFetch;

  const [activeTab, setActiveTab] = useState('orderbook');
  const [orderBook, setOrderBook] = useState({
    asks: [],
    bids: [],
    lastUpdateId: 0
  });
  const [decimalPrecision, setDecimalPrecision] = useState(2);
  const wsRef = useRef(null);
  const restFallbackRef = useRef(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef(null);
  const dataUpdateIntervalRef = useRef(null);
  const [dataSource, setDataSource] = useState('connecting');
  const lastUpdateTimeRef = useRef(Date.now());
  const updateQueueRef = useRef(null);
  const throttleInterval = 100; // Update UI max every 100ms (10 updates per second)

  // Mock data for order book to use as fallback
  const generateMockOrderBook = (basePrice = 86971.01) => {
    // Create more realistic spread between asks and bids
    const spread = basePrice * 0.0002; // 0.02% spread
    const askBasePrice = basePrice + (spread / 2);
    const bidBasePrice = basePrice - (spread / 2);
    
    return {
      asks: Array(10).fill().map((_, i) => {
        const price = askBasePrice + (i * (basePrice * 0.0001)); // Each level 0.01% apart
        const amount = 0.1 + (Math.random() * 0.3); // Random amount between 0.1 and 0.4
        // Make amounts larger as we go further from market price
        const scaledAmount = amount * (1 + (i * 0.2));
        return {
          price: price,
          amount: scaledAmount,
          total: 0, // Will be calculated below
          percentage: 0 // Will be calculated below
        };
      }).sort((a, b) => a.price - b.price),
      bids: Array(10).fill().map((_, i) => {
        const price = bidBasePrice - (i * (basePrice * 0.0001)); // Each level 0.01% apart
        const amount = 0.1 + (Math.random() * 0.3); // Random amount between 0.1 and 0.4
        // Make amounts larger as we go further from market price
        const scaledAmount = amount * (1 + (i * 0.2));
        return {
          price: price,
          amount: scaledAmount,
          total: 0, // Will be calculated below
          percentage: 0 // Will be calculated below
        };
      }).sort((a, b) => b.price - a.price),
      lastUpdateId: Date.now()
    };
  };
  
  // Extract coinPair from cryptoData or use a default
  const coinPair = cryptoData?.cryptoSymbol ? 
    `${cryptoData.cryptoSymbol.toLowerCase()}-usdt` : 'BTC-USDT';
    
  // Extract symbols for display
  const cryptoSymbol = cryptoData?.cryptoSymbol || 'BTC';
  const usdtSymbol = cryptoData?.usdtSymbol || 'USDT';
  const usdPrice = 1; // Assuming 1 USDT = 1 USD for simplicity

  // Retry logic for REST API
  const MAX_REST_RETRIES = 5;
  const REST_BACKOFF_BASE = 2000; // ms

  // Function to process order book data (common for both WebSocket and REST)
  const processOrderBookData = useCallback((asks, bids) => {
    if (!asks || !bids || !Array.isArray(asks) || !Array.isArray(bids)) {
      console.error('[OrderBook] Invalid order book data structure', { asks, bids });
      return null;
    }

    // Process asks and bids to the format we need
    const processedAsks = asks
      .map(item => ({
        price: parseFloat(item[0]),
        amount: parseFloat(item[1]),
        total: 0 // Will be calculated below
      }))
      .sort((a, b) => a.price - b.price)
      .slice(0, 20); // Increased to 20 for more depth visibility
    
    const processedBids = bids
      .map(item => ({
        price: parseFloat(item[0]),
        amount: parseFloat(item[1]),
        total: 0 // Will be calculated below
      }))
      .sort((a, b) => b.price - a.price)
      .slice(0, 20); // Increased to 20 for more depth visibility
    
    // Calculate cumulative totals
    let askTotal = 0;
    processedAsks.forEach(ask => {
      askTotal += ask.amount;
      ask.total = askTotal;
    });
    
    let bidTotal = 0;
    processedBids.forEach(bid => {
      bidTotal += bid.amount;
      bid.total = bidTotal;
    });
    
    // Find the maximum total for percentage calculation
    const maxTotal = Math.max(
      processedAsks.length > 0 ? processedAsks[processedAsks.length - 1].total : 0,
      processedBids.length > 0 ? processedBids[processedBids.length - 1].total : 0
    );
    
    // Calculate percentages for visualization
    processedAsks.forEach(ask => {
      ask.percentage = calculatePercentage(ask.total, maxTotal);
    });
    
    processedBids.forEach(bid => {
      bid.percentage = calculatePercentage(bid.total, maxTotal);
    });
    
    // Update current price from the first bid (highest buy price)
    if (processedBids.length > 0) {
      setCurrentPrice(processedBids[0].price);
    } else if (processedAsks.length > 0) {
      setCurrentPrice(processedAsks[0].price);
    }
    
    return {
      asks: processedAsks,
      bids: processedBids,
      lastUpdateId: Date.now()
    };
  }, []);

  // Calculate percentages for depth visualization with a consistent approach
  const calculatePercentage = (total, maxTotal) => {
    if (!maxTotal) return 0;
    // Scale to max 90% width and apply a sqrt scale for better visualization
    // of small vs large orders
    return Math.min(90, Math.sqrt(total / maxTotal) * 90);
  };

  // Fetch order book data from REST API as fallback
  const fetchOrderBookREST = useCallback(async (retry = 0) => {
    try {
      // Clear any existing interval
      if (restFallbackRef.current) {
        clearInterval(restFallbackRef.current);
      }
      
      // Set up a function to fetch data using OKX REST API
      const fetchData = async (retry = 0) => {
        try {
          // Format symbol for OKX API request (BASE-QUOTE format)
          const symbol = cryptoData?.cryptoSymbol?.toUpperCase() || 'BTC';
          const instId = `${symbol}-USDT`;
          const apiUrl = `https://www.okx.com/api/v5/market/books?instId=${instId}&sz=20`;
          
          console.log('[OrderBook] Fetching orderbook from OKX API:', apiUrl);
          const response = await axios.get(apiUrl);
          console.log('[OrderBook] Raw OKX API response:', response.data);
          
          if (response.data && response.data.code === '0' && response.data.data && 
              Array.isArray(response.data.data) && response.data.data.length > 0) {
            
            const orderBookData = response.data.data[0];
            
            if (orderBookData && orderBookData.asks && orderBookData.bids) {
              // Process the OKX format data
              const processedData = processOrderBookData(orderBookData.asks, orderBookData.bids);
              
              if (processedData) {
                setOrderBook(processedData);
                setIsLoading(false);
                setConnectionStatus('fallback');
                setDataSource('OKX REST API');
                lastUpdateTimeRef.current = Date.now();
                
                // Update current price from the first bid (highest bid)
                if (orderBookData.bids && orderBookData.bids.length > 0) {
                  setCurrentPrice(parseFloat(orderBookData.bids[0][0]));
                }
              }
            } else {
              console.error('[OrderBook] Malformed OKX REST API response structure:', orderBookData);
              throw new Error('Malformed OKX REST API response structure');
            }
          } else {
            console.error('[OrderBook] Malformed OKX REST API response:', response.data);
            throw new Error('Malformed OKX REST API response');
          }
        } catch (error) {
          console.error('[OrderBook] OKX REST API fetch error:', error);
          // If all retries failed, show error state
          if (retry < MAX_REST_RETRIES) {
            setTimeout(() => fetchData(retry + 1), REST_BACKOFF_BASE * Math.pow(2, retry));
          } else {
            setConnectionStatus('error');
            setIsLoading(false);
          }
        }
      };
      
      // Fetch immediately
      await fetchData();
      
      // Then set up interval for regular updates
      restFallbackRef.current = setInterval(fetchData, 5000);
      
      return () => {
        if (restFallbackRef.current) {
          clearInterval(restFallbackRef.current);
        }
      };
    } catch (error) {
      console.error('[OrderBook] Error setting up REST fallback:', error);
    }
  }, [cryptoData, processOrderBookData]);

  // Use REST API as fallback if WebSocket fails
  useEffect(() => {
    if (connectionStatus === 'error' || connectionStatus === 'failed') {
      if (!restFallbackRef.current) {
        restFallbackRef.current = true;
        fetchOrderBookREST();
        
        // Set up periodic refresh for REST API fallback
        dataUpdateIntervalRef.current = setInterval(() => {
          fetchOrderBookREST();
        }, 10000); // Refresh every 10 seconds
      }
    }
    
    return () => {
      if (dataUpdateIntervalRef.current) {
        clearInterval(dataUpdateIntervalRef.current);
      }
    };
  }, [connectionStatus]);

  // Always use REST API for orderbook (same as spot)
  useEffect(() => {
    setIsLoading(true);
    setConnectionStatus('fallback');
    fetchOrderBookREST();
    return () => {
      // Clear any existing data update interval
      if (dataUpdateIntervalRef.current) {
        clearInterval(dataUpdateIntervalRef.current);
        dataUpdateIntervalRef.current = null;
      }
    };
  }, [forceRefresh]);

  const connectWebSocket = () => {
    console.log('[OrderBook] Connecting to OKX WebSocket...');
    
    // Use OKX WebSocket endpoint
    const wsEndpoint = 'wss://ws.okx.com:8443/ws/v5/public';
    const wsEndpoints = [wsEndpoint];

    // Format the trading pair for OKX (BASE-QUOTE format)
    const orderCoin = `${cryptoSymbol}-USDT`;
    console.log('[OrderBook] OKX WebSocket endpoint:', wsEndpoint, 'for instrument:', orderCoin);
    
    tryAlternateEndpoints(wsEndpoints, 0);
    
    // Function to try alternate WebSocket endpoints
    function tryAlternateEndpoints(urls, index) {
      if (index >= urls.length) {
        console.error('[OrderBook] All WebSocket endpoints failed');
        setConnectionStatus('failed');
        setIsLoading(false);
        return;
      }
      
      console.log(`[OrderBook] Trying WebSocket endpoint ${index + 1}/${urls.length}: ${urls[index]}`);
      
      try {
        const socket = new WebSocket(urls[index]);
        
        socket.onopen = function() {
          console.log(`[OrderBook] WebSocket connected to ${urls[index]}`);
          wsRef.current = socket;
          setConnectionStatus('connected');
          setDataSource('OKX WebSocket');
          setIsLoading(false);
          
          // Subscribe to order book updates using OKX format with higher frequency
          const subscriptionMessage = {
            "op": "subscribe",
            "args": [
              {
                "channel": "books",  // Use 'books' instead of 'books5' for more frequent updates
                "instId": orderCoin,
                "sz": "400"  // Request more depth levels (up to 400)
              }
            ]
          };
          
          console.log('[OrderBook] Sending subscription message:', JSON.stringify(subscriptionMessage));
          socket.send(JSON.stringify(subscriptionMessage));
          
          // If we have an update queue, process it now
          if (updateQueueRef.current) {
            const processedData = processOrderBookData(
              updateQueueRef.current.asks,
              updateQueueRef.current.bids
            );
            if (processedData) {
              setOrderBook(processedData);
            }
            updateQueueRef.current = null;
          }
        };
        
        socket.onerror = function(error) {
          console.error(`[OrderBook] WebSocket error for ${urls[index]}:`, error);
          tryAlternateEndpoints(urls, index + 1);
        };
        
        socket.onclose = function() {
          console.log(`[OrderBook] WebSocket closed for ${urls[index]}`);
        };
        
        setupEventHandlers(socket);
      } catch (error) {
        console.error(`[OrderBook] Error creating WebSocket for ${urls[index]}:`, error);
        tryAlternateEndpoints(urls, index + 1);
      }
    }
    
    // Function to setup WebSocket event handlers
    function setupEventHandlers(socket) {
      // Handle incoming messages
      socket.onmessage = function(event) {
        try {
          const message = JSON.parse(event.data);
          
          // Handle subscription confirmation
          if (message && message.event === 'subscribe') {
            console.log("[OrderBook] Subscription confirmed:", message);
            return;
          }
          
          // Handle order book data updates
          if (message && message.data && Array.isArray(message.data) && message.data.length > 0) {
            const orderBookData = message.data[0]; // OKX format has data in an array
            
            if (orderBookData && orderBookData.asks && Array.isArray(orderBookData.asks) &&
                orderBookData.bids && Array.isArray(orderBookData.bids)) {
              
              // Update last update time
              lastUpdateTimeRef.current = Date.now();
              
              // Format OKX data for our processOrderBookData function
              // OKX format: [price, size, ...] -> convert to [[price, size], ...]
              const formattedAsks = orderBookData.asks;
              const formattedBids = orderBookData.bids;
              
              // If we're throttling updates, queue this update
              if (updateQueueRef.current) {
                updateQueueRef.current = {
                  asks: formattedAsks,
                  bids: formattedBids
                };
                return;
              }
              
              // Process the data
              const processedData = processOrderBookData(formattedAsks, formattedBids);
              if (processedData) {
                setOrderBook(processedData);
                
                // Update current price from the first bid (highest bid)
                if (formattedBids.length > 0) {
                  setCurrentPrice(parseFloat(formattedBids[0][0]));
                }
                
                // Set up throttling for next update with requestAnimationFrame for smoother updates
                updateQueueRef.current = {};
                requestAnimationFrame(() => {
                  setTimeout(() => {
                    updateQueueRef.current = null;
                  }, throttleInterval);
                });
              }
            } else {
              console.error("[OrderBook] Invalid format for order book data:", orderBookData);
            }
          } else if (message.event === 'error') {
            console.error("[OrderBook] WebSocket error message:", message);
          }
        } catch (error) {
          console.error('[OrderBook] Error processing WebSocket message:', error);
        }
      };
      
      // Handle WebSocket closure
      socket.onclose = function(event) {
        console.log('[OrderBook] WebSocket connection closed:', event);
        
        // Only attempt reconnect if this is the current socket
        if (socket === wsRef.current) {
          wsRef.current = null;
          
          if (reconnectAttempts < maxReconnectAttempts) {
            console.log(`[OrderBook] Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})...`);
            setConnectionStatus('reconnecting');
            
            // Exponential backoff for reconnect
            const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              setReconnectAttempts(prev => prev + 1);
              connectWebSocket();
            }, backoffTime);
          } else {
            console.log('[OrderBook] Max reconnect attempts reached, falling back to REST API');
            setConnectionStatus('error');
          }
        }
      };
    }
    
    // Handle successful connection
    function onopen() {
      console.log('[OrderBook] WebSocket connected successfully');
      setConnectionStatus('connected');
      setDataSource('OKX WebSocket');
      setIsLoading(false);
    }
    
    // Handle connection error
    function onerror(error) {
      console.error('[OrderBook] WebSocket connection error:', error);
      setConnectionStatus('error');
      setIsLoading(false);
    }
  };

  const handleManualReconnect = () => {
    handleReconnect();
  };

  // Subtle animation for loading
  const spin = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  `;
  const Spinner = styled(FontAwesomeIcon)`
    animation: ${spin} 1s linear infinite;
    color: #fff;
  `;
  const LoadingText = styled.div`
    color: #aaa;
    margin-top: 8px;
    font-size: 1rem;
  `;
  const LoadingSpinner = () => (
    <div className="order-book-loading">
      <Spinner icon={faSpinner} spin className="spinner" />
      <LoadingText>Loading order book data...</LoadingText>
    </div>
  );

  // Subtle error animation
  const shake = keyframes`
    0% { transform: translateX(0); }
    20% { transform: translateX(-3px); }
    40% { transform: translateX(3px); }
    60% { transform: translateX(-2px); }
    80% { transform: translateX(2px); }
    100% { transform: translateX(0); }
  `;
  const ErrorIcon = styled(FontAwesomeIcon)`
    color: #ff5b5b;
    animation: ${shake} 0.6s;
  `;
  const ErrorText = styled.div`
    color: #ff5b5b;
    margin: 8px 0;
    font-size: 1rem;
  `;
  const ConnectionError = () => (
    <div className="order-book-error">
      <ErrorIcon icon={faExclamationTriangle} className="error-icon" />
      <ErrorText>
        Unable to connect to order book data.<br />
        Please check your connection or try again.
      </ErrorText>
      <button className="reconnect-button" onClick={handleManualReconnect}>
        <FontAwesomeIcon icon={faSync} /> Reconnect
      </button>
    </div>
  );

  return (
    <div className="order-book-container md:relative md:z-auto z-10 bg-okx-primary border-t border-okx-border md:border-t-0">
      <div className="order-book-header">
        <div className="order-book-tabs">
          <div 
            className={`tab ${activeTab === 'orderbook' ? 'active' : ''}`}
            onClick={() => handleTabChange('orderbook')}
          >
            Order Book
          </div>
          <div 
            className={`tab ${activeTab === 'trades' ? 'active' : ''}`}
            onClick={() => handleTabChange('trades')}
          >
            Trades
          </div>
        </div>
        <div className="order-book-controls">
          <div className="precision-control">
            {[0, 1, 2, 3, 4].map(precision => (
              <div 
                key={precision}
                className={`decimal ${decimalPrecision === precision ? 'active' : ''}`}
                onClick={() => handlePrecisionChange(precision)}
              >
                {precision}
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeTab === 'orderbook' ? (
        <div className="order-book">
          <div className="book-headers">
            <div className="price-header">Price ({usdtSymbol})</div>
            <div>Amount ({cryptoSymbol})</div>
            <div className="total">Total</div>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : ['error', 'failed', 'disconnected'].includes(connectionStatus) && orderBook.asks.length === 0 ? (
            <ConnectionError />
          ) : (
            <>
              <div className="sell-orders">
                {orderBook.asks.slice(0, 8).map((ask, index) => (
                  <div className="order-row" key={`ask-${index}`}> 
                    <div className="depth-visualization" style={{ width: `${ask.percentage}%` }}></div>
                    <div className="price sell">
                      {formatNumber(ask.price, decimalPrecision)}
                    </div>
                    <div className="amount">
                      {formatNumber(ask.amount, 5)}
                    </div>
                    <div className="total">
                      {formatNumber(ask.total, 5)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="current-price">
                <div className="price-value">
                  {currentPrice ? formatNumber(currentPrice, decimalPrecision) : '0.00'} {usdtSymbol}
                </div>
                <div className="price-usd">
                  ${currentPrice ? formatNumber(currentPrice * usdPrice, 2) : '0.00'} USD
                </div>
              </div>

              <div className="buy-orders">
                {orderBook.bids.slice(0, 8).map((bid, index) => (
                  <div className="order-row" key={`bid-${index}`}> 
                    <div className="depth-visualization" style={{ width: `${bid.percentage}%` }}></div>
                    <div className="price buy">
                      {formatNumber(bid.price, decimalPrecision)}
                    </div>
                    <div className="amount">
                      {formatNumber(bid.amount, 5)}
                    </div>
                    <div className="total">
                      {formatNumber(bid.total, 5)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="trades-container">
          <div className="trades-list">
            <div className="no-data">
              <span>No trade data available</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="connection-status-indicator">
        <span className={`status-dot ${connectionStatus === 'connected' || connectionStatus === 'fallback' ? 'connected' : connectionStatus}`}></span>
        <span className="status-text">
          {connectionStatus === 'connected' && `Live (${dataSource})`}
          {connectionStatus === 'fallback' && 'Live (REST API)'}
          {connectionStatus === 'connecting' && 'Connecting...'}
          {connectionStatus === 'reconnecting' && 'Reconnecting...'}
          {connectionStatus === 'disconnected' && 'Disconnected'}
          {connectionStatus === 'error' && 'Error'}
          {connectionStatus === 'failed' && 'Failed'}
        </span>
      </div>
    </div>
  );
};

export default OrderBook;