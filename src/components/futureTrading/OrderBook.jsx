import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    
    // Find the highest total for scaling the depth visualization
    const maxTotal = Math.max(
      processedAsks.length > 0 ? processedAsks[processedAsks.length - 1].total : 0,
      processedBids.length > 0 ? processedBids[processedBids.length - 1].total : 0
    );
    
    // Set current price as the first bid price (highest buy offer)
    if (processedBids.length > 0) {
      setCurrentPrice(processedBids[0].price);
    }
    
    // Calculate percentages for depth visualization with a consistent approach
    const calculatePercentage = (total) => {
      if (total === 0) return 0;
      const rawPercentage = (total / maxTotal) * 100;
      return Math.min(Math.max(rawPercentage, 1), 95);
    };
    
    return {
      asks: processedAsks.map(ask => ({
        ...ask,
        percentage: calculatePercentage(ask.total)
      })),
      bids: processedBids.map(bid => ({
        ...bid,
        percentage: calculatePercentage(bid.total)
      })),
      lastUpdateId: Date.now()
    };
  }, []);

  // Throttled update function
  const updateOrderBookThrottled = useCallback((processedData) => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    
    // Clear any pending updates
    if (updateQueueRef.current) {
      clearTimeout(updateQueueRef.current);
    }
    
    // If enough time has passed, update immediately
    if (timeSinceLastUpdate >= throttleInterval) {
      setOrderBook(processedData);
      lastUpdateTimeRef.current = now;
    } else {
      // Otherwise, schedule update for when throttle interval has passed
      updateQueueRef.current = setTimeout(() => {
        setOrderBook(processedData);
        lastUpdateTimeRef.current = Date.now();
        updateQueueRef.current = null;
      }, throttleInterval - timeSinceLastUpdate);
    }
  }, [throttleInterval]);

  // Fetch order book data via REST API
  const fetchOrderBookREST = useCallback(async () => {
    try {
      // Format symbol for API request
      const symbol = coinPair.replace('-', '').toUpperCase();
      
      // Use Binance API which is more reliable for public data
      const response = await axios.get(`https://fapi.binance.com/fapi/v1/depth?symbol=${symbol}&limit=20`);
      
      if (response.data && response.data.asks && response.data.bids) {
        console.log('[OrderBook] REST data received');
        
        const processedData = processOrderBookData(response.data.asks, response.data.bids);
        if (processedData) {
          updateOrderBookThrottled(processedData);
          setIsLoading(false);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('[OrderBook] REST API error:', error);
      return false;
    }
  }, [coinPair, processOrderBookData, updateOrderBookThrottled]);

  // Start periodic REST data updates as a fallback
  const startRESTFallback = useCallback(() => {
    setDataSource('rest');
    
    // Clear any existing interval
    if (dataUpdateIntervalRef.current) {
      clearInterval(dataUpdateIntervalRef.current);
    }
    
    // Initial fetch
    fetchOrderBookREST();
    
    // Setup interval for regular updates
    dataUpdateIntervalRef.current = setInterval(() => {
      fetchOrderBookREST();
    }, 3000); // Update every 3 seconds
    
    // Store reference for cleanup
    restFallbackRef.current = dataUpdateIntervalRef.current;
  }, [fetchOrderBookREST]);

  // Add useEffect to handle forceRefresh prop changes
  useEffect(() => {
    if (forceRefresh > 0) {
      console.log('[OrderBook] Force refresh triggered:', forceRefresh);
      
      // If we have a WebSocket connection, just manually trigger a REST fetch
      // This ensures we get fresh data after a trade without disrupting the WebSocket
      fetchOrderBookREST().then(success => {
        if (success) {
          console.log('[OrderBook] Refresh after trade successful');
        } else {
          console.error('[OrderBook] Failed to refresh after trade, retrying...');
          // Try one more time after a short delay
          setTimeout(() => {
            fetchOrderBookREST();
          }, 1000);
        }
      });
      
      // Also force a reconnect of the WebSocket after a brief delay
      // This ensures we're getting the freshest stream of data
      setTimeout(() => {
        if (wsRef.current && connectionStatus === 'connected') {
          console.log('[OrderBook] Reconnecting WebSocket to get fresh data stream');
          connectWebSocket();
        }
      }, 2000);
    }
  }, [forceRefresh, fetchOrderBookREST]);

  useEffect(() => {
    if (coinPair) {
      setIsLoading(true);
      setConnectionStatus('connecting');
      connectWebSocket();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (dataUpdateIntervalRef.current) {
        clearInterval(dataUpdateIntervalRef.current);
      }
      if (updateQueueRef.current) {
        clearTimeout(updateQueueRef.current);
      }
    };
  }, [coinPair, decimalPrecision]);

  const connectWebSocket = () => {
    // Clear any existing WebSocket
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    // Clear any REST fallback interval
    if (dataUpdateIntervalRef.current) {
      clearInterval(dataUpdateIntervalRef.current);
    }

    try {
      // Format the symbol
      const symbol = coinPair.replace('-', '').toUpperCase();
      const lowerSymbol = symbol.toLowerCase();
      
      // Updated WebSocket URLs with more reliable formats
      // For futures, we use fstream.binance.com instead of stream.binance.com
      const wsUrls = [
        `wss://fstream.binance.com/ws/${lowerSymbol}@depth20@100ms`,
        `wss://fstream.binance.com/ws/${lowerSymbol}@depth@100ms`,
        `wss://stream.binance.com:9443/ws/${lowerSymbol}@depth20@100ms`,
        `wss://dstream.binance.com/ws/${lowerSymbol}@depth20@100ms`
      ];
      
      // Try the first URL
      const wsUrl = wsUrls[0];
      
      console.log('[OrderBook] Connecting to WebSocket for symbol:', symbol);
      console.log('[OrderBook] WebSocket URL:', wsUrl);
      setConnectionStatus('connecting');
      setDataSource('websocket');
      
      const ws = new WebSocket(wsUrl);
      
      // Set a shorter connection timeout (3 seconds instead of 5)
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          console.error('[OrderBook] WebSocket connection timeout');
          ws.close();
          
          // Try alternate URLs if this one fails
          tryAlternateEndpoints(wsUrls, 1);
        }
      }, 3000);
      
      // Function to try alternate WebSocket endpoints
      const tryAlternateEndpoints = (urls, index) => {
        if (index >= urls.length) {
          console.error('[OrderBook] All WebSocket endpoints failed');
          setConnectionStatus('fallback');
          
          // Create mock data as initial fallback before REST API connects
          const mockData = generateMockOrderBook(currentPrice || 86971.01);
          if (orderBook.asks.length === 0 && orderBook.bids.length === 0) {
            updateOrderBookThrottled(mockData);
            setIsLoading(false);
          }
          
          startRESTFallback();
          return;
        }
        
        console.log(`[OrderBook] Trying alternate WebSocket endpoint: ${urls[index]}`);
        
        const altWs = new WebSocket(urls[index]);
        
        const altTimeout = setTimeout(() => {
          if (altWs.readyState !== WebSocket.OPEN) {
            console.error(`[OrderBook] Alternate WebSocket endpoint ${index} timeout`);
            altWs.close();
            tryAlternateEndpoints(urls, index + 1);
          }
        }, 3000);
        
        altWs.onopen = () => {
          console.log(`[OrderBook] Connected to alternate WebSocket endpoint ${index}`);
          clearTimeout(altTimeout);
          setConnectionStatus('connected');
          setReconnectAttempts(0);
          setDataSource('websocket');
          setupEventHandlers(altWs);
          wsRef.current = altWs;
        };
        
        altWs.onerror = (error) => {
          console.error(`[OrderBook] Error with alternate endpoint ${index}:`, error);
          clearTimeout(altTimeout);
          tryAlternateEndpoints(urls, index + 1);
        };
        
        altWs.onclose = () => {
          clearTimeout(altTimeout);
        };
      };
      
      // Function to setup WebSocket event handlers
      const setupEventHandlers = (socket) => {
        let heartbeatInterval;
        let dataCheckInterval;
        let lastMessageTime = Date.now();
        
        // Setup heartbeat/ping to keep connection alive
        heartbeatInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ method: "PING" }));
          }
        }, 20000); // Send ping every 20 seconds
        
        // Check if we're receiving data regularly
        dataCheckInterval = setInterval(() => {
          const now = Date.now();
          if (now - lastMessageTime > 15000) { // No data for 15 seconds
            console.warn('[OrderBook] No data received for 15 seconds, reconnecting...');
            socket.close();
          }
        }, 5000);
        
        socket.onmessage = (event) => {
          try {
            lastMessageTime = Date.now(); // Update last message time
            
            const data = JSON.parse(event.data);
            
            // Handle ping/pong responses
            if (data.type === 'pong' || data.result === null) {
              console.log('[OrderBook] Received pong response or heartbeat');
              return;
            }
            
            // Handle different response formats
            let asks, bids;
            
            if (data.stream && data.data) {
              // Stream format response
              asks = data.data.asks;
              bids = data.data.bids;
            } else if (data.asks && data.bids) {
              // Direct format response
              asks = data.asks;
              bids = data.bids;
            } else if (data.a && data.b) {
              // Alternative format sometimes returned
              asks = data.a;
              bids = data.b;
            }
            
            if (asks && bids) {
              const processedData = processOrderBookData(asks, bids);
              if (processedData) {
                updateOrderBookThrottled(processedData);
                setIsLoading(false);
              }
            }
          } catch (error) {
            console.error('[OrderBook] Error processing WebSocket data:', error, event.data);
          }
        };
        
        socket.onclose = (event) => {
          console.log('[OrderBook] WebSocket disconnected', event.code, event.reason);
          clearInterval(heartbeatInterval);
          clearInterval(dataCheckInterval);
          
          if (!event.wasClean) {
            // If connection closed unexpectedly and we haven't reached max attempts
            if (reconnectAttempts < maxReconnectAttempts) {
              handleReconnect();
            } else {
              console.error('[OrderBook] Max reconnection attempts reached, falling back to REST API');
              setConnectionStatus('fallback');
              startRESTFallback();
            }
          }
        };
        
        socket.onerror = (error) => {
          console.error('[OrderBook] WebSocket error:', error);
        };
        
        socket.onopen = () => {
          console.log('[OrderBook] WebSocket connected successfully');
          clearTimeout(connectionTimeout);
          setConnectionStatus('connected');
          setReconnectAttempts(0);
          wsRef.current = socket;
          
          // Fetch REST data initially to show something while waiting for WS data
          fetchOrderBookREST();
        };
      };
      
      // Set up the initial WebSocket event handlers
      setupEventHandlers(ws);
      
    } catch (error) {
      console.error('[OrderBook] Error connecting to WebSocket:', error);
      setConnectionStatus('error');
      startRESTFallback();
    }
  };

  const handleReconnect = () => {
    setReconnectAttempts(prevAttempts => prevAttempts + 1);
    setConnectionStatus('reconnecting');
    
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    // Exponential backoff for reconnection attempts (1s, 2s, 4s, 8s, 16s)
    const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttempts), 16000);
    
    console.log(`[OrderBook] Reconnecting in ${backoffTime / 1000} seconds (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connectWebSocket();
    }, backoffTime);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePrecisionChange = (precision) => {
    setDecimalPrecision(precision);
  };

  const handleManualReconnect = () => {
    if (connectionStatus === 'error' || connectionStatus === 'fallback') {
      setConnectionStatus('connecting');
      setReconnectAttempts(0);
      connectWebSocket();
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="order-book-loading">
      <div className="spinner"></div>
      <div className="loading-text">Loading order book...</div>
    </div>
  );

  // Connection error component
  const ConnectionError = () => (
    <div className="connection-error">
      <div className="error-icon">!</div>
      <div className="error-message">
        Failed to connect to real-time data
      </div>
      <button onClick={handleManualReconnect} className="reconnect-btn">
        Try Again
      </button>
    </div>
  );

  return (
    <div className="orderbook-section">
      <div className="book-header">
        <div 
          className={`tab ${activeTab === 'orderbook' ? 'active' : ''}`}
          onClick={() => handleTabChange('orderbook')}
        >
          Order book
        </div>
        <div 
          className={`tab ${activeTab === 'trades' ? 'active' : ''}`}
          onClick={() => handleTabChange('trades')}
        >
          Last trades
        </div>
        <div className="layout-toggle"><i className="fas fa-columns"></i></div>
        <div className="more"><i className="fas fa-ellipsis-v"></i></div>
      </div>

      <div className="order-book">
        <div className="decimals">
          <div 
            className={`decimal ${decimalPrecision === 1 ? 'active' : ''}`}
            onClick={() => handlePrecisionChange(1)}
          >
            0.1
          </div>
          <i className="fas fa-chevron-down"></i>
        </div>

        <div className="book-headers">
          <div className="price-header">Price (USDT)</div>
          <div className="amount-header">Amount (Contracts)</div>
          <div className="total-header">Total (Contracts)</div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : connectionStatus === 'error' ? (
          <ConnectionError />
        ) : (
          <>
            <div className="sell-orders">
              {orderBook.asks.map((order, index) => (
                <div className="order-row" key={`sell-${index}`}>
                  <div className="order-bar sell" style={{ width: `${order.percentage}%` }}></div>
                  <div className="order-price sell">
                    {order.price.toFixed(decimalPrecision === 1 ? 1 : 2)}
                  </div>
                  <div className="order-amount">{order.amount.toFixed(5)}</div>
                  <div className="order-total">{order.total.toFixed(5)}</div>
                </div>
              ))}
            </div>

            <div className="current-price">
              <div className="price-value">
                {currentPrice ? currentPrice.toLocaleString('en-US', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1
                }) : '86,064.5'}
              </div>
              <div className="price-usd">
                ≈ ${currentPrice ? currentPrice.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }) : '86,064.50'}
              </div>
              {connectionStatus === 'fallback' && (
                <div className="data-source">
                  <span className="fallback-badge">Limited Data</span>
                </div>
              )}
            </div>

            <div className="buy-orders">
              {orderBook.bids.map((order, index) => (
                <div className="order-row" key={`buy-${index}`}>
                  <div className="order-bar buy" style={{ width: `${order.percentage}%` }}></div>
                  <div className="order-price buy">
                    {order.price.toFixed(decimalPrecision === 1 ? 1 : 2)}
                  </div>
                  <div className="order-amount">{order.amount.toFixed(5)}</div>
                  <div className="order-total">{order.total.toFixed(5)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderBook;