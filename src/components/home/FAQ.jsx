import React, { useState } from 'react';

const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className="border-b border-gray-700">
    <button
      className="w-full py-6 flex items-center justify-between text-left focus:outline-none group"
      onClick={onClick}
    >
      <span className="text-white text-base sm:text-lg font-medium pr-8">{question}</span>
      <div className="flex-shrink-0">
        <div className={`w-6 h-6 rounded-full border-2 border-yellow-500 flex items-center justify-center transition-transform ${
          isOpen ? 'rotate-45' : ''
        }`}>
          <span className="text-yellow-500 text-lg font-bold">+</span>
        </div>
      </div>
    </button>
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96 pb-6' : 'max-h-0'
      }`}
    >
      <p className="text-gray-400 text-sm leading-relaxed pr-8">{answer}</p>
    </div>
  </div>
);

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const faqs = [
    {
      question: 'Does our company provide support post-launch of the product?',
      answer: 'Definitely! We believe in providing support even after your app gets launched in the market by continuously updating the app according to the latest trends and providing security against unwanted threats and viruses for four months free of charge after the completion of the development process of your app.'
    },
    {
      question: 'What sets our company apart from our competitors?',
      answer: 'Our company stands out through our commitment to innovation, customer-centric approach, and comprehensive post-launch support that ensures your success in the competitive market.'
    },
    {
      question: 'Does our company offer both native and cross-platform iPhone app development services?',
      answer: 'Yes, we offer both native iOS development using Swift and cross-platform solutions using frameworks like React Native and Flutter to meet your specific business needs.'
    },
    {
      question: 'Does our company provide a testimony of previous clients?',
      answer: 'Absolutely! We have a portfolio of successful projects and client testimonials that demonstrate our expertise and commitment to delivering high-quality solutions.'
    },
    {
      question: 'How does billing work?',
      answer: 'Our billing is transparent and flexible. We offer various payment models including fixed-price projects, hourly rates, and milestone-based payments to suit your budget and project requirements.'
    },
    {
      question: 'How do I change my account email?',
      answer: 'You can easily change your account email by going to your account settings, selecting the email section, and following the verification process to update your contact information.'
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="bg-black py-16">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24">
        <div className="max-w-4xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white">
            Frequently asked questions
          </h2>
          <p className="text-gray-400 text-base sm:text-lg mb-8 sm:mb-12">
            Everything you need to know about the product and billing.
          </p>
          
          <div className="space-y-0">
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
    </div>
  );
};

export default FAQ;