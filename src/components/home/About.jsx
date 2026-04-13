import React from 'react';
import { Link } from 'react-router-dom';

const services = [
  {
    title: "Spot Trading",
    desc: "Buy and sell crypto at current market prices with deep liquidity.",
    link: "/spot-trading",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    title: "Perpetual Futures",
    desc: "Trade with up to 100x leverage on top cryptocurrencies.",
    link: "/future-trading",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    title: "GLD Earn",
    desc: "Earn passive income with flexible staking and savings products.",
    link: "/earn",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
      </svg>
    ),
  },
  {
    title: "Convert",
    desc: "Instant crypto swaps with zero slippage. Simple and fast.",
    link: "/conversion",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 7h12l-4-4M16 17H4l4 4" />
      </svg>
    ),
  },
];

const Services = () => (
  <div className="bg-[#0a0a0a] py-8 md:py-12">
    <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24">
      <div className="mb-10">
        <h2 className="text-xl md:text-3xl font-bold text-white mb-2">Trade your way</h2>
        <p className="text-[#848E9C] text-sm md:text-base">Multiple products designed for every type of trader</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((s) => (
          <Link
            key={s.title}
            to={s.link}
            className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-5 hover:border-[#2EBD85]/30 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2EBD85]/10 flex items-center justify-center mb-4 group-hover:bg-[#2EBD85]/20 transition-colors">
              {s.icon}
            </div>
            <h3 className="text-white font-semibold mb-1.5">{s.title}</h3>
            <p className="text-[#848E9C] text-sm leading-relaxed">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default Services;
