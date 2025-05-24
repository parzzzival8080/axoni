import React, { useState } from 'react';

const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b border-gray-800">
    <button
      className="w-full py-4 flex items-center justify-between text-left focus:outline-none"
      onClick={onClick}
    >
      <span className="text-lg font-semibold text-white">{question}</span>
      <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
        ▼
      </span>
    </button>
    <div
      className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48' : 'max-h-0'}`}
    >
      <p className="pb-4 text-gray-400">{answer}</p>
    </div>
  </div>
);

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: 'What is cryptocurrency and how does it work?',
      answer: 'Cryptocurrency is a digital or virtual form of currency that uses cryptography for security. It operates on decentralized networks based on blockchain technology.'
    },
    {
      question: 'How do I create an account?',
      answer: 'Creating an account is simple. Click the Sign Up button, provide your email, create a password, and follow the verification steps. The process takes just a few minutes.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept various payment methods including bank transfers, credit/debit cards, and cryptocurrency deposits. Available methods may vary by region.'
    },
    {
      question: 'Is my crypto secure with you?',
      answer: 'Yes, we employ industry-leading security measures including cold storage, two-factor authentication, and regular security audits to protect your assets.'
    },
    {
      question: 'What are the trading fees?',
      answer: 'Our trading fees are competitive and vary based on your trading volume. View our fee schedule for detailed information about maker and taker fees.'
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="bg-black py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={activeIndex === index}
              onClick={() => toggleAccordion(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;