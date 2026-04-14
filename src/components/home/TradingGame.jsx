import React from 'react';

const trustItems = [
  {
    title: "Proven reliability",
    desc: "Trade with confidence. Over 3M traders trust GLD to keep them in control through every market move.",
    icon: (
      <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
        <rect x="15" y="30" width="50" height="35" rx="3" stroke="#848E9C" strokeWidth="2" fill="none" />
        <path d="M20 30L40 15L60 30" stroke="#848E9C" strokeWidth="2" fill="none" />
        <rect x="33" y="42" width="14" height="23" rx="1" stroke="#848E9C" strokeWidth="1.5" fill="none" />
        <circle cx="40" cy="50" r="3" stroke="#848E9C" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Transparent reserves",
    desc: "Your assets are secure and verified through our Proof of Reserves. We're here for you 24/7.",
    icon: (
      <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
        <rect x="18" y="12" width="34" height="48" rx="3" stroke="#848E9C" strokeWidth="2" fill="none" />
        <line x1="26" y1="24" x2="44" y2="24" stroke="#848E9C" strokeWidth="1.5" />
        <line x1="26" y1="32" x2="40" y2="32" stroke="#848E9C" strokeWidth="1.5" />
        <line x1="26" y1="40" x2="44" y2="40" stroke="#848E9C" strokeWidth="1.5" />
        <circle cx="54" cy="44" r="14" stroke="#848E9C" strokeWidth="2" fill="none" />
        <path d="M48 44L52 48L60 40" stroke="#848E9C" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
  {
    title: "Easy deposits",
    desc: "Make instant, seamless deposits on-chain. Multiple payment methods including crypto and fiat.",
    icon: (
      <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
        <rect x="12" y="18" width="40" height="50" rx="6" stroke="#848E9C" strokeWidth="2" fill="none" />
        <rect x="20" y="26" width="24" height="16" rx="2" stroke="#848E9C" strokeWidth="1.5" fill="none" />
        <circle cx="32" cy="56" r="3" stroke="#848E9C" strokeWidth="1.5" />
        <circle cx="58" cy="30" r="10" stroke="#848E9C" strokeWidth="2" fill="none" />
        <path d="M58 25V35M53 30H63" stroke="#848E9C" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Secure verification",
    desc: "Verify your identity in minutes with photo ID. Once set up, access all trading features.",
    icon: (
      <svg width="64" height="64" viewBox="0 0 80 80" fill="none">
        <rect x="14" y="20" width="36" height="40" rx="4" stroke="#848E9C" strokeWidth="2" fill="none" />
        <circle cx="32" cy="34" r="8" stroke="#848E9C" strokeWidth="1.5" fill="none" />
        <path d="M22 52c0-6 4.5-10 10-10s10 4 10 10" stroke="#848E9C" strokeWidth="1.5" fill="none" />
        <circle cx="58" cy="44" r="12" stroke="#848E9C" strokeWidth="2" fill="#2EBD85" fillOpacity="0.15" />
        <path d="M52 44L56 48L64 40" stroke="#2EBD85" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
];

const TradingGame = () => (
  <div className="bg-[#0a0a0a] py-20 md:py-32">
    <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24">
      {/* Big centered heading */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-16 md:mb-24 tracking-tight">
        Your secure partner for<br className="hidden sm:block" /> crypto trading
      </h2>

      {/* 4 trust columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
        {trustItems.map((item) => (
          <div key={item.title} className="text-center">
            <div className="flex justify-center mb-6">
              {item.icon}
            </div>
            <h3 className="text-white font-bold text-lg mb-3">{item.title}</h3>
            <p className="text-[#848E9C] text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default TradingGame;
