import React, { useState } from 'react';

const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b border-[#2A2A2A] last:border-b-0">
    <button
      className="w-full py-5 flex items-center justify-between text-left focus:outline-none"
      onClick={onClick}
    >
      <span className="text-white text-sm md:text-base font-medium pr-6">{question}</span>
      <div className={`w-6 h-6 rounded-full border border-[#2A2A2A] flex items-center justify-center flex-shrink-0 transition-all ${
        isOpen ? 'bg-[#2EBD85] border-[#2EBD85] rotate-45' : ''
      }`}>
        <span className={`text-sm font-bold leading-none ${isOpen ? 'text-white' : 'text-[#2EBD85]'}`}>+</span>
      </div>
    </button>
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
      isOpen ? 'max-h-96 pb-5' : 'max-h-0'
    }`}>
      <p className="text-[#848E9C] text-sm leading-relaxed pr-8">{answer}</p>
    </div>
  </div>
);

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: 'How do I create an account on GLD?',
      answer: 'Creating an account is simple. Click "Sign Up", enter your email, set a password, and verify your email with the OTP code. You can then complete KYC verification to access all trading features.'
    },
    {
      question: 'How do I deposit cryptocurrency?',
      answer: 'Go to Assets > Deposit, select the cryptocurrency you want to deposit, choose the correct network (e.g., ERC-20, TRC-20, BEP-20), and send funds to the displayed wallet address or scan the QR code.'
    },
    {
      question: 'What trading options are available?',
      answer: 'GLD offers Spot Trading (POS) for buying and selling crypto directly, Futures Trading (POW) with leverage, and Convert for quick swaps between cryptocurrencies with zero slippage.'
    },
    {
      question: 'How do I withdraw my funds?',
      answer: 'Navigate to Assets > Withdraw, select the crypto you want to withdraw, enter the destination wallet address and network, specify the amount, and confirm. Make sure the network matches your receiving wallet.'
    },
    {
      question: 'Is my account and funds secure?',
      answer: 'Yes. GLD uses industry-standard security including encrypted data storage, two-factor authentication, and regular Proof of Reserves audits to ensure your funds are always backed 1:1.'
    },
    {
      question: 'What are the trading fees?',
      answer: 'GLD offers competitive trading fees. Spot trading starts at 0.1% maker/taker fees, and conversion has zero trading fees. Check your account tier for specific fee schedules.'
    }
  ];

  return (
    <div className="bg-[#0a0a0a] py-6 md:py-10">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24">
        <div className="max-w-3xl">
          <h2 className="text-lg md:text-3xl font-bold mb-2 text-white">
            Frequently asked questions
          </h2>
          <p className="text-[#848E9C] text-sm md:text-base mb-6 md:mb-10">
            Everything you need to know about trading on GLD.
          </p>

          <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl px-4 md:px-6">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={activeIndex === index}
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
