import React, { useState } from 'react'

function OrderBook() {
  const [isLoading, setIsLoading] = useState(false);

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="order-book-loading">
      <div className="spinner"></div>
      <div className="loading-text">Loading order book...</div>
    </div>
  );

  return (
    <div className="orderbook-section">
      <div className="book-header">
        <div className="tab active">Order book</div>
        <div className="tab">Last trades</div>
        <div className="layout-toggle"><i className="fas fa-columns"></i></div>
        <div className="more"><i className="fas fa-ellipsis-v"></i></div>
      </div>

      <div className="order-book">
        <div className="decimals">
          <div className="decimal active">0.1</div>
          <i className="fas fa-chevron-down"></i>
        </div>

        <div className="book-headers">
          <div className="price-header">Price (USDT)</div>
          <div className="amount-header">Amount (Contracts)</div>
          <div className="total-header">Total (Contracts)</div>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="sell-orders">
              {[
                { price: 86069.1, amount: 0.03507, total: 0.67155, percentage: 20 },
                { price: 86066.0, amount: 0.02870, total: 0.63648, percentage: 15 },
                { price: 86064.5, amount: 0.03130, total: 0.60778, percentage: 17 },
                { price: 86064.0, amount: 0.02870, total: 0.57648, percentage: 15 },
                { price: 86063.9, amount: 0.00083, total: 0.54778, percentage: 5 },
                { price: 86062.5, amount: 0.03507, total: 0.54695, percentage: 20 },
                { price: 86062.1, amount: 0.12436, total: 0.51188, percentage: 40 },
                { price: 86062.0, amount: 0.02870, total: 0.38752, percentage: 15 },
                { price: 86061.9, amount: 0.05477, total: 0.35882, percentage: 25 },
                { price: 86060.1, amount: 0.30406, total: 0.30406, percentage: 60 }
              ].map((order, index) => (
                <div className="order-row" key={`sell-${index}`}>
                  <div className="order-bar sell" style={{ width: `${order.percentage}%` }}></div>
                  <div className="order-price sell">{order.price.toFixed(1)}</div>
                  <div className="order-amount">{order.amount.toFixed(5)}</div>
                  <div className="order-total">{order.total.toFixed(5)}</div>
                </div>
              ))}
            </div>

            <div className="current-price">
              <div className="price-value">86,064.5</div>
              <div className="price-usd">≈ $86,064.17</div>
            </div>

            <div className="buy-orders">
              {[
                { price: 86060.0, amount: 0.45549, total: 0.45549, percentage: 65 },
                { price: 86059.9, amount: 0.03179, total: 0.48728, percentage: 17 },
                { price: 86058.7, amount: 0.00102, total: 0.48830, percentage: 2 },
                { price: 86058.1, amount: 0.04867, total: 0.53697, percentage: 23 },
                { price: 86058.0, amount: 0.09355, total: 0.63052, percentage: 35 },
                { price: 86056.0, amount: 0.02870, total: 0.65922, percentage: 15 },
                { price: 86055.7, amount: 0.00580, total: 0.66502, percentage: 4 },
                { price: 86055.6, amount: 0.02560, total: 0.69062, percentage: 14 },
                { price: 86055.5, amount: 0.04000, total: 0.73062, percentage: 20 },
                { price: 86055.4, amount: 0.01162, total: 0.74224, percentage: 8 }
              ].map((order, index) => (
                <div className="order-row" key={`buy-${index}`}>
                  <div className="order-bar buy" style={{ width: `${order.percentage}%` }}></div>
                  <div className="order-price buy">{order.price.toFixed(1)}</div>
                  <div className="order-amount">{order.amount.toFixed(5)}</div>
                  <div className="order-total">{order.total.toFixed(5)}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderBook