import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TradeForm from '../components/spotTrading/TradeForm';
import FutureTradeForm from '../components/futureTrading/TradeForm';
import * as spotTradingApi from '../services/spotTradingApi';
import * as futureTradingApi from '../services/futureTradingApi';

// Test account credentials
const TEST_EMAIL = 'mark@gmail.com';
const TEST_PASSWORD = '123';
const TEST_UID = 'yE8vKBNw'; // Default UID from your services

// API constants
const API_KEY = 'A20RqFwVktRxxRqrKBtmi6ud';

// Mock the API services
jest.mock('../services/spotTradingApi', () => ({
  executeSpotTradeOrder: jest.fn(),
  getSpotBalance: jest.fn(),
  fetchCoinDetails: jest.fn()
}));

jest.mock('../services/futureTradingApi', () => ({
  executeFutureTradeOrder: jest.fn(),
  getFutureBalance: jest.fn(),
  fetchCoinDetails: jest.fn()
}));

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Spot Trading Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Mock authentication with test account
    localStorageMock.setItem('authToken', 'fake-token');
    localStorageMock.setItem('user_id', '12345');
    localStorageMock.setItem('uid', TEST_UID);
    localStorageMock.setItem('email', TEST_EMAIL);
  });

  test('should execute buy order successfully', async () => {
    // Mock API response for buy order
    const mockOrderResponse = {
      success: true,
      data: {
        order_id: '67890',
        status: 'completed'
      },
      message: 'Spot Buy order executed successfully'
    };
    
    // Setup API mock
    spotTradingApi.executeSpotTradeOrder.mockResolvedValueOnce(mockOrderResponse);
    
    // Mock crypto data
    const cryptoData = {
      cryptoName: 'Bitcoin',
      cryptoSymbol: 'BTC',
      cryptoPrice: 50000,
      usdtSymbol: 'USDT'
    };
    
    // Mock user balance
    const userBalance = {
      cryptoBalance: 1.5,
      usdtBalance: 75000
    };
    
    const onTradeSuccess = jest.fn();
    
    render(
      <TradeForm 
        cryptoData={cryptoData} 
        userBalance={userBalance} 
        coinPairId={1} 
        onTradeSuccess={onTradeSuccess} 
      />
    );
    
    // Select buy tab
    const buyTab = screen.getByText(/Buy/i);
    fireEvent.click(buyTab);
    
    // Enter amount
    const amountInput = screen.getByLabelText(/Amount/i);
    fireEvent.change(amountInput, { target: { value: '0.5' } });
    
    // Click buy button
    const buyButton = screen.getByText(/Buy BTC/i);
    fireEvent.click(buyButton);
    
    // Verify API call
    await waitFor(() => {
      expect(spotTradingApi.executeSpotTradeOrder).toHaveBeenCalledTimes(1);
    });
    
    // Verify API parameters
    const apiCallParams = spotTradingApi.executeSpotTradeOrder.mock.calls[0][0];
    expect(apiCallParams.uid).toBe(TEST_UID);
    expect(apiCallParams.order_type).toBe('buy');
    expect(apiCallParams.amount).toBe('0.5');
    
    // Verify callback was called
    expect(onTradeSuccess).toHaveBeenCalledTimes(1);
  });

  test('should execute sell order successfully', async () => {
    // Mock API response for sell order
    const mockOrderResponse = {
      success: true,
      data: {
        order_id: '67891',
        status: 'completed'
      },
      message: 'Spot Sell order executed successfully'
    };
    
    // Setup API mock
    spotTradingApi.executeSpotTradeOrder.mockResolvedValueOnce(mockOrderResponse);
    
    // Mock crypto data
    const cryptoData = {
      cryptoName: 'Bitcoin',
      cryptoSymbol: 'BTC',
      cryptoPrice: 50000,
      usdtSymbol: 'USDT'
    };
    
    // Mock user balance
    const userBalance = {
      cryptoBalance: 1.5,
      usdtBalance: 75000
    };
    
    const onTradeSuccess = jest.fn();
    
    render(
      <TradeForm 
        cryptoData={cryptoData} 
        userBalance={userBalance} 
        coinPairId={1} 
        onTradeSuccess={onTradeSuccess} 
      />
    );
    
    // Select sell tab
    const sellTab = screen.getByText(/Sell/i);
    fireEvent.click(sellTab);
    
    // Enter amount
    const amountInput = screen.getByLabelText(/Amount/i);
    fireEvent.change(amountInput, { target: { value: '0.5' } });
    
    // Click sell button
    const sellButton = screen.getByText(/Sell BTC/i);
    fireEvent.click(sellButton);
    
    // Verify API call
    await waitFor(() => {
      expect(spotTradingApi.executeSpotTradeOrder).toHaveBeenCalledTimes(1);
    });
    
    // Verify API parameters
    const apiCallParams = spotTradingApi.executeSpotTradeOrder.mock.calls[0][0];
    expect(apiCallParams.uid).toBe(TEST_UID);
    expect(apiCallParams.order_type).toBe('sell');
    expect(apiCallParams.amount).toBe('0.5');
    
    // Verify callback was called
    expect(onTradeSuccess).toHaveBeenCalledTimes(1);
  });

  test('should handle insufficient balance for buy order', async () => {
    // Mock crypto data
    const cryptoData = {
      cryptoName: 'Bitcoin',
      cryptoSymbol: 'BTC',
      cryptoPrice: 50000,
      usdtSymbol: 'USDT'
    };
    
    // Mock user balance with insufficient funds
    const userBalance = {
      cryptoBalance: 1.5,
      usdtBalance: 10000 // Not enough for 1 BTC at 50000
    };
    
    const onTradeSuccess = jest.fn();
    
    render(
      <TradeForm 
        cryptoData={cryptoData} 
        userBalance={userBalance} 
        coinPairId={1} 
        onTradeSuccess={onTradeSuccess} 
      />
    );
    
    // Select buy tab
    const buyTab = screen.getByText(/Buy/i);
    fireEvent.click(buyTab);
    
    // Enter amount that exceeds balance
    const amountInput = screen.getByLabelText(/Amount/i);
    fireEvent.change(amountInput, { target: { value: '1.0' } });
    
    // Click buy button
    const buyButton = screen.getByText(/Buy BTC/i);
    fireEvent.click(buyButton);
    
    // API should not be called
    expect(spotTradingApi.executeSpotTradeOrder).not.toHaveBeenCalled();
    
    // Callback should not be called
    expect(onTradeSuccess).not.toHaveBeenCalled();
  });
});

describe('Future Trading Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    
    // Mock authentication with test account
    localStorageMock.setItem('authToken', 'fake-token');
    localStorageMock.setItem('user_id', '12345');
    localStorageMock.setItem('uid', TEST_UID);
    localStorageMock.setItem('email', TEST_EMAIL);
  });

  test('should execute buy/long order successfully', async () => {
    // Mock getFutureBalance function
    const mockBalanceResponse = {
      success: true,
      balance: {
        available_balance: '10000',
        future_wallet: '10000',
        btc: '1.5',
        usdt: '10000',
        margin_balance: '10000'
      },
      message: 'Future balance fetched successfully for BTC/USDT pair'
    };
    
    // Mock executeFutureTradeOrder function
    const mockOrderResponse = {
      success: true,
      data: {
        order_id: '12345',
        status: 'completed'
      },
      message: 'Future trade order executed successfully'
    };
    
    // Setup API mocks
    futureTradingApi.getFutureBalance.mockResolvedValueOnce(mockBalanceResponse);
    futureTradingApi.executeFutureTradeOrder.mockResolvedValueOnce(mockOrderResponse);
    
    render(<FutureTradeForm symbol="BTC" />);
    
    // Wait for component to load and fetch balance
    await waitFor(() => {
      expect(futureTradingApi.getFutureBalance).toHaveBeenCalledTimes(1);
    });
    
    // Verify the UID was passed to the API
    expect(futureTradingApi.getFutureBalance).toHaveBeenCalledWith(TEST_UID);
    
    // Enter amount
    const amountInput = screen.getByPlaceholderText(/Amount/i);
    fireEvent.change(amountInput, { target: { value: '0.5' } });
    
    // Click buy/long button
    const buyButton = screen.getByText(/Buy \/ Long/i);
    fireEvent.click(buyButton);
    
    // Verify API call
    await waitFor(() => {
      expect(futureTradingApi.executeFutureTradeOrder).toHaveBeenCalledTimes(1);
    });
    
    // Verify API parameters
    const apiCallParams = futureTradingApi.executeFutureTradeOrder.mock.calls[0][0];
    expect(apiCallParams.uid).toBe(TEST_UID);
    expect(apiCallParams.symbol).toBe('BTC');
    expect(apiCallParams.amount).toBe('0.5');
    expect(apiCallParams.order_type).toBe('open');
    expect(apiCallParams.excecution_type).toBe('limit');
  });

  test('should handle leverage changes for future trading', async () => {
    // Mock getFutureBalance function
    const mockBalanceResponse = {
      success: true,
      balance: {
        available_balance: '10000',
        future_wallet: '10000',
        btc: '1.5',
        usdt: '10000',
        margin_balance: '10000'
      },
      message: 'Future balance fetched successfully for BTC/USDT pair'
    };
    
    // Setup API mocks
    futureTradingApi.getFutureBalance.mockResolvedValueOnce(mockBalanceResponse);
    
    render(<FutureTradeForm symbol="BTC" />);
    
    // Wait for component to load and fetch balance
    await waitFor(() => {
      expect(futureTradingApi.getFutureBalance).toHaveBeenCalledTimes(1);
    });
    
    // Verify the UID was passed to the API
    expect(futureTradingApi.getFutureBalance).toHaveBeenCalledWith(TEST_UID);
    
    // Toggle leverage mode
    const leverageModeToggle = screen.getByText(/isolated/i);
    fireEvent.click(leverageModeToggle);
    
    // Verify leverage mode changed
    expect(screen.getByText(/cross/i)).toBeInTheDocument();
    
    // Toggle leverage value
    const leverageToggle = screen.getByText(/20/);
    fireEvent.click(leverageToggle);
    
    // Enter amount
    const amountInput = screen.getByPlaceholderText(/Amount/i);
    fireEvent.change(amountInput, { target: { value: '0.5' } });
    
    // Verify max amount calculation is affected by leverage
    const maxLongText = screen.getByText(/Max long/i);
    expect(maxLongText).toBeInTheDocument();
  });
});
