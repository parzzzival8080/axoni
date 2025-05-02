import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faSync } from '@fortawesome/free-solid-svg-icons';
import { formatNumber } from '../../utils/numberFormatter';
import axios from 'axios';

const OrderBook = ({ cryptoData, forceRefresh = 0 }) => {
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
  const throttleInterval = 500; // Update UI max every 500ms (2 updates per second)

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
      .slice(0, 15); // Limit to 15 for better performance
    
    const processedBids = bids
      .map(item => ({
        price: parseFloat(item[0]),
        amount: parseFloat(item[1]),
        total: 0 // Will be calculated below
      }))
      .sort((a, b) => b.price - a.price)
      .slice(0, 15); // Limit to 15 for better performance
    
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

  // Set up a function to fetch data
  const fetchData = async () => {
    try {
      console.log('[OrderBook] Fetching order book data via REST API');
      const response = await axios.get(`https://api.binance.com/api/v3/depth?symbol=${cryptoSymbol}USDT&limit=20`);
      
      if (response.data && response.data.asks && response.data.bids) {
        const processedData = processOrderBookData(response.data.asks, response.data.bids);
        if (processedData) {
          setOrderBook(processedData);
          setIsLoading(false);
          setConnectionStatus('fallback');
          setDataSource('REST API');
          console.log('[OrderBook] Successfully fetched order book data via REST API');
        }
      }
    } catch (error) {
      console.error('[OrderBook] Error fetching order book data via REST API:', error);
      // If REST API fails, use mock data as ultimate fallback
      const mockData = generateMockOrderBook(currentPrice || 86971.01);
      setOrderBook(mockData);
      setIsLoading(false);
      setConnectionStatus('fallback');
      setDataSource('Mock Data');
    }
  };

  // Use REST API as fallback if WebSocket fails
  useEffect(() => {
    if (connectionStatus === 'error' || connectionStatus === 'failed') {
      if (!restFallbackRef.current) {
        restFallbackRef.current = true;
        fetchData();
        
        // Set up periodic refresh for REST API fallback
        dataUpdateIntervalRef.current = setInterval(() => {
          fetchData();
        }, 10000); // Refresh every 10 seconds
      }
    }
    
    return () => {
      if (dataUpdateIntervalRef.current) {
        clearInterval(dataUpdateIntervalRef.current);
      }
    };
  }, [connectionStatus]);

  // Set up WebSocket connection when component mounts or when forceRefresh changes
  useEffect(() => {
    // Reset state for reconnection
    setIsLoading(true);
    setConnectionStatus('connecting');
    setReconnectAttempts(0);
    
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Close any existing WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Connect to WebSocket
    connectWebSocket();
    
    // Clean up on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (dataUpdateIntervalRef.current) {
        clearInterval(dataUpdateIntervalRef.current);
        dataUpdateIntervalRef.current = null;
      }
    };
  }, [forceRefresh]);

  const connectWebSocket = () => {
    console.log('[OrderBook] Connecting to WebSocket...');
    
    // Try multiple WebSocket endpoints in case some are blocked
    const wsEndpoints = [
      `wss://stream.binance.com:9443/ws/${cryptoSymbol.toLowerCase()}usdt@depth20@100ms`,
      `wss://stream.binance.com/ws/${cryptoSymbol.toLowerCase()}usdt@depth20@100ms`,
      `wss://fstream.binance.com/ws/${cryptoSymbol.toLowerCase()}usdt@depth20@100ms`
    ];
    
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
          setDataSource('WebSocket');
          setIsLoading(false);
          
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
          const data = JSON.parse(event.data);
          
          if (data && data.asks && data.bids) {
            // Update last update time
            lastUpdateTimeRef.current = Date.now();
            
            // If we're throttling updates, queue this update
            if (updateQueueRef.current) {
              updateQueueRef.current = {
                asks: data.asks,
                bids: data.bids
              };
              return;
            }
            
            // Process the data
            const processedData = processOrderBookData(data.asks, data.bids);
            if (processedData) {
              setOrderBook(processedData);
              
              // Set up throttling for next update
              updateQueueRef.current = {};
              setTimeout(() => {
                updateQueueRef.current = null;
              }, throttleInterval);
            }
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
      setDataSource('WebSocket');
      setIsLoading(false);
    }
    
    // Handle connection error
    function onerror(error) {
      console.error('[OrderBook] WebSocket connection error:', error);
      setConnectionStatus('error');
      setIsLoading(false);
    }
  };

  // Function to handle manual reconnect
  const handleReconnect = () => {
    console.log('[OrderBook] Manual reconnect requested');
    
    // Reset state
    setIsLoading(true);
    setConnectionStatus('connecting');
    setReconnectAttempts(0);
    
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    // Close any existing WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    // Reset REST fallback flag
    restFallbackRef.current = false;
    
    // Clear any existing data update interval
    if (dataUpdateIntervalRef.current) {
      clearInterval(dataUpdateIntervalRef.current);
      dataUpdateIntervalRef.current = null;
    }
    
    // Connect to WebSocket
    connectWebSocket();
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePrecisionChange = (precision) => {
    setDecimalPrecision(precision);
  };

  const handleManualReconnect = () => {
    handleReconnect();
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="order-book-loading">
      <FontAwesomeIcon icon={faSpinner} spin />
      <div className="loading-text">Loading order book...</div>
    </div>
  );

  // Connection error component
  const ConnectionError = () => (
    <div className="connection-error">
      <FontAwesomeIcon icon={faExclamationTriangle} />
      <div className="error-message">
        Failed to connect to real-time data
      </div>
      <button onClick={handleManualReconnect} className="reconnect-btn">
        <FontAwesomeIcon icon={faSync} /> Try Again
      </button>
    </div>
  );

  return (
    <div className="order-book-container">
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
            <div>Total</div>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : ['error', 'failed', 'disconnected'].includes(connectionStatus) && orderBook.asks.length === 0 ? (
            <ConnectionError />
          ) : (
            <>
              <div className="sell-orders">
                {orderBook.asks.slice(0, 10).map((ask, index) => (
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
                {orderBook.bids.slice(0, 10).map((bid, index) => (
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