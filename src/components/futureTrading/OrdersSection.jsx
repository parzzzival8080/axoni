import React, { useState } from 'react';
import OrderHistory from './OrderHistory';
import './FutureTrading.css';

const OrdersSection = ({ refreshTrigger = 0 }) => {
  const [activeTab, setActiveTab] = useState('order-history');

  return (
    <div className="orders-section" style={{ backgroundColor: '#000000', marginTop: '20px' }}>
      <div className="orders-tabs">
        <div
          className={`tab ${activeTab === 'open-orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('open-orders')}
        >
          Open orders
        </div>
        <div
          className={`tab ${activeTab === 'order-history' ? 'active' : ''}`}
          onClick={() => setActiveTab('order-history')}
        >
          Order history
        </div>
        <div
          className={`tab ${activeTab === 'open-positions' ? 'active' : ''}`}
          onClick={() => setActiveTab('open-positions')}
        >
          Open positions
        </div>
        <div
          className={`tab ${activeTab === 'position-history' ? 'active' : ''}`}
          onClick={() => setActiveTab('position-history')}
        >
          Position history
        </div>
        <div
          className={`tab ${activeTab === 'assets' ? 'active' : ''}`}
          onClick={() => setActiveTab('assets')}
        >
          Assets
        </div>
        <div
          className={`tab ${activeTab === 'bots' ? 'active' : ''}`}
          onClick={() => setActiveTab('bots')}
        >
          Bots
        </div>
        <div className="more-options">
          <i className="fas fa-ellipsis-v"></i>
        </div>
      </div>

      <div className="orders-content">
        {activeTab === 'order-history' && <OrderHistory refreshTrigger={refreshTrigger} />}
        {/* Add other tab content components here */}
      </div>
    </div>
  );
};

export default OrdersSection;
