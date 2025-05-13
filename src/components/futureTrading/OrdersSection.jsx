import React, { useState } from 'react';
import OrderHistory from './OrderHistory';
import FutureAssetsList from './FutureAssetsList';
import './FutureTrading.css';

const OrdersSection = ({ refreshTrigger = 0 }) => {
  const [activeTab, setActiveTab] = useState('order-history');

  return (
    <div className="orders-section" style={{ backgroundColor: '#000000', marginTop: '20px' }}>
      <div className="orders-tabs flex items-center border-b border-gray-800 mb-4">
        <div
          className={`tab ${activeTab === 'order-history' ? 'active' : ''}`}
          onClick={() => setActiveTab('order-history')}
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
      <div className="orders-content">
        {activeTab === 'order-history' && <OrderHistory refreshTrigger={refreshTrigger} />}
        {activeTab === 'assets' && <FutureAssetsList />}
      </div>
    </div>
  );
}

export default OrdersSection;
