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
            setAmount(maxTradeAmount.toFixed(5));
        }
    };

    const handleTradeSubmit = () => {
        // Validate inputs
        const numPrice = parseFloat(price);
        const numAmount = parseFloat(amount);
        
        if (!numPrice || numPrice <= 0) {
            setNotification({ message: 'Please enter a valid price', type: 'error' });
            return;
        }
        
        if (!numAmount || numAmount <= 0) {
            setNotification({ message: 'Please enter a valid amount', type: 'error' });
            return;
        }
        
        // Check if user has enough balance
        if (activeTab === 'buy') {
            const totalCost = numPrice * numAmount;
            if (totalCost > userBalance.usdt) {
                setNotification({ message: 'Insufficient USDT balance', type: 'error' });
                return;
            }
        } else {
            const cryptoKey = cryptoSymbol.toLowerCase();
            if (numAmount > (userBalance[cryptoKey] || 0)) {
                setNotification({ message: `Insufficient ${cryptoSymbol} balance`, type: 'error' });
                return;
            }
        }
        
        // Start loading state
        setIsLoading(true);
        
        // Prepare order data
        const orderData = {
            uid,
            type: activeTab,
            orderType,
            cryptoSymbol,
            price: numPrice,
            amount: numAmount,
            total: numPrice * numAmount
        };
        
        // Execute trade
        executeSpotTradeOrder(orderData)
            .then(response => {
                console.log('Trade executed:', response);
                setNotification({ message: 'Trade executed successfully', type: 'success' });
                
                // Clear form
                setAmount('');
                
                // Notify parent component
                if (onTradeComplete) {
                    onTradeComplete();
                }
            })
            .catch(error => {
                console.error('Trade error:', error);
                setNotification({ message: error.message || 'Failed to execute trade', type: 'error' });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    return (
        <div className="trade-form">
            {/* Top controls */}
            <div className="top-controls">
                <div className="margin-toggle">
                    <span>Margin</span>
                    <label className="switch">
                        <input type="checkbox" />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            {/* Buy/Sell tabs */}
            <div className="buy-sell-tabs">
                <div 
                    className={`tab buy ${activeTab === 'buy' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('buy')}
                >
                    Buy
                </div>
                <div 
                    className={`tab sell ${activeTab === 'sell' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('sell')}
                >
                    Sell
                </div>
            </div>

            {/* Order types */}
            <div className="order-types">
                <div 
                    className={`type ${orderType === 'limit' ? 'active' : ''}`}
                    onClick={() => setOrderType('limit')}
                >
                    Limit
                </div>
                <div 
                    className={`type ${orderType === 'market' ? 'active' : ''}`}
                    onClick={() => setOrderType('market')}
                >
                    Market
                </div>
                <div className="type">Stop-Limit</div>
            </div>

            {/* Price input - only show for limit orders */}
            {orderType === 'limit' && (
                <div className="form-group">
                    <label>Price (USDT)</label>
                    <div className="input-wrapper">
                        <input 
                            type="text" 
                            value={price}
                            onChange={handlePriceChange}
                            placeholder="0.00"
                        />
                        <span className="input-note">≈ ${price}</span>
                    </div>
                </div>
            )}

            {/* Amount input */}
            <div className="form-group">
                <label>Amount ({cryptoSymbol})</label>
                <input 
                    type="text" 
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder={`Min 0.00001 ${cryptoSymbol}`}
                />
                <div className="slider-container">
                    <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={maxTradeAmount > 0 ? (parseFloat(amount) / maxTradeAmount * 100) : 0} 
                        className="range-slider"
                        onChange={(e) => {
                            const percent = parseInt(e.target.value);
                            const newAmount = (maxTradeAmount * percent / 100).toFixed(5);
                            setAmount(newAmount);
                        }}
                    />
                    <div className="slider-labels">
                        <span>0%</span>
                        <span>100%</span>
                    </div>
                </div>
            </div>

            {/* Total input - only show for limit orders */}
            {orderType === 'limit' && (
                <div className="form-group">
                    <label>Total (USDT)</label>
                    <input 
                        type="text" 
                        placeholder="0.00" 
                        value={parseFloat(price) && parseFloat(amount) ? (parseFloat(price) * parseFloat(amount)).toFixed(2) : ''}
                        readOnly
                    />
                </div>
            )}

            {/* Balance info */}
            <div className="balance-info">
                <span>Available: {formatNumber(availableBalance, activeTab === 'buy' ? 2 : 5)} {activeTab === 'buy' ? 'USDT' : cryptoSymbol}</span>
                <span className="max-amount" onClick={handleSetMaxAmount}>Max</span>
            </div>

            {/* Trade button */}
            {isAuthenticated ? (
                <button 
                    className={`trade-button ${activeTab}`}
                    onClick={handleTradeSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                            Processing...
                        </>
                    ) : (
                        activeTab === 'buy' ? `Buy ${cryptoSymbol}` : `Sell ${cryptoSymbol}`
                    )}
                </button>
            ) : (
                <button className="login-button">Log in/Sign up</button>
            )}

            {/* Price info */}
            <div className="price-info">
                <span>Fees: 0.1%</span>
                <span>24h Change: +2.3%</span>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`notification ${notification.type}`}>
                    <div className="notification-content">
                        <div className="notification-message">{notification.message}</div>
                        <button className="notification-close" onClick={() => setNotification(null)}>×</button>
                    </div>
                </div>
            )}
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
        <div className="spot-trading-container okx-dark">
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
                    
                    <div className="trade-form-wrapper">
                        <TradeForm 
                            uid="yE8vKBNw"
                            isAuthenticated={true}
                            cryptoSymbol={cryptoData.cryptoSymbol}
                            userBalance={userBalance}
                            onTradeComplete={handleTradeComplete}
                        />
                    </div>
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