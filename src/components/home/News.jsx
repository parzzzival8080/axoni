import React from 'react';
import { Link } from 'react-router-dom';
import news1 from '../../assets/homepage/news1.png';
import news2 from '../../assets/homepage/news2.png';
import news3 from '../../assets/homepage/news3.png';

const NewsCard = ({ title, date, category, link, image }) => (
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
      <h3 className="text-white font-semibold text-sm mb-3 leading-relaxed">{title}</h3>
      <button className="text-orange-500 text-xs font-medium hover:text-orange-400 transition-colors">
        Read article
      </button>
    </div>
  </Link>
);

const News = () => {
  const newsArticles = [
    {
      title: 'Mastering Risk Management',
      date: '09 Aug 2024',
      category: 'Global',
      link: '/blog/risk-management',
      image: news1
    },
    {
      title: 'Mastering Risk Management',
      date: '09 Aug 2024',
      category: 'Global',
      link: '/blog/risk-management-2',
      image: news2
    },
    {
      title: 'Mastering Risk Management',
      date: '09 Aug 2024',
      category: 'Global',
      link: '/blog/risk-management-3',
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