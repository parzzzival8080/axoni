import React, { useState } from 'react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: 'What products does OKX provide?',
      answer: 'OKX provides a comprehensive suite of cryptocurrency products including trading, staking, NFTs, and Web3 tools.'
    },
    {
      question: 'How do I buy Bitcoin and other cryptocurrencies on OKX?',
      answer: 'You can buy crypto using credit/debit cards, bank transfers, or P2P trading on the OKX platform.'
    },
    {
      question: 'What is crypto?',
      answer: 'Cryptocurrency is a digital or virtual currency that uses cryptography for security and operates on decentralized networks based on blockchain technology.'
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq">
      <h2>Questions? We've got answers.</h2>
      <div className="accordion">
        {faqs.map((faq, index) => (
          <div className={`accordion-item ${activeIndex === index ? 'active' : ''}`} key={index}>
            <div className="accordion-header" onClick={() => toggleAccordion(index)}>
              <h3>{faq.question}</h3>
              <div className="accordion-icon">
                <i className={`fas fa-${activeIndex === index ? 'minus' : 'plus'}`}></i>
              </div>
            </div>
            <div className="accordion-content">
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ; 