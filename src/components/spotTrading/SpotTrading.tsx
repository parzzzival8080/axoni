import React, { useMemo, memo, useRef, useEffect, useState, useCallback } from 'react';
import { executeSpotTradeOrder, getSpotBalance } from '../../services/spotTradingApi.js';
import { Notification } from '../common/Notification';
import './SpotTrading.css';

// Import the real OrderBook component
import OrderBook from './OrderBook';
// Import OrderHistory component
import OrderHistory from './OrderHistory';

interface Order {
    price: number;
    amount: number;
    total: number;
}

interface OrderRowProps {
    type: 'ask' | 'bid';
    price: string;
    amount: string;
    total: string;
    key?: number;
}

interface OrderBookSectionProps {
    type: 'ask' | 'bid';
    orders: Order[];
}

interface TradeFormProps {
    uid: string;
    isAuthenticated: boolean;
    cryptoSymbol?: string;
    userBalance: {
        usdt: number;
        [key: string]: number;
    };
    onTradeComplete?: () => void;
}

const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
};

// Memoized row component for better performance
const OrderRow = ({ type, price, amount, total }: OrderRowProps) => {
    return (
        <div className={`order-row ${type}`}>
            <span>{price}</span>
            <span>{amount}</span>
            <span>{total}</span>
        </div>
    );
};

// Memoized section component
const OrderBookSection = ({ type, orders }: OrderBookSectionProps) => {
    return (
        <div className="order-book-section">
            {orders.map((order, index) => (
                <OrderRow
                    key={index}
                    type={type}
                    price={formatNumber(order.price, 1)}
                    amount={formatNumber(order.amount, 5)}
                    total={formatNumber(order.total, 5)}
                />
            ))}
        </div>
    );
};

const TradeForm = ({ uid, isAuthenticated = true, cryptoSymbol = 'BTC', userBalance, onTradeComplete }: TradeFormProps) => {
    // Allow both buy and sell tabs
    const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
    // Allow both limit and market order types
    const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
    const [price, setPrice] = useState('');
    const [amount, setAmount] = useState('');
    const [tpsl, setTpsl] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState(() => null as { message: string; type?: 'success' | 'error' } | null);

    // Get the available balance based on active tab
    const availableBalance = useMemo(() => {
        // For buy orders, show USDT balance
        if (activeTab === 'buy') {
            return userBalance.usdt;
        }
        // For sell orders, show crypto balance
        const cryptoKey = cryptoSymbol.toLowerCase();
        return userBalance[cryptoKey] || 0;
    }, [activeTab, userBalance, cryptoSymbol]);

    // Calculate max buy/sell amount
    const maxTradeAmount = useMemo(() => {
        const numPrice = parseFloat(price) || 0;
        if (numPrice <= 0) return 0;
        
        if (activeTab === 'buy') {
            // Max buy = Available USDT / Price
            return userBalance.usdt / numPrice;
        } else {
            // Max sell = Available crypto
            const cryptoKey = cryptoSymbol.toLowerCase();
            return userBalance[cryptoKey] || 0;
        }
    }, [activeTab, userBalance, cryptoSymbol, price]);

    const validateNumericInput = (value: string) => {
        return /^\d*\.?\d*$/.test(value);
    };

    const handlePriceChange = (e: { target: { value: string } }) => {
        const value = e.target.value;
        if (validateNumericInput(value)) {
            setPrice(value);
        }
    };

    const handleAmountChange = (e: { target: { value: string } }) => {
        const value = e.target.value;
        if (validateNumericInput(value)) {
            setAmount(value);
        }
    };

    // Set maximum amount based on available balance
    const handleSetMaxAmount = () => {
        if (maxTradeAmount > 0) {
            // Format to 6 decimal places and avoid scientific notation
            setAmount(maxTradeAmount.toFixed(6));
        }
    };

    const handleTradeSubmit = async () => {
        try {
            if (!isAuthenticated) {
                setNotification({
                    message: 'Please log in to trade',
                    type: 'error'
                });
                return;
            }

            setIsLoading(true);
            setNotification(null);

            if (!price || !amount) {
                throw new Error('Please enter both price and amount');
            }

            const numPrice = parseFloat(price);
            const numAmount = parseFloat(amount);

            if (isNaN(numPrice) || isNaN(numAmount)) {
                throw new Error('Invalid price or amount format');
            }

            if (numPrice <= 0) {
                throw new Error('Price must be greater than 0');
            }

            if (numAmount < 0.00001) {
                throw new Error(`Amount must be at least 0.00001 ${cryptoSymbol}`);
            }

            // Check if user has enough balance
            const totalCost = numPrice * numAmount;
            if (activeTab === 'buy' && totalCost > userBalance.usdt) {
                throw new Error('Insufficient USDT balance for this purchase');
            }

            const cryptoKey = cryptoSymbol.toLowerCase();
            if (activeTab === 'sell' && numAmount > (userBalance[cryptoKey] || 0)) {
                throw new Error(`Insufficient ${cryptoSymbol} balance for this sale`);
            }

            // Use default UID if not provided
            const effectiveUid = uid || 'yE8vKBNw';
            
            console.log('Submitting trade:', {
                uid: effectiveUid,
                order_type: activeTab,
                execution_type: orderType,
                price: numPrice,
                amount: numAmount
            });

            const result = await executeSpotTradeOrder({
                uid: effectiveUid,
                order_type: activeTab,
                execution_type: orderType,
                price: numPrice,
                amount: numAmount
            });

            // Check result
            if (result.success) {
                // Clear form after successful trade
                setPrice('');
                setAmount('');
                setNotification({
                    message: `${activeTab === 'buy' ? 'Buy' : 'Sell'} order placed for ${numAmount} ${cryptoSymbol}`,
                    type: 'success'
                });
                
                // Notify parent that a trade was completed to trigger order book refresh
                console.log('Trade successful, calling onTradeComplete callback');
                if (typeof onTradeComplete === 'function') {
                    onTradeComplete();
                }
            } else {
                setNotification({
                    message: result.message || 'Trade execution failed',
                    type: 'error'
                });
            }

        } catch (err) {
            console.error('Trade error:', err);
            setNotification({
                message: err instanceof Error ? err.message : 'An error occurred during trade execution',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate total as user types
    const total = useMemo(() => {
        const numPrice = parseFloat(price) || 0;
        const numAmount = parseFloat(amount) || 0;
        return (numPrice * numAmount).toFixed(6);
    }, [price, amount]);

    return (
        <div className="trade-form">
            {notification && (
                <Notification
                    message={notification.message}
                    onClose={() => setNotification(null)}
                    actionLabel="OK"
                    type={notification.type}
                />
            )}


            
            <div className="trade-type-tabs">
                <div 
                    className={`trade-type-tab buy ${activeTab === 'buy' ? 'active' : ''}`}
                    onClick={() => setActiveTab('buy')}
                >
                    Buy {cryptoSymbol}
                </div>
                <div 
                    className={`trade-type-tab sell ${activeTab === 'sell' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sell')}
                >
                    Sell {cryptoSymbol}
                </div>
            </div>

            <div className="order-types">
                <div 
                    className={`order-type ${orderType === 'limit' ? 'active' : ''}`}
                    onClick={() => setOrderType('limit')}
                >
                    Limit
                </div>
                <div 
                    className={`order-type ${orderType === 'market' ? 'active' : ''}`}
                    onClick={() => setOrderType('market')}
                >
                    Market
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Price (USDT)</label>
                <div className="price-input-wrapper">
                    <input
                        type="text"
                        className="form-input"
                        value={price}
                        onChange={handlePriceChange}
                        placeholder="0"
                        disabled={orderType === 'market'}
                    />
                    <span className="price-equals">≈ ${(parseFloat(price) || 0).toLocaleString()}</span>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Amount ({cryptoSymbol})</label>
                <div className="amount-input-wrapper">
                    <input
                        type="text"
                        className="form-input"
                        value={amount}
                        onChange={handleAmountChange}
                        placeholder="0"
                    />
                    <div className="min-amount">Min 0.00001 {cryptoSymbol}</div>
                </div>

                <div className="amount-slider">
                    <div className="slider-point" data-value="0"></div>
                    <div className="slider-point" data-value="25%"></div>
                    <div className="slider-point" data-value="50%"></div>
                    <div className="slider-point" data-value="75%"></div>
                    <div className="slider-point" data-value="100%"></div>
                </div>
            </div>

            <div className="available-balance">
                <span>Available</span>
                <span>{formatNumber(availableBalance, 6)} {activeTab === 'buy' ? 'USDT' : cryptoSymbol}</span>
            </div>

            <div className="max-buy" onClick={handleSetMaxAmount}>
                Max {activeTab === 'buy' ? 'buy' : 'sell'} {formatNumber(maxTradeAmount, 6)} {cryptoSymbol}
            </div>

            <div className="tp-sl-checkbox">
                <input
                    type="checkbox"
                    id="tpsl"
                    checked={tpsl}
                    onChange={(e) => setTpsl(e.target.checked)}
                />
                <label htmlFor="tpsl">TP/SL</label>
            </div>

            {isAuthenticated ? (
                <button 
                    className={`trade-button ${activeTab}`}
                    onClick={handleTradeSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? 'Processing...' : `${activeTab === 'buy' ? 'Buy' : 'Sell'} ${cryptoSymbol}`}
                </button>
            ) : (
                <a href="/login" className="login-button">Log in/Sign up</a>
            )}

            <div className="max-price">
                Total: {total} USDT
            </div>
        </div>
    );
};

// Main component
const SpotTrading = () => {
    const [cryptoData, setCryptoData] = useState({
        cryptoSymbol: 'BTC',
        usdtSymbol: 'USDT',
        cryptoPrice: 86950.24
    });
    
    const [refreshOrderBook, setRefreshOrderBook] = useState(0);
    const [refreshOrderHistory, setRefreshOrderHistory] = useState(0);
    const [refreshBalance, setRefreshBalance] = useState(0);
    // Set default active tab to history so it's visible immediately
    const [activeTab, setActiveTab] = useState<'trade' | 'orders' | 'history' | 'assets'>('history');
    
    // Add balance state
    const [userBalance, setUserBalance] = useState({
        usdt: 50000.00,
        btc: 1.23456,
        eth: 15.7891,
        xrp: 10000.00
    });
    
    // Fetch user balance
    const fetchUserBalance = useCallback(async () => {
        console.log('Fetching user balance...');
        const balanceResponse = await getSpotBalance();
        
        if (balanceResponse.success && balanceResponse.balance) {
            console.log('Balance updated:', balanceResponse.balance);
            setUserBalance(balanceResponse.balance);
        } else {
            console.error('Failed to fetch balance:', balanceResponse.message);
        }
    }, []);
    
    // Initial balance fetch
    useEffect(() => {
        fetchUserBalance();
    }, [fetchUserBalance]);
    
    // Refresh balance when refreshBalance state changes
    useEffect(() => {
        if (refreshBalance > 0) {
            fetchUserBalance();
        }
    }, [refreshBalance, fetchUserBalance]);
    
    // Enhanced callback for when trades are completed
    const handleTradeComplete = useCallback(() => {
        console.log('Trade completed, refreshing order book and history');
        // Force a refresh by incrementing counters with a small delay to ensure API has updated
        setRefreshOrderBook(prevCount => prevCount + 1);
        
        // Delay order history refresh slightly to ensure server has processed the order
        setTimeout(() => {
            console.log('Refreshing order history after trade completion');
            setRefreshOrderHistory(prevCount => prevCount + 1);
            
            // Refresh user balance as well
            setRefreshBalance(prevCount => prevCount + 1);
            
            // Force the active tab to 'history' to show updated orders
            setActiveTab('history');
        }, 1000); // 1 second delay for API to process
    }, []);
    
    // Debug effect to log when refreshOrderHistory changes
    useEffect(() => {
        if (refreshOrderHistory > 0) {
            console.log('Order history refresh triggered:', refreshOrderHistory);
        }
    }, [refreshOrderHistory]);
    
    return (
        <div className="spot-trading-container">
            <div className="trading-content">
                {/* Left column with chart */}
                <div className="trading-column chart-column">
                    <div className="chart-placeholder">
                        <span>Price Chart will be displayed here</span>
                    </div>
                </div>
                
                {/* Right column with order book and trading form */}
                <div className="trading-column order-column">
                    {/* Pass the real OrderBook component with refresh trigger */}
                    <OrderBook 
                        cryptoData={cryptoData}
                        forceRefresh={refreshOrderBook}
                    />
                    
                    <TradeForm 
                        uid="yE8vKBNw"
                        isAuthenticated={true}
                        cryptoSymbol={cryptoData.cryptoSymbol}
                        userBalance={userBalance}
                        onTradeComplete={handleTradeComplete}
                    />
                </div>
            </div>
            
            {/* Tabs for order history and other sections */}
            <div className="trading-tabs">
                <div 
                    className={`tab ${activeTab === 'trade' ? 'active' : ''}`}
                    onClick={() => setActiveTab('trade')}
                >
                    Trade
                </div>
                <div 
                    className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    Orders
                </div>
                <div 
                    className={`tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    Order History
                </div>
                <div 
                    className={`tab ${activeTab === 'assets' ? 'active' : ''}`}
                    onClick={() => setActiveTab('assets')}
                >
                    Assets
                </div>
            </div>
            
            {/* Always render OrderHistory but hide it when not active - this keeps its state alive */}
            <div className="tab-content">
                <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
                    <OrderHistory refreshTrigger={refreshOrderHistory} />
                </div>
                
                {activeTab === 'orders' && (
                    <div className="orders-placeholder">
                        <p>Your active orders will appear here</p>
                    </div>
                )}
                
                {activeTab === 'assets' && (
                    <div className="assets-placeholder">
                        <p>Your asset information will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpotTrading;