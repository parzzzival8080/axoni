import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import TradingChartWebView from '../pages/trading_chartWebView';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
      <Route path="/tradingviewEmbed" element={<TradingChartWebView />} />
    </Routes>
  );
};

export default AppRoutes; 