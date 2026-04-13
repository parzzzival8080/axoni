import React from 'react';
import { Link } from 'react-router-dom';

const steps = [
  {
    num: "01",
    title: "Create Account",
    desc: "Sign up in seconds with your email. Verify your identity to unlock all features.",
    cta: "Sign Up",
    link: "/signup",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    num: "02",
    title: "Fund Your Account",
    desc: "Deposit crypto or buy with fiat. Multiple payment methods supported.",
    cta: "Deposit",
    link: "/deposit",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12V7H5a2 2 0 010-4h14v4" /><path d="M3 5v14a2 2 0 002 2h16v-5" /><path d="M18 12a2 2 0 000 4h4v-4h-4z" />
      </svg>
    ),
  },
  {
    num: "03",
    title: "Start Trading",
    desc: "Trade spot, futures, or earn passive income. Advanced tools at your fingertips.",
    cta: "Trade Now",
    link: "/spot-trading",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
];

const Journey = () => (
  <div className="bg-[#0a0a0a] py-8 md:py-12">
    <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24">
      <div className="mb-10">
        <h2 className="text-xl md:text-3xl font-bold text-white mb-2">Get started in minutes</h2>
        <p className="text-[#848E9C] text-sm md:text-base">Three simple steps to start your crypto journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((step) => (
          <div key={step.num} className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl p-6 hover:border-[#2EBD85]/30 transition-all group flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#2EBD85]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#2EBD85]/20 transition-colors">
                {step.icon}
              </div>
              <span className="text-[#2EBD85] text-xs font-bold tracking-wider">{step.num}</span>
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-[#848E9C] text-sm leading-relaxed mb-5 flex-1">{step.desc}</p>
            <Link
              to={step.link}
              className="inline-flex items-center text-[#2EBD85] text-sm font-medium hover:underline"
            >
              {step.cta}
              <svg className="ml-1.5 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Journey;
