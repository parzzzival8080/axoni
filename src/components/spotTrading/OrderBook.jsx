import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
// For subtle animations
import styled, { keyframes } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faExclamationTriangle, faSync } from '@fortawesome/free-solid-svg-icons';
import { formatNumber } from '../../utils/numberFormatter'; // Assuming you have this utility
import axios from 'axios';

// Styled components moved outside
const spin = keyframes`0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); }`;
const shake = keyframes`0%, 100% { transform: translateX(0); } 20%, 60% { transform: translateX(-3px); } 40%, 80% { transform: translateX(3px); }`;

const SpinnerIcon = styled(FontAwesomeIcon)`
  animation: ${spin} 1s linear infinite;
  color: #fff;
`;

const LoadingText = styled.div`
  color: #aaa;
  margin-top: 8px;
  font-size: 1rem;
`;

const ErrorIconStyled = styled(FontAwesomeIcon)`
  color: #ff5b5b;
  animation: ${shake} 0.6s;
`;

const ErrorText = styled.div`
  color: #ff5b5b;
  margin: 8px 0;
  font-size: 1rem;
`;

const LoadingSpinner = () => (
  <div className="order-book-loading" style={{ textAlign: 'center', padding: '20px' }}>
    <SpinnerIcon icon={faSpinner} size="2x" />
    <LoadingText>Loading FLUX order book data...</LoadingText>
  </div>
);

const ConnectionError = ({ connectionStatus, reconnectAttempts, maxReconnectAttempts, handleManualReconnect }) => (
  <div className="order-book-error" style={{ textAlign: 'center', padding: '20px' }}>
    <ErrorIconStyled icon={faExclamationTriangle} size="2x" />
    <ErrorText>
      Connection to FLUX failed.
      {connectionStatus === 'error' ? ' An error occurred.' : ''}
      <br />
      {reconnectAttempts >= maxReconnectAttempts && connectionStatus !== 'fallback' ? 'Max retries reached. ' : ''}
      Attempting to use fallback or try reconnecting.
    </ErrorText>
    <button className="reconnect-button" onClick={handleManualReconnect} style={{ padding: '8px 15px', background: '#5841d8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
      <FontAwesomeIcon icon={faSync} /> Retry Connection
    </button>
  </div>
);

const OrderBook = ({ cryptoData, forceRefresh = 0 }) => {
  const supportsWebSocket = typeof window !== 'undefined' && 'WebSocket' in window;
  const canUseWebSocket = supportsWebSocket; // Simplified, assuming fetch is generally available with WebSocket

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
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // connecting, connected, reconnecting, disconnected, error, failed, fallback
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef(null);
  const [dataSource, setDataSource] = useState('Connecting...');
  const lastUpdateTimeRef = useRef(Date.now());
  const staleConnectionCheckRef = useRef(null);
  const throttleInterval = 100; // Update UI max every 100ms for fast, responsive updates
  const lastUpdateRef = useRef(Date.now());
  const pendingUpdateRef = useRef(null);

  // Derive instId (instrument ID for FLUX, e.g., BTC-USDT)
  // Use websocket_name if available, otherwise fall back to cryptoSymbol or symbol
  const getWebSocketSymbol = () => {
    if (cryptoData?.websocket_name) {
      return cryptoData.websocket_name.toUpperCase();
    }
    if (cryptoData?.cryptoSymbol) {
      return cryptoData.cryptoSymbol.toUpperCase();
    }
    if (cryptoData?.symbol) {
      return cryptoData.symbol.toUpperCase();
    }
    return 'BTC';
  };
  
  const instId = `${getWebSocketSymbol()}-USDT`;
  
  // Debug logging to track which symbol is being used
  useEffect(() => {
    const wsSymbol = getWebSocketSymbol();
    console.log('[OrderBook] Symbol configuration:', {
      websocket_name: cryptoData?.websocket_name,
      cryptoSymbol: cryptoData?.cryptoSymbol,
      symbol: cryptoData?.symbol,
      selectedSymbol: wsSymbol,
      coinPrice: cryptoData?.cryptoPrice,
      instId: instId
    });
  }, [cryptoData?.websocket_name, cryptoData?.cryptoSymbol, cryptoData?.symbol, instId]);

  const processOrderBookData = useCallback((asks, bids) => {
    if (!asks || !bids || !Array.isArray(asks) || !Array.isArray(bids)) {
      console.error('[OrderBook] Invalid order book data structure for FLUX', { asks, bids });
      return null;
    }

    const processedAsks = asks
      .map(item => ({
        price: parseFloat(item[0]), // FLUX: [price, size, liquidations, orders]
        amount: parseFloat(item[1]),
        total: 0
      }))
      .sort((a, b) => a.price - b.price)
      .slice(0, 8); // Process exactly 8 asks

    const processedBids = bids
      .map(item => ({
        price: parseFloat(item[0]),
        amount: parseFloat(item[1]),
        total: 0
      }))
      .sort((a, b) => b.price - a.price)
      .slice(0, 8); // Process exactly 8 bids

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
      lastUpdateId: Date.now() // FLUX provides 'ts' in the data payload, could use that
    };
  }, []);

  const calculatePercentage = useCallback((total, maxTotal) => {
    if (!maxTotal) return 0;
    return Math.min(95, Math.log(1 + (total / maxTotal) * 9) * 45);
  }, []);

  useEffect(() => {
    if (orderBook.asks.length > 0 && orderBook.bids.length > 0) {
      const bestAsk = orderBook.asks[0].price;
      const bestBid = orderBook.bids[0].price;
      const midPrice = (bestAsk + bestBid) / 2;
      setCurrentPrice(midPrice);
    } else if (cryptoData?.cryptoPrice) {
      setCurrentPrice(parseFloat(cryptoData.cryptoPrice));
    }
  }, [orderBook, cryptoData]);

  const MAX_REST_RETRIES = 3;
  const REST_BACKOFF_BASE = 2000;

  const fetchOrderBookREST = useCallback(async (retry = 0) => {
    if (restFallbackRef.current) {
      clearInterval(restFallbackRef.current);
      restFallbackRef.current = null;
    }
    setDataSource('REST API (FLUX)');
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const apiUrl = `https://orderbookFLUX.devweb09.workers.dev/api/okx/api/v5/market/books?instId=${instId}&sz=5`; // Proxied via Cloudflare Worker; top 5 levels for fast loading
        console.log('[OrderBook] Fetching from FLUX REST API:', apiUrl);
        const response = await axios.get(apiUrl);

        if (response.data && response.data.code === "0" && response.data.data && response.data.data[0]) {
          const bookData = response.data.data[0];
          if (bookData.asks && bookData.bids) {
            const processedData = processOrderBookData(bookData.asks, bookData.bids);
            if (processedData) {
              // Apply throttling to REST API updates with a more efficient approach
              const now = Date.now();
              const timeSinceLastUpdate = now - lastUpdateRef.current;
              
              // Cancel any pending updates
              if (pendingUpdateRef.current) {
                clearTimeout(pendingUpdateRef.current);
                pendingUpdateRef.current = null;
              }
              
              // Check if significant changes exist before updating
              const hasSignificantChanges = !orderBook.asks.length || 
                JSON.stringify(processedData.asks.slice(0, 3)) !== JSON.stringify(orderBook.asks.slice(0, 3)) ||
                JSON.stringify(processedData.bids.slice(0, 3)) !== JSON.stringify(orderBook.bids.slice(0, 3));
              
              if (hasSignificantChanges) {
                if (timeSinceLastUpdate >= throttleInterval) {
                  // Update immediately if enough time has passed
                  setOrderBook(processedData);
                  lastUpdateRef.current = now;
                } else {
                  // Otherwise schedule update for later
                  pendingUpdateRef.current = setTimeout(() => {
                    setOrderBook(processedData);
                    lastUpdateRef.current = Date.now();
                    pendingUpdateRef.current = null;
                  }, throttleInterval - timeSinceLastUpdate);
                }
              }
              
              setIsLoading(false);
              setConnectionStatus('fallback');
              lastUpdateTimeRef.current = now; // Or use bookData.ts
              console.log('[OrderBook] Data updated from FLUX REST API');
            }
          } else {
            throw new Error('Malformed FLUX REST API response data structure');
          }
        } else {
          throw new Error(`FLUX REST API Error: ${response.data.msg || 'Unknown error'} (Code: ${response.data.code})`);
        }
      } catch (error) {
        console.error(`[OrderBook] FLUX REST API fetch error (attempt ${retry + 1}):`, error);
        if (retry < MAX_REST_RETRIES) {
          setTimeout(() => fetchOrderBookREST(retry + 1), REST_BACKOFF_BASE * Math.pow(2, retry));
        } else {
          console.error('[OrderBook] Max REST retries reached for FLUX.');
          setConnectionStatus('error'); // Or 'failed' if it's persistent
          setIsLoading(false);
          // Optionally, display mock data or a more persistent error message
           setOrderBook(generateMockOrderBook(parseFloat(cryptoData?.cryptoPrice))); // Fallback to mock
        }
      }
    };

    await fetchData(); // Initial fetch
    restFallbackRef.current = setInterval(fetchData, 10000); // Refresh every 10s for REST
  }, [instId, processOrderBookData, cryptoData]);


  const connectWebSocket = useCallback(() => {
    if (wsRef.current) {
      console.log('[OrderBook] Closing existing FLUX WebSocket connection.');
      wsRef.current.onclose = null; // Prevent reconnect logic on manual close
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnectionStatus('connecting');
    setIsLoading(true);
    setDataSource('WebSocket (FLUX)');

    const wsUrl = 'https://wssorderbook.devweb09.workers.dev/';
    console.log('[OrderBook] Attempting to connect to FLUX WebSocket:', wsUrl);

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log('[OrderBook] Connected to FLUX WebSocket');
        setConnectionStatus('connected');
        // setIsLoading(false); // Wait for first data message
        setReconnectAttempts(0); // Reset on successful connection

        const subscriptionMessage = {
          op: 'subscribe',
          args: [
            {
              channel: 'books5', // Use top 5 levels for speed and parity with futures
              instId: instId,
            },
          ],
        };
        socket.send(JSON.stringify(subscriptionMessage));
        console.log('[OrderBook] Sent FLUX subscription message:', subscriptionMessage);
        lastUpdateTimeRef.current = Date.now(); // Reset last update time on new connection
      };

      socket.onerror = (error) => {
        console.error('[OrderBook] FLUX WebSocket error:', error);
        // Don't set to 'error' immediately, onclose will handle reconnect or fallback
        // setIsLoading(false); // Let onclose handle this
      };

      socket.onclose = (event) => {
        console.log('[OrderBook] FLUX WebSocket closed:', event.code, event.reason);
        wsRef.current = null; // Clear the ref

        if (connectionStatus !== 'disconnected' && connectionStatus !== 'failed') { // Avoid if manually closed or already failed
          if (reconnectAttempts < maxReconnectAttempts) {
            setReconnectAttempts(prev => prev + 1);
            const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000);
            console.log(`[OrderBook] Attempting to reconnect to FLUX in ${backoffTime / 1000}s (attempt ${reconnectAttempts + 1})...`);
            setConnectionStatus('reconnecting');
            reconnectTimeoutRef.current = setTimeout(connectWebSocket, backoffTime);
          } else {
            console.error('[OrderBook] Max reconnect attempts to FLUX reached. Falling back to REST.');
            setConnectionStatus('failed'); // Explicitly set to failed before fallback
            fetchOrderBookREST();
          }
        } else {
            setIsLoading(false); // Ensure loading is false if it was a clean disconnect or already failed
        }
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.event === 'subscribe') {
            console.log('[OrderBook] FLUX Subscription confirmed:', message.arg);
            return;
          }
          if (message.event === 'error') {
            console.error('[OrderBook] FLUX API Error Message:', message.msg, 'Code:', message.code);
            // Depending on the error code, you might want to close the socket or try to resubscribe.
            // For critical errors, closing might trigger the reconnect/fallback logic.
            if (socket.readyState === WebSocket.OPEN) {
                // socket.close(); // This would trigger onclose and subsequently retries/fallback
            }
            setIsLoading(false);
            setConnectionStatus('error'); // Show an error state
            return;
          }

          // FLUX 'books5' channel sends full snapshots for both 'snapshot' and 'update' actions
          if (message.arg && (message.arg.channel === 'books5' || message.arg.channel === 'books') && message.data && Array.isArray(message.data) && message.data.length > 0) {
            const orderBookUpdate = message.data[0];
            if (orderBookUpdate && orderBookUpdate.asks && orderBookUpdate.bids) {
              const processedData = processOrderBookData(orderBookUpdate.asks, orderBookUpdate.bids);
              if (processedData) {
                // Apply throttling to WebSocket updates with a more efficient approach
                const now = Date.now();
                const timeSinceLastUpdate = now - lastUpdateRef.current;
                
                // Cancel any pending updates
                if (pendingUpdateRef.current) {
                  clearTimeout(pendingUpdateRef.current);
                  pendingUpdateRef.current = null;
                }
                
                // Check if significant changes exist before updating
                const hasSignificantChanges = !orderBook.asks.length || 
                  JSON.stringify(processedData.asks.slice(0, 3)) !== JSON.stringify(orderBook.asks.slice(0, 3)) ||
                  JSON.stringify(processedData.bids.slice(0, 3)) !== JSON.stringify(orderBook.bids.slice(0, 3));
                
                if (hasSignificantChanges) {
                  if (timeSinceLastUpdate >= throttleInterval) {
                    // Update immediately if enough time has passed
                    setOrderBook(processedData);
                    lastUpdateRef.current = now;
                  } else {
                    // Otherwise schedule update for later
                    pendingUpdateRef.current = setTimeout(() => {
                      setOrderBook(processedData);
                      lastUpdateRef.current = Date.now();
                      pendingUpdateRef.current = null;
                    }, throttleInterval - timeSinceLastUpdate);
                  }
                }
                
                lastUpdateTimeRef.current = now; // Or use orderBookUpdate.ts
                setIsLoading(false); // Data received
                if (connectionStatus !== 'connected') setConnectionStatus('connected');
              }
            }
          } else if (message.op === 'ping') { // FLUX sends pings
            socket.send(JSON.stringify({ op: 'pong' }));
          } else {
            // console.warn('[OrderBook] Unknown FLUX WebSocket message format:', message);
          }
        } catch (error) {
          console.error('[OrderBook] Error processing FLUX WebSocket message:', error, event.data);
        }
      };

    } catch (error) {
      console.error('[OrderBook] Error creating FLUX WebSocket:', error);
      setConnectionStatus('failed'); // Connection attempt itself failed
      setIsLoading(false);
      fetchOrderBookREST(); // Fallback if WebSocket object cannot even be created
    }
  }, [instId, processOrderBookData, fetchOrderBookREST, reconnectAttempts, connectionStatus]);


  useEffect(() => {
    console.log('[OrderBook] Initial setup for', instId);
    if (canUseWebSocket) {
      connectWebSocket();
    } else {
      console.log('[OrderBook] WebSocket not supported, falling back to REST for FLUX.');
      setConnectionStatus('fallback');
      fetchOrderBookREST();
    }

    // Stale connection checker
    staleConnectionCheckRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && (Date.now() - lastUpdateTimeRef.current > 20000)) { // 20s no data
        console.warn('[OrderBook] FLUX WebSocket connection appears stale (no data for >20s). Closing to trigger reconnect.');
        wsRef.current.close(); // This will trigger the onclose logic for reconnection
      } else if (connectionStatus === 'fallback' && (Date.now() - lastUpdateTimeRef.current > 30000)) { // 30s for REST
         console.warn('[OrderBook] FLUX REST connection appears stale. Re-fetching.');
         fetchOrderBookREST(); // Re-initiate fetch
      }
    }, 10000); // Check every 10 seconds

    return () => {
      console.log('[OrderBook] Cleaning up for', instId);
      if (wsRef.current) {
        console.log('[OrderBook] Closing FLUX WebSocket on unmount.');
        wsRef.current.onclose = null; // Prevent reconnect logic on unmount
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (restFallbackRef.current) {
        clearInterval(restFallbackRef.current);
      }
      if (staleConnectionCheckRef.current) {
        clearInterval(staleConnectionCheckRef.current);
      }
      if (pendingUpdateRef.current) {
        clearTimeout(pendingUpdateRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instId, canUseWebSocket]); // Removed connectWebSocket and fetchOrderBookREST from deps to avoid re-triggering on their own re-creation


  useEffect(() => {
    if (forceRefresh > 0) {
      console.log('[OrderBook] Force refresh triggered for FLUX');
      handleManualReconnect();
    }
  }, [forceRefresh]);


  const handleManualReconnect = () => {
    console.log('[OrderBook] Manual reconnect triggered for FLUX');
    setConnectionStatus('disconnected'); // Set to disconnected to allow fresh connection attempt sequence
    setReconnectAttempts(0); // Reset attempts

    // Clear existing timers/intervals
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    if (restFallbackRef.current) clearInterval(restFallbackRef.current);
    
    if (wsRef.current) {
      wsRef.current.onclose = null; // Avoid triggering old onclose logic
      wsRef.current.close();
      wsRef.current = null;
    }

    setIsLoading(true); // Show loading state
    if (canUseWebSocket) {
      connectWebSocket();
    } else {
      fetchOrderBookREST();
    }
  };
  
  const generateMockOrderBook = useCallback((basePrice = 60000) => {
    const spread = basePrice * 0.0002;
    const askBasePrice = basePrice + (spread / 2);
    const bidBasePrice = basePrice - (spread / 2);
    return {
      asks: Array(8).fill().map((_, i) => ({ price: askBasePrice + i * (basePrice * 0.0001), amount: 0.1 + Math.random() * 0.3, total: 0, percentage: 0 })).sort((a,b) => a.price - b.price),
      bids: Array(8).fill().map((_, i) => ({ price: bidBasePrice - i * (basePrice * 0.0001), amount: 0.1 + Math.random() * 0.3, total: 0, percentage: 0 })).sort((a,b) => b.price - a.price),
      lastUpdateId: Date.now()
    };
  }, [cryptoData?.cryptoPrice]);


  const handleTabChange = useCallback((tab) => setActiveTab(tab), []);
  const handlePrecisionChange = useCallback((precision) => setDecimalPrecision(precision), []);

  // Use websocket_name for display if available, otherwise fall back to other options
  const cryptoSymbol = cryptoData?.websocket_name || cryptoData?.cryptoSymbol || cryptoData?.symbol || 'BTC';
  const usdtSymbol = 'USDT'; // Typically USDT for FLUX pairs like BTC-USDT

  // Ensure we always display exactly 8 rows each for asks and bids
  const ensureExactRows = useCallback((data, count, isAsk) => {
    if (!data || data.length === 0) return Array(count).fill(null);
    
    // If we have fewer than desired, pad with empty rows
    if (data.length < count) {
      const lastItem = data[data.length - 1] || { price: 0, amount: 0, total: 0, percentage: 0 };
      const padding = Array(count - data.length).fill(null).map((_, i) => {
        const priceDelta = isAsk ? 0.0001 : -0.0001;
        return {
          price: lastItem.price + (priceDelta * (i + 1)),
          amount: 0,
          total: lastItem.total,
          percentage: 0,
          isEmpty: true // Flag to identify empty rows
        };
      });
      return isAsk ? [...data, ...padding] : [...data, ...padding];
    }
    
    // If we have more than desired, take exactly the number we want
    return data.slice(0, count);
  }, []);
  
  // Memoize the processed display data to prevent unnecessary recalculations
  const displayAsks = useMemo(() => ensureExactRows(orderBook.asks, 8, true), [orderBook.asks, ensureExactRows]);
  const displayBids = useMemo(() => ensureExactRows(orderBook.bids, 8, false), [orderBook.bids, ensureExactRows]);

  return (
    <div className="order-book-container md:relative md:z-auto z-10 bg-okx-primary border-t border-okx-border md:border-t-0">
      <div className="order-book-header">
        <div className="order-book-tabs">
          <div className={`tab ${activeTab === 'orderbook' ? 'active' : ''}`} onClick={() => handleTabChange('orderbook')}>
            Order Book
          </div>
          <div className={`tab ${activeTab === 'trades' ? 'active' : ''}`} onClick={() => handleTabChange('trades')}>
            Trades
          </div>
        </div>
        <div className="decimals">
          {[0, 1, 2, 3, 4].map(p => (
            <div key={p} className={`decimal ${decimalPrecision === p ? 'active' : ''}`} onClick={() => handlePrecisionChange(p)}>
              {p}
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

          {isLoading && (orderBook.asks.length === 0 && orderBook.bids.length === 0) ? (
            <>
              <div className="sell-orders">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div className="order-row skeleton" key={`ask-skeleton-${idx}`}>
                    <div className="order-bar sell skeleton-bar" />
                    <div className="order-price sell skeleton-cell skeleton-rect" />
                    <div className="order-amount skeleton-cell skeleton-rect" />
                    <div className="order-total skeleton-cell skeleton-rect" />
                  </div>
                ))}
              </div>
              <div className="current-price">
                <div className="price-value skeleton-cell skeleton-rect" style={{ width: 80, height: 18, margin: '0 auto' }} />
                <div className="price-usd skeleton-cell skeleton-rect" style={{ width: 60, height: 11, margin: '6px auto 0' }} />
              </div>
              <div className="buy-orders">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div className="order-row skeleton" key={`bid-skeleton-${idx}`}>
                    <div className="order-bar buy skeleton-bar" />
                    <div className="order-price buy skeleton-cell skeleton-rect" />
                    <div className="order-amount skeleton-cell skeleton-rect" />
                    <div className="order-total skeleton-cell skeleton-rect" />
                  </div>
                ))}
              </div>
            </>
          ) : (connectionStatus === 'error' || connectionStatus === 'failed') && orderBook.asks.length === 0 ? (
            <ConnectionError connectionStatus={connectionStatus} reconnectAttempts={reconnectAttempts} maxReconnectAttempts={maxReconnectAttempts} handleManualReconnect={handleManualReconnect} />
          ) : (
            <>
              <div className="sell-orders">
                {displayAsks.map((ask, index) => (
                  <div className="order-row" key={`ask-${ask?.price || index}-${index}`}>
                    <div className="order-bar sell" style={{ width: `${ask?.percentage || 0}%` }}></div>
                    <div className="order-price sell" style={{ opacity: ask?.isEmpty ? 0.5 : 1 }}>
 {(cryptoData.cryptoPrice - ((cryptoData.cryptoPrice * 0.0002) / 2)) ? formatNumber(cryptoData.cryptoPrice, decimalPrecision) : '—'}                    </div>
                    <div className="order-amount" style={{ opacity: ask?.isEmpty ? 0.5 : 1 }}>
                      {ask ? formatNumber(ask.amount, 8) : '—'}
                    </div>
                    <div className="order-total" style={{ opacity: ask?.isEmpty ? 0.5 : 1 }}>
                      {ask ? formatNumber(ask.total, 8) : '—'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="current-price">
                <div className="price-value">
                  {cryptoData.cryptoPrice ? formatNumber(cryptoData.cryptoPrice, decimalPrecision) : '-.--'} {usdtSymbol}
                </div>
                <div className="price-usd">
                  {/* Assuming 1 USDT = 1 USD for simplicity */}
                  ${cryptoData.cryptoPrice ? formatNumber(cryptoData.cryptoPrice * 1, 2) : '-.--'} USD
                </div>
              </div>

              <div className="buy-orders">
                {displayBids.map((bid, index) => (
                  <div className="order-row" key={`bid-${bid?.price || index}-${index}`}>
                    <div className="order-bar buy" style={{ width: `${bid?.percentage || 0}%` }}></div>
                    <div className="order-price buy" style={{ opacity: bid?.isEmpty ? 0.5 : 1 }}>
                      {(cryptoData.cryptoPrice + ((cryptoData.cryptoPrice * 0.0002) / 2)) ? formatNumber(cryptoData.cryptoPrice, decimalPrecision) : '—'}
                    </div>
                    <div className="order-amount" style={{ opacity: bid?.isEmpty ? 0.5 : 1 }}>
                      {bid ? formatNumber(bid.amount, 8) : '—'}
                    </div>
                    <div className="order-total" style={{ opacity: bid?.isEmpty ? 0.5 : 1 }}>
                      {bid ? formatNumber(bid.total, 8) : '—'}
                    </div>
                  </div>
                ))}
              </div>
              {displayAsks.length === 0 && displayBids.length === 0 && !isLoading && <div style={{textAlign: 'center', padding: '20px', color: '#aaa'}}>No order book data to display.</div>}
            </>
          )}
        </div>
      ) : (
        <div className="trades-container" style={{ padding: '20px', textAlign: 'center', color: '#aaa' }}>
          Trade data display is not yet implemented for FLUX.
        </div>
      )}

      <div className="connection-status-indicator">
        <span className={`status-dot ${connectionStatus === 'connected' || connectionStatus === 'fallback' ? 'connected' : connectionStatus}`}></span>
        <span className="status-text">
          {connectionStatus === 'connected' && `Live via ${dataSource}`}
          {connectionStatus === 'fallback' && `Live via ${dataSource}`}
          {connectionStatus === 'connecting' && 'Connecting to FLUX...'}
          {connectionStatus === 'reconnecting' && `Reconnecting to FLUX (Attempt ${reconnectAttempts})...`}
          {connectionStatus === 'disconnected' && 'Disconnected from FLUX'}
          {connectionStatus === 'error' && 'FLUX Connection Error'}
          {connectionStatus === 'failed' && 'Failed to connect to FLUX'}
        </span>
      </div>
    </div>
  );
};

export default OrderBook;