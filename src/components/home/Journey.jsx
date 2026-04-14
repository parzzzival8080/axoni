import React from 'react';
import { Link } from 'react-router-dom';

const steps = [
  {
    num: "01",
    title: "Create Account",
    desc: "Sign up in seconds with your email. Verify your identity to unlock all features.",
    cta: "Sign Up",
    link: "/signup",
  },
  {
    num: "02",
    title: "Fund Your Account",
    desc: "Deposit crypto or buy with fiat. Multiple payment methods supported.",
    cta: "Deposit",
    link: "/deposit",
  },
  {
    num: "03",
    title: "Start Trading",
    desc: "Trade spot, futures, or earn passive income. Advanced tools at your fingertips.",
    cta: "Trade Now",
    link: "/spot-trading",
  },
];

const Journey = () => (
  <div className="bg-[#0a0a0a] py-12 md:py-20">
    <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24">
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">Get started in minutes</h2>
        <p className="text-[#848E9C] text-sm md:text-base max-w-lg mx-auto">Three simple steps to start your crypto journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => (
          <div key={step.num} className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-8 hover:border-[#2EBD85]/20 transition-all group text-center">
            <div className="w-12 h-12 rounded-full bg-[#2EBD85]/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#2EBD85]/20 transition-colors">
              <span className="text-[#2EBD85] text-sm font-bold">{step.num}</span>
            </div>
            <h3 className="text-white text-lg font-semibold mb-3">{step.title}</h3>
            <p className="text-[#848E9C] text-sm leading-relaxed mb-6">{step.desc}</p>
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
