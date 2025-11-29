import React, { useState } from 'react';
import './FAQAccording.css';

const FAQAccordion = () => {
  // State to track which FAQ items are open
  const [openItems, setOpenItems] = useState({});

  // FAQ data with questions and answers
  const faqItems = [
    {
      id: 1,
      question: "How do I convert crypto on AXONI?",
      answer: `You can convert any cryptocurrency to another on AXONI at anytime. It's instant and simple. On this page, select the crypto asset you want to convert and the asset you want to receive in exchange. Enter the amount you want to convert. You can also enter how much you would like to receive first.
      
      When you select the crypto you want to convert, you'll see your available balance right on this page. You can also buy or deposit more funds directly on this page. Once you've entered the amount of crypto you want to convert, confirm the conversion, and the crypto will be deposited to your AXONI account. If you have any questions, feel free to contact us directly at <a href="#" className="support-link">Support center</a>.`
    },
    {
      id: 2,
      question: "Which crypto can I convert on AXONI?",
      answer: "Almost all of the cryptocurrencies that AXONI supports can be instantly converted to another crypto listed on AXONI. We're committed to supporting the latest crypto assets as they come to market. Thus, we have a constantly changeing list of crypto supported by the converter. For a comprehensive breakdown of the hundreds of crypto currently available on AXONI. visit Cryptocurrency list. Simply select the 2 desired crypto and the converter's built-in calculator will provide an instant, competitive rate. There's no need to worry about placing an order or supported trading pairs, the converter takes care of it all. It's one of the fastest and most convenient ways to swap different digital currencies."
    },
    {
      id: 3,
      question: "How is crypto conversion different from trading?",
      answer: "The difference between using the crypto converter on AXONI and trading crypto on the spot market is that the converter automatically selects the best exchnage rate for the two selected crypto in real-time and lets you complete the conversion instantly at that rate. You don't have to worry about price slippage in a volatile market."
    },
    {
      id: 4,
      question: "What are the conditions of crypto converter?",
      answer: "After login, you can use the crypto converter. To ensure that you can withdraw the converted cryptom check your verification status and our platform's requirements. Learn more"
    },
    {
      id: 5,
      question: "Where can I find my converted crypto?",
      answer: "Converted crypto wil be deposited to your funding account."
    },
    {
      id: 6,
      question: "How do I check my conversion orders?",
      answer: "Select the Convert type in the history under Assets > Funding Account."
    },
    {
      id: 7,
      question: "How can I deposit/withdraw the crypto converted?",
      answer: "You can deposit/withdraw in funding account."
    }
  ];

  // Toggle function to open/close FAQ items
  const toggleItem = (id) => {
    setOpenItems(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  return (
    <div className="faq-container">
      <h2 className="faq-title">FAQ</h2>
      <div className="faq-list">
        {faqItems.map((item) => (
          <div key={item.id} className="faq-item">
            <div 
              className={`faq-question ${openItems[item.id] ? 'active' : ''}`}
              onClick={() => toggleItem(item.id)}
            >
              {item.question}
              <span className="faq-icon">{openItems[item.id] ? '−' : '+'}</span>
            </div>
            {openItems[item.id] && (
              <div className="faq-answer">
                <p dangerouslySetInnerHTML={{ __html: item.answer }}></p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQAccordion;