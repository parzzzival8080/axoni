import React from 'react';
import { Link } from 'react-router-dom';
import news1 from '../../assets/homepage/news1.png';
import news2 from '../../assets/homepage/news2.png';
import news3 from '../../assets/homepage/news3.png';

const NewsCard = ({ title, date, category, link, image, description }) => (
  <Link to={link} className="bg-gray-900/50 rounded-lg overflow-hidden hover:bg-gray-900/70 transition-colors group">
    <div className="aspect-video overflow-hidden">
      <img 
        src={image} 
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div className="p-4">
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
        <span>{date}</span>
        <span>•</span>
        <span>{category}</span>
      </div>
      <h3 className="text-white font-semibold text-sm mb-1 leading-relaxed">{title}</h3>
      <p className="text-gray-400 text-xs mb-1">{description}</p>
    </div>
  </Link>
);

const News = () => {
  const newsArticles = [
    {
      title: 'Bitcoin ETF: The Next Big Wave?',
      description: 'Analysts discuss the potential impact of Bitcoin ETFs on the global crypto market and what investors should expect in 2025.',
      date: '29 May 2025',
      category: 'Markets',
      image: news1
    },
    {
      title: 'DeFi Security: Staying Safe in 2025',
      description: 'Explore the latest DeFi security trends and learn practical tips to keep your assets secure in the evolving landscape.',
      date: '27 May 2025',
      category: 'DeFi',
      image: news2
    },
    {
      title: 'FLUX Launches New Trading Tools',
      description: 'FLUX introduces advanced analytics and automation features to help traders maximize performance and efficiency.',
      date: '25 May 2025',
      category: 'Platform',
      image: news3
    }
  ];

  return (
    <div className="bg-black py-16">
      <div className="container mx-auto px-8 md:px-16 lg:px-24">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white">Flux News</h2>
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