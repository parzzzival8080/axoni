import React, { useState, useEffect, useRef } from "react";
import { formatNumber } from "../../utils/numberFormatter";
import { executeSpotTradeOrder } from "../../services/spotTradingApi";
import "./TradeForm.css";

const TradeForm = ({
  cryptoData,
  userBalance,
  coinPairId,
  onTradeSuccess,
  isBuy,
}) => {
  // If isBuy prop is provided, use it; otherwise default to internal state
  const [localIsBuy, setLocalIsBuy] = useState(true);
  const [sliderValue, setSliderValue] = useState(0);
  const [price, setPrice] = useState(0);
  const [amount, setAmount] = useState("");
  const [total, setTotal] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationTimeout, setNotificationTimeout] = useState(null);
  const [uid, setUid] = useState("");
  const [isPriceLocked, setIsPriceLocked] = useState(false);
  const [lockedPrice, setLockedPrice] = useState(0);

  // Ref to track last submission time for debouncing
  const lastSubmissionTime = useRef(0);
  const DEBOUNCE_DELAY = 1000; // 1 second debounce

  // Use external isBuy prop if provided (for mobile), otherwise use local state
  const effectiveIsBuy = isBuy !== undefined ? isBuy : localIsBuy;

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userId = localStorage.getItem("user_id");
    setIsAuthenticated(!!token && !!userId);
    setUid(localStorage.getItem("uid") || "");
  }, []);

  // Update price when cryptoData changes (but respect price locking)
  useEffect(() => {
    if (cryptoData && !isPriceLocked) {
      const livePrice = cryptoData.price ?? cryptoData.cryptoPrice;
      if (
        livePrice !== undefined &&
        livePrice !== null &&
        !isNaN(Number(livePrice))
      ) {
        const newPrice = parseFloat(livePrice);
        setPrice(newPrice);
        setLockedPrice(newPrice); // Update locked price when not locked
      }
    }
  }, [cryptoData?.price, cryptoData?.cryptoPrice, isPriceLocked]);

  // Reset form state when switching between buy and sell
  useEffect(() => {
    setSliderValue(0);
    setAmount("");
    setTotal("");
    setIsPriceLocked(false); // Unlock price when switching modes
  }, [effectiveIsBuy]);

  // Reset price lock when switching coins
  useEffect(() => {
    setIsPriceLocked(false); // Unlock price when switching coins
    setSliderValue(0);
    setAmount("");
    setTotal("");
  }, [coinPairId]);

  // Format price for display
  const formatPrice = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return "0.00";
    }
    return formatNumber(value, 2, true);
  };

  // Format crypto amount with 8 decimal places for DISPLAY only
  const formatCryptoAmount = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return "0.00000000";
    }
    // Use exactly 8 decimal places for crypto amounts DISPLAY
    return formatNumber(value, 8, false);
  };

  // Get raw balance with full precision (12 decimals from API)
  const getRawBalance = (balanceType) => {
    if (balanceType === 'usdt') {
      const balance = userBalance?.usdtSpotBalance || userBalance?.usdtBalance || 0;
      const parsedBalance = parseFloat(balance) || 0;
      console.log('getRawBalance USDT:', {
        balance,
        parsedBalance,
        type: typeof balance,
        userBalance: userBalance
      });
      return parsedBalance;
    } else {
      const balance = userBalance?.cryptoSpotBalance || userBalance?.cryptoBalance || 0;
      const parsedBalance = parseFloat(balance) || 0;
      console.log('getRawBalance Crypto:', {
        balance,
        parsedBalance,
        type: typeof balance,
        userBalance: userBalance
      });
      return parsedBalance;
    }
  };

  // Helper functions for price locking
  const lockPriceForTrading = () => {
    if (!isPriceLocked) {
      setIsPriceLocked(true);
      setLockedPrice(price);
      console.log('Price locked for trading at:', price);
    }
  };

  const unlockPrice = () => {
    setIsPriceLocked(false);
    console.log('Price unlocked, will follow live updates');
  };

  // Get the effective price to use for calculations (locked or live)
  const getEffectivePrice = () => {
    return isPriceLocked ? lockedPrice : price;
  };

  // Calculate total with proper precision using effective price
  const calculateTotal = (amount) => {
    const amountValue = parseFloat(amount) || 0;
    const priceValue = parseFloat(getEffectivePrice()) || 0;
    return (amountValue * priceValue).toFixed(8);
  };

  // Calculate max amount based on available balance with FULL 12-decimal precision
  const getMaxAmount = () => {
    if (effectiveIsBuy) {
      // For buying, max amount is USDT balance divided by effective price
      // Use raw balance with full precision (12 decimals from API)
      const usdtSpotBalance = getRawBalance('usdt');
      const effectivePrice = getEffectivePrice();
      // Return with full precision for accurate calculations
      return effectivePrice > 0 ? usdtSpotBalance / effectivePrice : 0;
    } else {
      // For selling, return the precise crypto balance with full precision
      return getRawBalance('crypto');
    }
  };

  // Get available balance for display (uses raw precision for accuracy)
  const getAvailableBalance = () => {
    if (effectiveIsBuy) {
      return getRawBalance('usdt');
    } else {
      return getRawBalance('crypto');
    }
  };

  // Validate if amount exceeds available balance using FULL precision with tolerance
  const isAmountValid = () => {
    const currentAmount = parseFloat(amount) || 0;
    
    if (currentAmount === 0) return true;
    
    if (effectiveIsBuy) {
      // Use raw balance with full 12-decimal precision for accurate validation
      const totalCost = currentAmount * parseFloat(getEffectivePrice() || 0);
      const availableUSDT = getRawBalance('usdt');
      
      // Use tolerance for 12-decimal precision to handle floating point precision issues
      const tolerance = Math.max(availableUSDT * 1e-12, 1e-12);
      const isWithinTolerance = (totalCost - availableUSDT) <= tolerance;
      
      console.log('Buy validation:', {
        totalCost: totalCost.toFixed(12),
        availableUSDT: availableUSDT.toFixed ? availableUSDT.toFixed(12) : availableUSDT,
        tolerance: tolerance.toFixed(15),
        isWithinTolerance: isWithinTolerance,
        isValid: totalCost <= availableUSDT || isWithinTolerance
      });
      
      // Compare using full precision balance amounts with tolerance
      return totalCost <= availableUSDT || isWithinTolerance;
    } else {
      // For sell orders, use raw crypto balance string (don't parse like buy does with USDT)
      const availableCryptoRaw = userBalance?.cryptoSpotBalance || userBalance?.cryptoBalance || '0';
      const availableCrypto = parseFloat(availableCryptoRaw) || 0;
      
      // Use tolerance for 12-decimal precision to handle floating point precision issues
      const tolerance = Math.max(availableCrypto * 1e-12, 1e-12);
      const difference = currentAmount - availableCrypto;
      const isWithinTolerance = difference <= tolerance;
      
      console.log('Sell validation (isAmountValid):');
      console.log('  amount:', amount);
      console.log('  currentAmount:', currentAmount);
      console.log('  availableCryptoRaw:', availableCryptoRaw);
      console.log('  availableCrypto:', availableCrypto);
      console.log('  difference:', difference);
      console.log('  tolerance:', tolerance.toFixed(15));
      console.log('  isWithinTolerance:', isWithinTolerance);
      console.log('  isValid:', currentAmount <= availableCrypto || isWithinTolerance);
      console.log('  rawComparison:', currentAmount <= availableCrypto);
      
      return currentAmount <= availableCrypto || isWithinTolerance;
    }
  };

  // Check if user is at exactly maximum available balance using FULL precision
  const isAtMaxBalance = () => {
    const currentAmount = parseFloat(amount) || 0;
    if (currentAmount === 0) return false;
    
    if (effectiveIsBuy) {
      // For buy orders, check if total cost matches available USDT with full precision
      const totalCost = currentAmount * parseFloat(getEffectivePrice() || 0);
      const availableUSDT = getRawBalance('usdt');
      
      // Use tolerance appropriate for 12-decimal precision
      const tolerance = Math.max(availableUSDT * 1e-12, 1e-12);
      const isAtMax = Math.abs(totalCost - availableUSDT) <= tolerance;
      
      console.log('Buy max balance check:', {
        totalCost: totalCost.toFixed(12),
        availableUSDT: availableUSDT.toFixed ? availableUSDT.toFixed(12) : availableUSDT,
        tolerance: tolerance.toFixed(15),
        isAtMax
      });
      
      return isAtMax;
    } else {
      // For sell orders, use raw crypto balance string directly from userBalance
      const availableCryptoRaw = userBalance?.cryptoSpotBalance || userBalance?.cryptoBalance || '0';
      
      // Use tolerance appropriate for 12-decimal precision
      const tolerance = Math.max(parseFloat(availableCryptoRaw) * 1e-12, 1e-12);
      const difference = Math.abs(currentAmount - parseFloat(availableCryptoRaw));
      const isAtMax = difference <= tolerance;
      
      console.log('Sell max balance check (isAtMaxBalance):', {
        currentAmount: currentAmount.toFixed(12),
        availableCryptoRaw: availableCryptoRaw,
        difference: difference.toFixed(15),
        tolerance: tolerance.toFixed(15),
        isAtMax,
        exactMatch: currentAmount === parseFloat(availableCryptoRaw)
      });
      
      return isAtMax;
    }
  };

  // Handle slider change with discrete levels (25%, 50%, 75%, 100%)
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    // Snap to nearest discrete level
    let snappedValue;
    if (value <= 12.5) snappedValue = 0;
    else if (value <= 37.5) snappedValue = 25;
    else if (value <= 62.5) snappedValue = 50;
    else if (value <= 87.5) snappedValue = 75;
    else snappedValue = 100;
    
    // Lock price when user interacts with slider (except when setting to 0)
    if (snappedValue > 0) {
      lockPriceForTrading();
    } else {
      unlockPrice(); // Unlock when slider is set to 0
    }
    
    setSliderValue(snappedValue);
    calculateAmountFromPercentage(snappedValue);
  };

  // Calculate amount based on percentage with precise calculations
  const calculateAmountFromPercentage = (percentage) => {
    if (percentage === 0) {
      setAmount("");
      setTotal("");
      return;
    }

    if (percentage === 100) {
      // At 100%, use the EXACT full balance with full precision to avoid rounding errors
      if (effectiveIsBuy) {
        // Use raw USDT balance with full 12-decimal precision
        const usdtBalance = getRawBalance('usdt');
        console.log('100% Buy - Using exact USDT balance:', usdtBalance.toFixed ? usdtBalance.toFixed(12) : usdtBalance);
        
        // Set total to exact balance with 8 decimal precision
        setTotal(usdtBalance.toFixed(8));
        const effectivePrice = getEffectivePrice();
        if (effectivePrice > 0) {
          // Calculate amount with full precision using locked price
          const exactAmount = usdtBalance / effectivePrice;
          setAmount(exactAmount.toString());
          console.log('100% Buy - Calculated amount:', exactAmount.toFixed(12), 'using locked price:', effectivePrice);
        }
      } else {
        // Use raw crypto balance with full 12-decimal precision
        const cryptoBalance = getRawBalance('crypto');
        console.log('100% Sell - Using exact crypto balance:', cryptoBalance.toFixed ? cryptoBalance.toFixed(12) : cryptoBalance);
        
        // Set amount to exact balance
        setAmount(cryptoBalance.toString());
        const effectivePrice = getEffectivePrice();
        const exactTotal = cryptoBalance * effectivePrice;
        setTotal(exactTotal.toFixed(8));
        console.log('100% Sell - Calculated total:', exactTotal.toFixed(12), 'using locked price:', effectivePrice);
      }
    } else {
      // For other percentages, calculate based on percentage
      const maxAmount = getMaxAmount();
      const calculatedAmount = (percentage / 100) * maxAmount;
      const formattedAmount = calculatedAmount.toFixed(8);
      setAmount(formattedAmount);
      setTotal(calculateTotal(formattedAmount));
    }
  };

  // Handle amount change with precise calculations
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Validate number input
    if (!/^(\d*\.?\d*)?$/.test(value)) return;

    // Lock price when user manually enters amount (except when clearing)
    if (value && parseFloat(value) > 0) {
      lockPriceForTrading();
    } else if (!value) {
      unlockPrice(); // Unlock when amount is cleared
    }

    setAmount(value);

    // Calculate total based on amount
    setTotal(calculateTotal(value));

    // Update slider position to nearest discrete level
    const maxAmount = getMaxAmount();

    if (maxAmount > 0) {
      const percentage = (parseFloat(value) / maxAmount) * 100;
      let snappedValue;
      if (percentage <= 12.5) snappedValue = 0;
      else if (percentage <= 37.5) snappedValue = 25;
      else if (percentage <= 62.5) snappedValue = 50;
      else if (percentage <= 87.5) snappedValue = 75;
      else snappedValue = 100;
      
      setSliderValue(snappedValue);
    }
  };

  // Handle total change with precise calculations
  const handleTotalChange = (e) => {
    const value = e.target.value;
    // Validate number input
    if (!/^(\d*\.?\d*)?$/.test(value)) return;

    // Lock price when user manually enters total (except when clearing)
    if (value && parseFloat(value) > 0) {
      lockPriceForTrading();
    } else if (!value) {
      unlockPrice(); // Unlock when total is cleared
    }

    setTotal(value);

    // Calculate amount based on total with full precision using effective price
    const effectivePrice = getEffectivePrice();
    const calculatedAmount = effectivePrice > 0 ? parseFloat(value) / effectivePrice : 0;
    setAmount(calculatedAmount.toFixed(8));

    // Update slider position
    const maxAmount = getMaxAmount();

    if (maxAmount > 0) {
      const sliderPercentage = (calculatedAmount / maxAmount) * 100;
      setSliderValue(sliderPercentage > 100 ? 100 : sliderPercentage);
    }
  };

  const handleTradeSubmit = async () => {
    // Prevent multiple simultaneous submissions
    if (isLoading) {
      console.log(
        "Trade submission already in progress, ignoring duplicate request"
      );
      return;
    }

    // Debounce mechanism - prevent rapid clicks
    const now = Date.now();
    if (now - lastSubmissionTime.current < DEBOUNCE_DELAY) {
      console.log("Trade submission blocked due to debounce, please wait");
      showNotification(
        "warning",
        "Please wait before submitting another order"
      );
      return;
    }
    lastSubmissionTime.current = now;

    // Clear any existing notification timeout
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
      setNotificationTimeout(null);
    }

    if (!isAuthenticated) {
      showNotification("error", "Please login to trade");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      showNotification("error", "Please enter a valid amount");
      return;
    }

    const effectivePrice = getEffectivePrice();
    if (!effectivePrice || parseFloat(effectivePrice) <= 0) {
      showNotification("error", "Please enter a valid price");
      return;
    }

    // Check if user has enough balance using FULL precision balance amounts with tolerance
    if (effectiveIsBuy) {
      // Use raw balance with full 12-decimal precision for accurate validation
      const currentAmount = parseFloat(amount);
      const totalCost = currentAmount * parseFloat(effectivePrice);
      const availableUSDT = getRawBalance('usdt');
      
      // Use tolerance for 12-decimal precision to handle floating point precision issues
      const tolerance = Math.max(availableUSDT * 1e-12, 1e-12);
      const isWithinTolerance = (totalCost - availableUSDT) <= tolerance;
      
      console.log('Trade submission buy validation:', {
        currentAmount: currentAmount.toFixed(12),
        totalCost: totalCost.toFixed(12),
        availableUSDT: availableUSDT.toFixed ? availableUSDT.toFixed(12) : availableUSDT,
        tolerance: tolerance.toFixed(15),
        difference: (totalCost - availableUSDT).toFixed(15),
        isWithinTolerance: isWithinTolerance,
        isValid: totalCost <= availableUSDT || isWithinTolerance
      });
      
      // Only show insufficient balance if the difference is significant (beyond tolerance)
      if (totalCost > availableUSDT && !isWithinTolerance) {
        const maxAmount = getMaxAmount();
        showNotification(
          "error",
          `Insufficient balance. Max buy amount: ${formatCryptoAmount(maxAmount)} ${cryptoData?.cryptoSymbol || 'BTC'} (${formatCryptoAmount(availableUSDT)} USDT available)`
        );
        return;
      }
    } else {
      // For sell orders, use raw crypto balance string (don't parse like buy does with USDT)
      const currentAmount = parseFloat(amount);
      const availableCryptoRaw = userBalance?.cryptoSpotBalance || userBalance?.cryptoBalance || '0';
      const availableCrypto = parseFloat(availableCryptoRaw) || 0;
      
      // Use tolerance for 12-decimal precision to handle floating point precision issues
      const tolerance = Math.max(availableCrypto * 1e-12, 1e-12);
      const difference = currentAmount - availableCrypto;
      const isWithinTolerance = difference <= tolerance;
      
      console.log('Trade submission sell validation:');
      console.log('  currentAmount:', currentAmount);
      console.log('  availableCryptoRaw:', availableCryptoRaw);
      console.log('  availableCrypto:', availableCrypto);
      console.log('  difference:', difference);
      console.log('  tolerance:', tolerance.toFixed(15));
      console.log('  isWithinTolerance:', isWithinTolerance);
      console.log('  willShowError:', currentAmount > availableCrypto && !isWithinTolerance);
      
      // Only show insufficient balance if the difference is significant (beyond tolerance)
      if (currentAmount > availableCrypto && !isWithinTolerance) {
        console.log('SHOWING INSUFFICIENT BALANCE ERROR FROM TRADE SUBMISSION');
        showNotification(
          "error",
          `Insufficient balance. Max sell amount: ${formatCryptoAmount(availableCrypto)} ${cryptoData?.cryptoSymbol || 'BTC'}`
        );
        return;
      }
    }

    setIsLoading(true);

    try {
      // Execute trade order using the locked/effective price
      const orderData = {
        uid: uid,
        coin_pair_id: coinPairId,
        price: parseFloat(parseFloat(effectivePrice).toFixed(8)), // Use 8 decimal precision
        amount: parseFloat(parseFloat(amount).toFixed(8)), // Use 8 decimal precision
        order_type: effectiveIsBuy ? "buy" : "sell", // Using buy or sell for order_type
        side: effectiveIsBuy ? "buy" : "sell",
        excecution_type: "limit", // Always use limit execution type
      };

      console.log("Submitting trade order:", orderData);

      const response = await executeSpotTradeOrder(orderData);

      if (response.success) {
        showNotification(
          "success",
          `${effectiveIsBuy ? "Buy" : "Sell"} order placed successfully!`
        );

        // Reset form and unlock price
        setAmount("");
        setTotal("");
        setSliderValue(0);
        unlockPrice(); // Allow price to update again after successful trade

        // Trigger refresh of balances
        if (onTradeSuccess) {
          onTradeSuccess();
        }
      } else {
        // Filter out unhelpful server error messages
        let errorMessage = response.message || "Failed to place order. Please try again.";
        
        // Replace unhelpful server validation errors with user-friendly messages
        if (errorMessage.includes("Balance must be greater than 100")) {
          errorMessage = "Trade amount is too small. Please increase your order amount.";
        }
        
        showNotification("error", errorMessage);
      }
    } catch (error) {
      console.error("Error submitting trade:", error);
      showNotification("error", "An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to show notification with auto-dismiss
  const showNotification = (type, message) => {
    setNotification({
      type,
      message,
      icon:
        type === "success"
          ? "✓"
          : type === "error"
          ? "✕"
          : type === "warning"
          ? "⚠"
          : "ℹ",
    });

    // Auto-dismiss notification after 5 seconds
    const timeout = setTimeout(() => {
      setNotification(null);
    }, 5000);

    setNotificationTimeout(timeout);
  };

  // Handle percentage button clicks
  const handlePercentageClick = (percentage) => {
    lockPriceForTrading(); // Lock price when user clicks percentage button
    setSliderValue(percentage);
    calculateAmountFromPercentage(percentage);
  };

  return (
    <div className="trade-form">
      {/* Buy/Sell toggle - only show in desktop mode when isBuy prop is not provided */}
      {isBuy === undefined && (
        <div className="trade-type-toggle">
          <button
            className={`toggle-btn ${localIsBuy ? "active" : ""}`}
            onClick={() => setLocalIsBuy(true)}
            style={
              localIsBuy
                ? {
                    backgroundColor: "#F88726",
                    color: "white",
                    fontWeight: "bold",
                  }
                : {}
            }
          >
            Buy
          </button>
          <button
            className={`toggle-btn ${!localIsBuy ? "active" : ""}`}
            onClick={() => setLocalIsBuy(false)}
          >
            Sell
          </button>
        </div>
      )}

      {/* Price input */}
      <div className="form-group">
        <label>Price ({cryptoData?.usdtSymbol || "USDT"})</label>
        <input
          type="text"
          value={formatPrice(price)}
          onChange={(e) => setPrice(e.target.value)}
          className="form-input"
        />
      </div>

      {/* Amount input */}
      <div className="form-group">
        <label>Amount ({cryptoData?.cryptoSymbol || "BTC"})</label>
        <input
          type="text"
          value={amount}
          onChange={handleAmountChange}
          className="form-input"
        />
      </div>

      {/* Enhanced Slider with Tailwind */}
      <div 
        className="relative mb-6"
        style={{
          '--slider-color': effectiveIsBuy ? '#F88726' : '#F23645'
        }}
      >
        {/* Slider Track */}
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            step="25"
            value={sliderValue}
            onChange={handleSliderChange}
            className="enhanced-slider w-full h-2 bg-transparent cursor-pointer focus:outline-none"
            style={{
              background: `linear-gradient(90deg, ${
                effectiveIsBuy ? "#F88726" : "#F23645"
              } ${sliderValue}%, #232323 ${sliderValue}%)`,
              borderRadius: '12px',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              appearance: 'none',
            }}
          />
          

        </div>
        
        {/* Slider Labels */}
        <div className="flex justify-between mt-2 px-1">
          {['0%', '25%', '50%', '75%', '100%'].map((label, index) => (
            <span 
              key={label}
              className={`text-xs font-medium select-none transition-colors duration-200 ${
                sliderValue >= index * 25 ? 'text-white' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Total display */}
      <div
        className="form-group total-container"
        style={{ borderRadius: "4px", overflow: "hidden" }}
      >
        <label>Total ({cryptoData?.usdtSymbol || "USDT"})</label>
        <span
          style={{
            flex: 1,
            textAlign: "right",
            fontFamily: "monospace",
            fontWeight: 500,
          }}
        >
          {/* Display total with 8 decimals but preserve full precision internally */}
          {formatNumber(parseFloat(total) || 0, 8, false)}
        </span>
      </div>

      {/* Balance info */}
      <div className="balance-info">
        {isAuthenticated ? (
          <>
            <span>
              Available:{" "}
              {formatNumber(getAvailableBalance(), 8)}{" "}
              {effectiveIsBuy
                ? cryptoData?.usdtSymbol || "USDT"
                : cryptoData?.cryptoSymbol || "BTC"}
            </span>
            <span>
              Max {effectiveIsBuy ? "buy" : "sell"}:{" "}
              {formatNumber(getMaxAmount(), 8)}{" "}
              {cryptoData?.cryptoSymbol || "BTC"}
            </span>

            {/* Validation feedback */}
            {(() => {
              const amountExists = !!amount;
              const isValid = isAmountValid();
              const isAtMax = isAtMaxBalance();
              const shouldShowWarning = amountExists && !isValid && !isAtMax;
              
              console.log('Warning display logic:', {
                amountExists,
                isValid,
                isAtMax,
                shouldShowWarning,
                amount: amount
              });
              
              return shouldShowWarning;
            })() && (
              <span 
                style={{ 
                  color: "#F23645", 
                  fontSize: "12px", 
                  marginTop: "4px",
                  display: "block"
                }}
              >
                ⚠ Insufficient balance. Max amount: {formatCryptoAmount(getMaxAmount())} {cryptoData?.cryptoSymbol || "BTC"}
              </span>
            )}
          </>
        ) : (
          <span>Login to view your balance</span>
        )}
      </div>

      {/* Buy/Sell Button */}
      {isAuthenticated ? (
        <button
          className={`buy-btn${effectiveIsBuy ? "" : " sell-btn"}`}
          disabled={isLoading || !amount || !isAmountValid()}
          onClick={handleTradeSubmit}
          style={{
            marginTop: 10,
            width: "100%",
            fontWeight: 600,
            fontSize: 18,
            padding: "12px 0",
            borderRadius: "4px",
            backgroundColor: (isLoading || !amount || !isAmountValid())
              ? "#666 !important"
              : effectiveIsBuy
              ? "#F88726 !important"
              : "#F23645 !important",
            backgroundImage: "none !important",
            color: "white !important",
            cursor: (isLoading || !amount || !isAmountValid()) ? "not-allowed !important" : "pointer !important",
            pointerEvents: (isLoading || !amount || !isAmountValid()) ? "none" : "auto",
            opacity: (isLoading || !amount || !isAmountValid()) ? 0.7 : 1,
            transition: "all 0.2s ease",
          }}
        >
          {isLoading ? (
            <>
              <i
                className="fas fa-spinner fa-spin"
                style={{ marginRight: "8px" }}
              ></i>
              Processing...
            </>
          ) : effectiveIsBuy ? (
            `Buy ${cryptoData?.cryptoSymbol || "BTC"}`
          ) : (
            `Sell ${cryptoData?.cryptoSymbol || "BTC"}`
          )}
        </button>
      ) : (
        <button
          className="spot-login-pill-btn"
          onClick={() => (window.location.href = "/login")}
          style={{
            width: "100% !important",
            padding: "12px 0 !important",
            fontSize: "16px !important",
            fontWeight: "600 !important",
            backgroundColor: "#ffffff !important",
            color: "#000000 !important",
            border: "none !important",
            borderRadius: "50px !important" /* Pill shape */,
            cursor: "pointer !important",
            transition: "all 0.2s !important",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1) !important",
            margin: "10px 0 !important",
            display: "block !important",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#f5f5f5 !important";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#ffffff !important";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          LOGIN TO TRADE
        </button>
      )}

      {/* Price info */}
      <div className="price-info">
        <span>Max price: {formatPrice(price * 1.05)}</span>
        <span>Fees: 0.1%</span>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <div className="notification-icon">{notification.icon}</div>
            <div className="notification-message">{notification.message}</div>
            <button
              className="notification-close"
              onClick={() => {
                if (notificationTimeout) {
                  clearTimeout(notificationTimeout);
                  setNotificationTimeout(null);
                }
                setNotification(null);
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeForm;
