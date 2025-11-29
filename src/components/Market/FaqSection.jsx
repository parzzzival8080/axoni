import React, { useState } from 'react';

const FaqSection = () => {
  const [openFaqs, setOpenFaqs] = useState([]);

  const faqs = [
    {
      id: 'market-cap',
      question: 'How do you calculate crypto market cap?',
      answer: 'A cryptocurrency market capitalization, or market cap, is calculated by its current price at any given moment.'
    },
    {
      id: 'top-coins',
      question: 'What are the top 10 cryptocurrencies?',
      answer: 'Typically, top cryptocurrencies are ranked based on their market capitalization. On this page, you can view the market caps of all cryptocurrencies available on AXONI. Additionally, you can sort the columns for price change and market capitalization in either ascending or descending order.'
    },
    {
      id: 'price-changes',
      question: 'What determines cryptocurrency price changes?',
      answer: 'Cryptocurrency prices reflect the current supply and demand trends for that digital asset. When buying pressure in the market outweighs selling pressure, the price rises. Similarly, when sellers outnumber buyers, the price falls. Unlike fiat currencies, many cryptocurrencies such as BTC and SOL often have a fixed total supply or issuance rate. Since price is related to supply and demand, a fixed or limited supply can also affect the price of an asset by making it more rare.'
    },
    {
      id: 'investing',
      question: 'How do I start investing in cryptocurrency?',
      answer: 'You can start investing in cryptocurrency today on OKX. You can buy major cryptocurrencies including BTC, ETH, USDT and LTC with a credit card, Apple Pay or other convenient payment method. To get started, create an account using the button Sign up. Once you have verified your email, you can head to the Buy/Sell section to buy a range of top cryptocurrencies with popular payment methods. If you want to invest in a cryptocurrency from the list on this page but dont see it in the Buy/Sell section, that means you wll need to use a top cryptocurrency like BTC or USDT to buy the asset. Select Trade button near any asset on this page to buy it for crypto.'
    },
    {
      id: 'yield',
      question: 'Can I earn a yield on my cryptocurrency investment?',
      answer: 'Many cryptocurrencies generate a yield for holders who participate in various network activities, such as staking. However, staking, as well as providing liquidity on DeFi protocols, can be confusing and expensive. At OKX, they bring you easy, flexible, less expensive access to a variety of yield-generating opportunities for many top cryptocurrencies. Head over to the Earn section to discover how you can earn passive income on your cryptocurrency.'
    },
    {
      id: 'security',
      question: 'How secure are your assets on OKX?',
      answer: 'The security of user assets is their top priority. They operate a dual-layer storage system that keeps most funds completely offline in cold storage. They also employ the most advanced encryption techniques available to further secure both the cold and hot wallets, ensuring the safety of your assets. Apart from their internal systems, OKX also provides users with various features and tools that can be used to protect their accounts and funds, such as 2FA via SMS or authenticator apps.'
    }
  ];

  const toggleFaq = (id) => {
    if (openFaqs.includes(id)) {
      setOpenFaqs(openFaqs.filter(faqId => faqId !== id));
    } else {
      setOpenFaqs([...openFaqs, id]);
    }
  };

  return (
    <div className="mt-12 mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map(faq => (
          <div 
            key={faq.id} 
            className={`bg-gray-800 rounded-lg overflow-hidden border border-gray-700`}
          >
            <div 
              className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-750 transition-colors"
              onClick={() => toggleFaq(faq.id)}
            >
              <h3 className="font-medium text-white">{faq.question}</h3>
              <div className="text-2xl text-gray-400 flex items-center justify-center w-6 h-6">
                {openFaqs.includes(faq.id) ? '−' : '+'}
              </div>
            </div>
            {openFaqs.includes(faq.id) && (
              <div className="p-4 pt-0 text-gray-400 border-t border-gray-700">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqSection;