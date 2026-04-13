import React from 'react';
import { Link } from 'react-router-dom';
import { newsArticles } from '../../config/homepageImages';

const NewsCard = ({ title, date, category, link, image, description }) => (
  <Link
    to={link || "#"}
    className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl overflow-hidden hover:border-[#2EBD85]/30 transition-all group"
  >
    <div className="aspect-video overflow-hidden bg-[#2A2A2A]">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        onError={(e) => {
          e.target.onerror = null;
          e.target.style.display = 'none';
        }}
      />
    </div>
    <div className="p-4">
      <div className="flex items-center gap-2 text-xs mb-2.5">
        <span className="text-[#2EBD85] font-medium">{category}</span>
        <span className="text-[#2A2A2A]">•</span>
        <span className="text-[#5E6673]">{date}</span>
      </div>
      <h3 className="text-white font-semibold text-sm mb-1.5 leading-snug group-hover:text-[#2EBD85] transition-colors">
        {title}
      </h3>
      <p className="text-[#848E9C] text-xs leading-relaxed line-clamp-2">{description}</p>
    </div>
  </Link>
);

const News = () => {
  if (!newsArticles?.length) return null;

  return (
    <div className="bg-[#0a0a0a] py-8 md:py-12">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-white mb-1">Latest News</h2>
            <p className="text-[#848E9C] text-sm">Stay informed with the latest from GLD</p>
          </div>
          <Link to="/help/category/announcements" className="text-[#2EBD85] text-sm font-medium hover:underline hidden md:inline-flex items-center gap-1">
            View all
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {newsArticles.map((article, index) => (
            <NewsCard key={index} {...article} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;
