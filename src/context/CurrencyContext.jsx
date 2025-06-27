import React, { createContext, useContext, useState, useEffect } from "react";

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
};

// Expanded currency symbols with internet-popular currencies
const CURRENCY_SYMBOLS = {
  // Major Reserve Currencies
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",

  // Asian Internet Markets
  CNY: "¥", // China - massive internet market
  KRW: "₩", // South Korea - gaming, e-commerce
  INR: "₹", // India - huge tech/internet population
  SGD: "S$", // Singapore - fintech hub
  HKD: "HK$", // Hong Kong - financial center
  TWD: "NT$", // Taiwan - tech manufacturing
  THB: "฿", // Thailand - growing digital economy
  VND: "₫", // Vietnam - emerging internet market
  MYR: "RM", // Malaysia - e-commerce growth
  PHP: "₱", // Philippines - large internet user base
  IDR: "Rp", // Indonesia - largest SE Asian economy

  // Oceania
  AUD: "A$", // Australia - developed internet market
  NZD: "NZ$", // New Zealand - high internet penetration

  // Americas
  CAD: "C$", // Canada - mature digital market
  BRL: "R$", // Brazil - largest Latin American market
  MXN: "$", // Mexico - growing e-commerce
  ARS: "$", // Argentina - crypto adoption
  COP: "$", // Colombia - fintech growth
  CLP: "$", // Chile - digital banking leader
  PEN: "S/", // Peru - e-commerce expansion

  // Europe
  CHF: "CHF", // Switzerland - fintech innovation
  NOK: "kr", // Norway - high digital adoption
  SEK: "kr", // Sweden - cashless society leader
  DKK: "kr", // Denmark - digital payments pioneer
  PLN: "zł", // Poland - large EU internet market
  CZK: "Kč", // Czech Republic - gaming industry
  HUF: "Ft", // Hungary - regional e-commerce
  RON: "lei", // Romania - IT outsourcing hub
  BGN: "лв", // Bulgaria - growing tech sector
  HRK: "kn", // Croatia - tourism/digital services
  RSD: "дин", // Serbia - emerging tech scene
  UAH: "₴", // Ukraine - large IT services sector
  RUB: "₽", // Russia - significant internet market
  TRY: "₺", // Turkey - bridge between Europe/Asia

  // Middle East & Africa
  AED: "د.إ", // UAE - fintech and crypto hub
  SAR: "﷼", // Saudi Arabia - Vision 2030 digital transformation
  QAR: "﷼", // Qatar - high GDP per capita
  KWD: "د.ك", // Kuwait - high purchasing power
  BHD: ".د.ب", // Bahrain - financial services
  OMR: "﷼", // Oman - growing digital economy
  JOD: "د.ا", // Jordan - tech talent hub
  LBP: "ل.ل", // Lebanon - diaspora remittances
  EGP: "£", // Egypt - largest Arab internet market
  MAD: "د.م.", // Morocco - French/Arabic markets
  TND: "د.ت", // Tunisia - tech startup scene
  DZD: "د.ج", // Algeria - oil economy digitization
  NGN: "₦", // Nigeria - largest African economy
  ZAR: "R", // South Africa - most developed African market
  KES: "KSh", // Kenya - mobile money innovation (M-Pesa)
  GHS: "₵", // Ghana - West African fintech

  // Cryptocurrency (increasingly used in internet commerce)
  BTC: "₿", // Bitcoin - most popular cryptocurrency
  ETH: "Ξ", // Ethereum - smart contracts platform

  // Special Administrative Regions
  MOP: "MOP$", // Macau - gaming industry
};

// Comprehensive list of internet-popular currencies
const POPULAR_CURRENCIES = [
  // Tier 1: Global Reserve & Major Internet Currencies
  { code: "USD", name: "US Dollar", symbol: "$", region: "Americas", tier: 1 },
  { code: "EUR", name: "Euro", symbol: "€", region: "Europe", tier: 1 },
  {
    code: "GBP",
    name: "British Pound",
    symbol: "£",
    region: "Europe",
    tier: 1,
  },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", region: "Asia", tier: 1 },

  // Tier 2: Major Internet Markets
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", region: "Asia", tier: 2 },
  {
    code: "KRW",
    name: "South Korean Won",
    symbol: "₩",
    region: "Asia",
    tier: 2,
  },
  { code: "INR", name: "Indian Rupee", symbol: "₹", region: "Asia", tier: 2 },
  {
    code: "CAD",
    name: "Canadian Dollar",
    symbol: "C$",
    region: "Americas",
    tier: 2,
  },
  {
    code: "AUD",
    name: "Australian Dollar",
    symbol: "A$",
    region: "Oceania",
    tier: 2,
  },
  {
    code: "BRL",
    name: "Brazilian Real",
    symbol: "R$",
    region: "Americas",
    tier: 2,
  },

  // Tier 3: Significant Internet Markets
  {
    code: "CHF",
    name: "Swiss Franc",
    symbol: "CHF",
    region: "Europe",
    tier: 3,
  },
  {
    code: "SGD",
    name: "Singapore Dollar",
    symbol: "S$",
    region: "Asia",
    tier: 3,
  },
  {
    code: "HKD",
    name: "Hong Kong Dollar",
    symbol: "HK$",
    region: "Asia",
    tier: 3,
  },
  {
    code: "NOK",
    name: "Norwegian Krone",
    symbol: "kr",
    region: "Europe",
    tier: 3,
  },
  {
    code: "SEK",
    name: "Swedish Krona",
    symbol: "kr",
    region: "Europe",
    tier: 3,
  },
  {
    code: "DKK",
    name: "Danish Krone",
    symbol: "kr",
    region: "Europe",
    tier: 3,
  },
  {
    code: "NZD",
    name: "New Zealand Dollar",
    symbol: "NZ$",
    region: "Oceania",
    tier: 3,
  },
  {
    code: "MXN",
    name: "Mexican Peso",
    symbol: "$",
    region: "Americas",
    tier: 3,
  },

  // Tier 4: Emerging Internet Markets
  {
    code: "TWD",
    name: "Taiwan Dollar",
    symbol: "NT$",
    region: "Asia",
    tier: 4,
  },
  { code: "THB", name: "Thai Baht", symbol: "฿", region: "Asia", tier: 4 },
  {
    code: "MYR",
    name: "Malaysian Ringgit",
    symbol: "RM",
    region: "Asia",
    tier: 4,
  },
  {
    code: "PHP",
    name: "Philippine Peso",
    symbol: "₱",
    region: "Asia",
    tier: 4,
  },
  {
    code: "IDR",
    name: "Indonesian Rupiah",
    symbol: "Rp",
    region: "Asia",
    tier: 4,
  },
  {
    code: "VND",
    name: "Vietnamese Dong",
    symbol: "₫",
    region: "Asia",
    tier: 4,
  },
  {
    code: "PLN",
    name: "Polish Zloty",
    symbol: "zł",
    region: "Europe",
    tier: 4,
  },
  {
    code: "CZK",
    name: "Czech Koruna",
    symbol: "Kč",
    region: "Europe",
    tier: 4,
  },
  {
    code: "HUF",
    name: "Hungarian Forint",
    symbol: "Ft",
    region: "Europe",
    tier: 4,
  },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", region: "Europe", tier: 4 },
  {
    code: "RUB",
    name: "Russian Ruble",
    symbol: "₽",
    region: "Europe",
    tier: 4,
  },
  {
    code: "AED",
    name: "UAE Dirham",
    symbol: "د.إ",
    region: "Middle East",
    tier: 4,
  },
  {
    code: "SAR",
    name: "Saudi Riyal",
    symbol: "﷼",
    region: "Middle East",
    tier: 4,
  },
  {
    code: "ZAR",
    name: "South African Rand",
    symbol: "R",
    region: "Africa",
    tier: 4,
  },
  {
    code: "NGN",
    name: "Nigerian Naira",
    symbol: "₦",
    region: "Africa",
    tier: 4,
  },
  {
    code: "ARS",
    name: "Argentine Peso",
    symbol: "$",
    region: "Americas",
    tier: 4,
  },
  {
    code: "COP",
    name: "Colombian Peso",
    symbol: "$",
    region: "Americas",
    tier: 4,
  },
  {
    code: "CLP",
    name: "Chilean Peso",
    symbol: "$",
    region: "Americas",
    tier: 4,
  },

  // Tier 5: Specialized/Regional Internet Markets
  {
    code: "KES",
    name: "Kenyan Shilling",
    symbol: "KSh",
    region: "Africa",
    tier: 5,
  },
  {
    code: "EGP",
    name: "Egyptian Pound",
    symbol: "£",
    region: "Africa",
    tier: 5,
  },
  {
    code: "QAR",
    name: "Qatari Riyal",
    symbol: "﷼",
    region: "Middle East",
    tier: 5,
  },
  {
    code: "KWD",
    name: "Kuwaiti Dinar",
    symbol: "د.ك",
    region: "Middle East",
    tier: 5,
  },
  {
    code: "BHD",
    name: "Bahraini Dinar",
    symbol: ".د.ب",
    region: "Middle East",
    tier: 5,
  },
  {
    code: "OMR",
    name: "Omani Rial",
    symbol: "﷼",
    region: "Middle East",
    tier: 5,
  },
  {
    code: "JOD",
    name: "Jordanian Dinar",
    symbol: "د.ا",
    region: "Middle East",
    tier: 5,
  },
  {
    code: "LBP",
    name: "Lebanese Pound",
    symbol: "ل.ل",
    region: "Middle East",
    tier: 5,
  },
  {
    code: "UAH",
    name: "Ukrainian Hryvnia",
    symbol: "₴",
    region: "Europe",
    tier: 5,
  },
  {
    code: "RON",
    name: "Romanian Leu",
    symbol: "lei",
    region: "Europe",
    tier: 5,
  },
  {
    code: "BGN",
    name: "Bulgarian Lev",
    symbol: "лв",
    region: "Europe",
    tier: 5,
  },
  {
    code: "HRK",
    name: "Croatian Kuna",
    symbol: "kn",
    region: "Europe",
    tier: 5,
  },
  {
    code: "RSD",
    name: "Serbian Dinar",
    symbol: "дин",
    region: "Europe",
    tier: 5,
  },
  {
    code: "PEN",
    name: "Peruvian Sol",
    symbol: "S/",
    region: "Americas",
    tier: 5,
  },
  {
    code: "GHS",
    name: "Ghanaian Cedi",
    symbol: "₵",
    region: "Africa",
    tier: 5,
  },
  {
    code: "MAD",
    name: "Moroccan Dirham",
    symbol: "د.م.",
    region: "Africa",
    tier: 5,
  },
  {
    code: "TND",
    name: "Tunisian Dinar",
    symbol: "د.ت",
    region: "Africa",
    tier: 5,
  },
  {
    code: "DZD",
    name: "Algerian Dinar",
    symbol: "د.ج",
    region: "Africa",
    tier: 5,
  },
  {
    code: "MOP",
    name: "Macanese Pataca",
    symbol: "MOP$",
    region: "Asia",
    tier: 5,
  },
];

// Configuration for different currency formatting rules
const CURRENCY_CONFIG = {
  // Zero decimal places currencies (typically high-value, low-decimal usage)
  zeroDecimals: [
    "JPY",
    "KRW",
    "VND",
    "IDR",
    "KMF",
    "BIF",
    "DJF",
    "GNF",
    "ISK",
    "LAK",
    "PYG",
    "RWF",
    "UGX",
    "VUV",
    "XAF",
    "XOF",
    "XPF",
  ],

  // Three decimal places currencies (precision required)
  threeDecimals: ["BHD", "JOD", "KWD", "OMR", "TND"],

  // High-value currencies (different formatting for readability)
  highValue: ["BHD", "JOD", "KWD", "OMR"],

  // Right-to-left currencies (Arabic, Hebrew)
  rtl: [
    "AED",
    "SAR",
    "QAR",
    "KWD",
    "BHD",
    "OMR",
    "JOD",
    "LBP",
    "EGP",
    "MAD",
    "TND",
    "DZD",
  ],
};

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    return localStorage.getItem("selectedCurrency") || "USD";
  });

  const [exchangeRates, setExchangeRates] = useState({ USD: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Fetches exchange rates from multiple sources for reliability
   * Falls back to alternative APIs if primary fails
   */
  const fetchExchangeRates = async (targetCurrency = selectedCurrency) => {
    if (targetCurrency === "USD") {
      setExchangeRates({ USD: 1 });
      setError(null);
      setLastUpdated(new Date());
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Primary API: Frankfurter (European Central Bank data)
      let response = await fetch(
        `https://api.frankfurter.app/latest?from=USD&to=${targetCurrency}`,
        {
          headers: {
            Accept: "application/json",
            "User-Agent": "CurrencyApp/1.0",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.rates && data.rates[targetCurrency]) {
        setExchangeRates({
          USD: 1,
          [targetCurrency]: data.rates[targetCurrency],
        });
        setLastUpdated(new Date(data.date));
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Primary exchange rate fetch failed:", error);

      // Fallback: Try alternative free API
      try {
        const fallbackResponse = await fetch(
          `https://api.exchangerate-api.com/v4/latest/USD`,
        );

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.rates && fallbackData.rates[targetCurrency]) {
            setExchangeRates({
              USD: 1,
              [targetCurrency]: fallbackData.rates[targetCurrency],
            });
            setLastUpdated(new Date());
            console.log("Using fallback exchange rate API");
            return;
          }
        }
      } catch (fallbackError) {
        console.error("Fallback exchange rate fetch failed:", fallbackError);
      }

      // Final fallback: maintain previous rates or default
      setError("Unable to fetch current exchange rates. Using cached data.");
      if (!exchangeRates[targetCurrency]) {
        setExchangeRates({ USD: 1 });
      }
    } finally {
      setLoading(false);
    }
  };

  // Effect to handle currency changes and persistence
  useEffect(() => {
    fetchExchangeRates();
    localStorage.setItem("selectedCurrency", selectedCurrency);
  }, [selectedCurrency]);

  // Auto-refresh rates every 30 minutes for active sessions
  useEffect(() => {
    const interval = setInterval(
      () => {
        if (selectedCurrency !== "USD") {
          fetchExchangeRates();
        }
      },
      30 * 60 * 1000,
    ); // 30 minutes

    return () => clearInterval(interval);
  }, [selectedCurrency]);

  /**
   * Converts amount between currencies with validation
   * @param {number} amount - Amount to convert
   * @param {string} fromCurrency - Source currency code
   * @param {string} toCurrency - Target currency code (defaults to selected)
   * @returns {number} Converted amount
   */
  const convertAmount = (
    amount,
    fromCurrency = "USD",
    toCurrency = selectedCurrency,
  ) => {
    if (!amount || isNaN(amount) || amount < 0) return 0;
    if (fromCurrency === toCurrency) return amount;

    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;

    // Convert to USD first, then to target currency
    const usdAmount = fromCurrency === "USD" ? amount : amount / fromRate;
    return toCurrency === "USD" ? usdAmount : usdAmount * toRate;
  };

  /**
   * Formats currency with proper localization and symbols
   * @param {number} amount - Amount to format
   * @param {string} fromCurrency - Source currency
   * @param {boolean} showSymbol - Whether to show currency symbol
   * @param {boolean} compact - Whether to use compact notation for large numbers
   * @returns {string} Formatted currency string
   */
  const formatCurrency = (
    amount,
    fromCurrency = "USD",
    showSymbol = true,
    compact = false,
  ) => {
    const convertedAmount = convertAmount(amount, fromCurrency);

    // Determine decimal places based on currency
    let minimumFractionDigits = 2;
    let maximumFractionDigits = 2;

    if (CURRENCY_CONFIG.zeroDecimals.includes(selectedCurrency)) {
      minimumFractionDigits = 0;
      maximumFractionDigits = 0;
    } else if (CURRENCY_CONFIG.threeDecimals.includes(selectedCurrency)) {
      minimumFractionDigits = 3;
      maximumFractionDigits = 3;
    }

    // Format number with proper localization
    const formattedNumber = convertedAmount.toLocaleString(undefined, {
      minimumFractionDigits,
      maximumFractionDigits,
      notation: compact && convertedAmount >= 1000000 ? "compact" : "standard",
      compactDisplay: "short",
    });

    if (!showSymbol) return formattedNumber;

    const symbol = CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency;

    // Handle RTL currencies (symbol positioning)
    if (CURRENCY_CONFIG.rtl.includes(selectedCurrency)) {
      return `${formattedNumber} ${symbol}`;
    }

    return `${symbol}${formattedNumber}`;
  };

  /**
   * Gets currency information by code
   * @param {string} code - Currency code
   * @returns {object|null} Currency information object
   */
  const getCurrencyInfo = (code) => {
    return (
      POPULAR_CURRENCIES.find((currency) => currency.code === code) || null
    );
  };

  /**
   * Filters currencies by region or tier
   * @param {string} region - Region filter
   * @param {number} tier - Tier filter
   * @returns {array} Filtered currencies
   */
  const getFilteredCurrencies = (region = null, tier = null) => {
    return POPULAR_CURRENCIES.filter((currency) => {
      const regionMatch = !region || currency.region === region;
      const tierMatch = !tier || currency.tier === tier;
      return regionMatch && tierMatch;
    });
  };

  // Context value object
  const contextValue = {
    // State
    selectedCurrency,
    exchangeRates,
    loading,
    error,
    lastUpdated,

    // Actions
    setSelectedCurrency,
    refreshRates: fetchExchangeRates,

    // Utilities
    convertAmount,
    formatCurrency,
    getCurrencyInfo,
    getFilteredCurrencies,

    // Data
    currencies: POPULAR_CURRENCIES,
    currencySymbols: CURRENCY_SYMBOLS,
    currencyConfig: CURRENCY_CONFIG,

    // Computed properties
    isLoading: loading,
    hasError: !!error,
    isUSD: selectedCurrency === "USD",
    supportedCurrencies: POPULAR_CURRENCIES.map((c) => c.code),
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

// Export additional utilities for advanced usage
export const REGIONS = [...new Set(POPULAR_CURRENCIES.map((c) => c.region))];
export const TIERS = [...new Set(POPULAR_CURRENCIES.map((c) => c.tier))].sort();
export { CURRENCY_SYMBOLS, POPULAR_CURRENCIES, CURRENCY_CONFIG };
