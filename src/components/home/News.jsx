import React from 'react';
import { Link } from 'react-router-dom';

const NewsCard = ({ title, excerpt, date, link }) => (
  <Link to={link} className="bg-gray-900 rounded-xl overflow-hidden hover:bg-gray-800 transition-colors">
    <div className="h-48 bg-gray-800 animate-pulse"></div>
    <div className="p-6">
      <p className="text-gray-400 text-sm mb-2">{date}</p>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{excerpt}</p>
    </div>
  </Link>
);

const News = () => {
  const newsArticles = [
    {
      title: 'Understanding DeFi and Its Impact on Traditional Finance',
      excerpt: 'Explore how decentralized finance is reshaping the financial landscape and what it means for traditional banking.',
      date: 'May 24, 2025',
      link: '/blog/defi-impact'
    },
    {
      title: 'The Rise of NFTs in Digital Art and Gaming',
      excerpt: 'Discover how non-fungible tokens are revolutionizing digital ownership and creating new opportunities.',
      date: 'May 23, 2025',
      link: '/blog/nft-rise'
    },
    {
      title: 'Crypto Market Analysis: Trends and Predictions',
      excerpt: 'Expert insights into current market trends and what to expect in the coming months.',
      date: 'May 22, 2025',
      link: '/blog/market-analysis'
    }
  ];

  return (
    <div className="bg-black py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white">Flex News</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {newsArticles.map((article, index) => (
            <NewsCard key={index} {...article} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;
