import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: "Spot Trading",
    desc: "Buy, sell, and trade 50+ cryptocurrencies with deep liquidity and tight spreads.",
    cta: "Trade now",
    link: "/spot-trading",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    title: "Futures Trading",
    desc: "Trade perpetual contracts with up to 100x leverage on BTC, ETH, and 50+ altcoins.",
    cta: "Trade futures",
    link: "/future-trading",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    title: "Earn",
    desc: "Put your crypto to work. Earn passive income with flexible staking up to 12% APY.",
    cta: "Start earning",
    link: "/earn",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M16 8l-8 8M8 8h8v8" />
      </svg>
    ),
  },
  {
    title: "Convert",
    desc: "Swap between cryptocurrencies instantly with zero slippage. No order book needed.",
    cta: "Convert now",
    link: "/conversion",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 7h12l-4-4M16 17H4l4 4" />
      </svg>
    ),
  },
];

const Services = () => (
  <div className="bg-[#0a0a0a] py-16 md:py-24">
    <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24">
      <div className="text-center mb-14">
        <h2 className="text-2xl md:text-4xl lg:text-[42px] font-bold text-white mb-4 tracking-tight">One platform, endless possibilities</h2>
        <p className="text-[#848E9C] text-sm md:text-base max-w-lg mx-auto">Everything you need to buy, sell, trade, and earn crypto — all in one place.</p>
      </div>

      {/* 2x2 feature grid — large cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {features.map((f) => (
          <Link
            key={f.title}
            to={f.link}
            className="group bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-8 md:p-10 hover:border-[#2EBD85]/30 transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#2EBD85]/10 flex items-center justify-center mb-6 group-hover:bg-[#2EBD85]/20 transition-colors">
              {f.icon}
            </div>
            <h3 className="text-white text-xl md:text-2xl font-semibold mb-3">{f.title}</h3>
            <p className="text-[#848E9C] text-sm md:text-base leading-relaxed mb-6">{f.desc}</p>
            <span className="inline-flex items-center text-[#2EBD85] text-sm font-medium group-hover:gap-2 transition-all">
              {f.cta}
              <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </span>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default Services;
