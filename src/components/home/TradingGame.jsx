import React from 'react';
import { Link } from 'react-router-dom';

const stats = [
  { value: "500+", label: "Trading Pairs" },
  { value: "$2B+", label: "24h Volume" },
  { value: "3M+", label: "Global Users" },
  { value: "<10ms", label: "Order Execution" },
];

const TradingGame = () => (
  <div className="relative bg-[#0a0a0a] py-8 md:py-12 overflow-hidden">
    {/* Subtle background glow */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2EBD85]/[0.03] rounded-full blur-[120px]" />

    <div className="relative container mx-auto px-4 sm:px-8 md:px-16 lg:px-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
          Level up your trading game
        </h2>
        <p className="text-[#848E9C] text-sm md:text-base leading-relaxed">
          Low costs, high-speed execution, powerful tools, and deep liquidity — everything you need to trade with confidence.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-5 text-center">
            <p className="text-2xl md:text-3xl font-bold text-[#2EBD85] mb-1">{s.value}</p>
            <p className="text-[#848E9C] text-xs md:text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link
          to="/spot-trading"
          className="inline-flex items-center gap-2 bg-[#2EBD85] hover:bg-[#259A6C] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          Start Trading
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </div>
    </div>
  </div>
);

export default TradingGame;
