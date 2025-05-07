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
    
    // Calculate percentages for depth visualization
    const maxTotal = Math.max(
      processedAsks.length > 0 ? processedAsks[processedAsks.length - 1].total : 0,
      processedBids.length > 0 ? processedBids[processedBids.length - 1].total : 0
    );
    
    processedAsks.forEach(ask => {
      ask.percentage = calculatePercentage(ask.total, maxTotal);
    });
    
    processedBids.forEach(bid => {
      bid.percentage = calculatePercentage(bid.total, maxTotal);
    });
    
    return {
      asks: processedAsks,
      bids: processedBids,
      lastUpdateId: Date.now()
    };
  }, []);

  // Calculate percentages for depth visualization with a consistent approach
  const calculatePercentage = (total, maxTotal) => {
    if (!maxTotal) return 0;
    // Use a logarithmic scale to make smaller values more visible
    // Cap at 95% to ensure text remains readable
    return Math.min(95, Math.log(1 + (total / maxTotal) * 9) * 45);
  };

  // Update current price from order book data
  useEffect(() => {
    if (orderBook.asks.length > 0 && orderBook.bids.length > 0) {
      // Use the midpoint between best ask and best bid
      const bestAsk = orderBook.asks[0].price;
      const bestBid = orderBook.bids[0].price;
      const midPrice = (bestAsk + bestBid) / 2;
      setCurrentPrice(midPrice);
    } else if (cryptoData?.cryptoPrice) {
      // Fallback to the price from cryptoData
      setCurrentPrice(parseFloat(cryptoData.cryptoPrice));
    }
  }, [orderBook, cryptoData]);

  // Fetch order book data from REST API as fallback
  // Retry logic for REST API
const MAX_REST_RETRIES = 5;
const REST_BACKOFF_BASE = 2000; // ms

const fetchOrderBookREST = useCallback(async (retry = 0) => {
    try {
      // Clear any existing interval
      if (restFallbackRef.current) {
        clearInterval(restFallbackRef.current);
      }
      
      // Set up a function to fetch data
      const fetchData = async () => {
        try {
           // Format symbol for API request
           const symbol = cryptoData?.cryptoSymbol?.toUpperCase() || 'BTC';
           const apiUrl = `https://api.mpctoken.com/api/v3/depth?symbol=${symbol}USDT&limit=20`;
           
           const response = await axios.get(apiUrl);
           if (response.data && response.data.asks && response.data.bids) {
             const processedData = processOrderBookData(response.data.asks, response.data.bids);
             if (processedData) {
               setOrderBook(processedData);
               setIsLoading(false);
               setConnectionStatus('fallback');
               setDataSource('REST API');
               lastUpdateTimeRef.current = Date.now();
             }
           } else {
             throw new Error('Malformed REST API response');
           }
         } catch (error) {
           console.error('[OrderBook] REST API fetch error:', error);
           // If all retries failed, show error state
           if (retry < MAX_REST_RETRIES) {
             setTimeout(() => fetchOrderBookREST(retry + 1), REST_BACKOFF_BASE * Math.pow(2, retry));
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

  // Fallback to REST API if WebSocket fails
  useEffect(() => {
    if (connectionStatus === 'failed' || connectionStatus === 'error') {
      console.log('[OrderBook] WebSocket failed, falling back to REST API');
      fetchOrderBookREST();
    }
    
    return () => {
      if (restFallbackRef.current) {
        clearInterval(restFallbackRef.current);
      }
    };
  }, [connectionStatus, fetchOrderBookREST]);

  // Throttled update function to prevent too many re-renders
  useEffect(() => {
    // Set up the update queue processor
    updateQueueRef.current = setInterval(() => {
      const now = Date.now();
      // If it's been more than 10 seconds since the last update and we're supposed to be connected,
      // consider the connection stale
      if (now - lastUpdateTimeRef.current > 10000 && 
          (connectionStatus === 'connected' || connectionStatus === 'fallback')) {
        console.log('[OrderBook] Connection appears stale, attempting to reconnect...');
        setConnectionStatus('reconnecting');
        handleReconnect();
      }
    }, throttleInterval);
    
    return () => {
      if (updateQueueRef.current) {
        clearInterval(updateQueueRef.current);
      }
    };
  }, [connectionStatus]);

  // Force refresh when the forceRefresh prop changes
  useEffect(() => {
    if (forceRefresh > 0) {
      console.log('[OrderBook] Force refresh triggered');
      handleReconnect();
    }
  }, [forceRefresh]);

  // Connect to WebSocket when component mounts or when symbol changes
  useEffect(() => {
    console.log('[OrderBook] Setting up WebSocket connection for', coinPair);
    setIsLoading(true);
    if (canUseWebSocket) {
      connectWebSocket();
    } else {
      // Fallback to REST if WebSocket/fetch not supported
      setConnectionStatus('fallback');
      fetchOrderBookREST();
    }
    
    return () => {
      // Clean up WebSocket connection when component unmounts
      if (wsRef.current) {
        console.log('[OrderBook] Closing WebSocket connection');
        wsRef.current.close();
        wsRef.current = null;
      }
      
      // Clear any intervals
      if (dataUpdateIntervalRef.current) {
        clearInterval(dataUpdateIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (restFallbackRef.current) {
        clearInterval(restFallbackRef.current);
      }
      if (updateQueueRef.current) {
        clearInterval(updateQueueRef.current);
      }
    };
  }, [coinPair]);

  const connectWebSocket = () => {
    // Clean up any existing connection
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setConnectionStatus('connecting');
    
    // Format symbol for WebSocket
    const symbol = cryptoData?.cryptoSymbol?.toUpperCase() || 'BTC';
    
    // Try multiple WebSocket endpoints in case one fails
    const wsEndpoints = [
      `wss://stream.mpctoken.com/ws/${symbol.toLowerCase()}usdt@depth`,
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}usdt@depth20@100ms`
    ];
    
    console.log('[OrderBook] Attempting to connect to WebSocket endpoints');
    tryAlternateEndpoints(wsEndpoints, 0);
    
    // Function to try alternate WebSocket endpoints
    function tryAlternateEndpoints(urls, index) {
      if (index >= urls.length) {
        console.error('[OrderBook] All WebSocket endpoints failed');
        setConnectionStatus('failed');
        setIsLoading(false);
        return;
      }
      
      console.log(`[OrderBook] Trying WebSocket endpoint: ${urls[index]}`);
      
      try {
        const socket = new WebSocket(urls[index]);
        
        socket.onopen = () => {
          console.log(`[OrderBook] Connected to WebSocket: ${urls[index]}`);
          wsRef.current = socket;
          setConnectionStatus('connected');
          setDataSource('WebSocket');
          setIsLoading(false);
          setReconnectAttempts(0);
          
          // If this is Binance's WebSocket, we need to send a subscription message
          if (urls[index].includes('binance')) {
            const subscribeMsg = {
              method: "SUBSCRIBE",
              params: [`${symbol.toLowerCase()}usdt@depth20@100ms`],
              id: 1
            };
            socket.send(JSON.stringify(subscribeMsg));
          }
        };
        
        socket.onerror = (error) => {
          console.error(`[OrderBook] WebSocket error with ${urls[index]}:`, error);
          socket.close();
          tryAlternateEndpoints(urls, index + 1);
        };
        
        socket.onclose = () => {
          console.log(`[OrderBook] WebSocket closed: ${urls[index]}`);
        };
        
        // Set up event handlers once connection is established
        setupEventHandlers(socket);
      } catch (error) {
        console.error(`[OrderBook] Error creating WebSocket for ${urls[index]}:`, error);
        tryAlternateEndpoints(urls, index + 1);
      }
    }
    
    // Function to setup WebSocket event handlers
    function setupEventHandlers(socket) {
      if (!socket) return;
      
      // Handle incoming messages
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different WebSocket response formats
          if (data.asks && data.bids) {
            // Direct order book format
            const processedData = processOrderBookData(data.asks, data.bids);
            if (processedData) {
              setOrderBook(processedData);
              lastUpdateTimeRef.current = Date.now();
            }
          } else if (data.data && data.data.asks && data.data.bids) {
            // Nested data format
            const processedData = processOrderBookData(data.data.asks, data.data.bids);
            if (processedData) {
              setOrderBook(processedData);
              lastUpdateTimeRef.current = Date.now();
            }
          } else if (data.e === 'depthUpdate') {
            // Binance incremental update format - we'd need to maintain a local order book
            // For simplicity, we're just using the full snapshot endpoint
            console.log('[OrderBook] Received incremental update from Binance');
          } else {
            // Unknown format
            console.warn('[OrderBook] Unknown WebSocket message format:', data);
          }
        } catch (error) {
          console.error('[OrderBook] Error processing WebSocket message:', error);
        }
      };
      
      // Handle WebSocket closure
      socket.onclose = (event) => {
        console.log('[OrderBook] WebSocket connection closed:', event);
        
        if (wsRef.current === socket) {
          wsRef.current = null;
          
          // Only attempt to reconnect if we weren't deliberately closing
          if (connectionStatus !== 'disconnected') {
            if (reconnectAttempts < maxReconnectAttempts) {
              console.log(`[OrderBook] Attempting to reconnect (${reconnectAttempts + 1}/${maxReconnectAttempts})...`);
              setConnectionStatus('reconnecting');
              
              // Exponential backoff for reconnect attempts
              const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
              reconnectTimeoutRef.current = setTimeout(() => {
                setReconnectAttempts(prev => prev + 1);
                connectWebSocket();
              }, backoffTime);
            } else {
              console.error('[OrderBook] Max reconnect attempts reached');
              setConnectionStatus('failed');
              // Fall back to REST API
              fetchOrderBookREST();
            }
          }
        }
      };
    }
    
    // Handle successful connection
    function onopen() {
      console.log('[OrderBook] WebSocket connection established');
      setConnectionStatus('connected');
      setIsLoading(false);
      setReconnectAttempts(0);
    }
    
    // Handle connection error
    function onerror(error) {
      console.error('[OrderBook] WebSocket connection error:', error);
      setConnectionStatus('error');
      
      // If we have no order book data yet, show loading state
      if (orderBook.asks.length === 0 && orderBook.bids.length === 0) {
        setIsLoading(true);
      }
    }
  };

  // Function to handle manual reconnect
  const handleReconnect = () => {
    console.log('[OrderBook] Manual reconnect triggered');
    
    // Clean up existing connections
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (restFallbackRef.current) {
      clearInterval(restFallbackRef.current);
    }
    
    // Reset state
    setConnectionStatus('connecting');
    setIsLoading(true);
    setReconnectAttempts(0);
    
    // Try to connect again
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

  // Extract symbols for display
  const cryptoSymbol = cryptoData?.cryptoSymbol || 'BTC';
  const usdtSymbol = cryptoData?.usdtSymbol || 'USDT';
  const usdPrice = 1; // Assuming 1 USDT = 1 USD for simplicity

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
        <div className="decimals">
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
                {orderBook.asks.slice(0, 8).map((ask, index) => (
                  <div className="order-row" key={`ask-${index}`}>
                    <div className="order-bar sell" style={{ width: `${ask.percentage}%` }}></div>
                    <div className="order-price sell">
                      {formatNumber(ask.price, decimalPrecision)}
                    </div>
                    <div className="order-amount">
                      {formatNumber(ask.amount, 5)}
                    </div>
                    <div className="order-total">
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
                    <div className="order-bar buy" style={{ width: `${bid.percentage}%` }}></div>
                    <div className="order-price buy">
                      {formatNumber(bid.price, decimalPrecision)}
                    </div>
                    <div className="order-amount">
                      {formatNumber(bid.amount, 5)}
                    </div>
                    <div className="order-total">
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