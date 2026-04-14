import React from 'react';
import { Link } from 'react-router-dom';
import { newsArticles } from '../../config/homepageImages';

const NewsCard = ({ title, date, category, link, image, description }) => (
  <Link to={link || "#"} className="group block">
    <div className="aspect-video overflow-hidden rounded-2xl mb-4 bg-[#1E1E1E]">
      {image ? (
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[#5E6673] text-sm">{category}</span>
        </div>
      )}
    </div>
    <div className="flex items-center gap-2 text-xs mb-2">
      <span className="text-[#2EBD85] font-medium">{category}</span>
      <span className="text-[#2A2A2A]">·</span>
      <span className="text-[#5E6673]">{date}</span>
    </div>
    <h3 className="text-white font-semibold text-base mb-2 leading-snug group-hover:text-[#2EBD85] transition-colors">
      {title}
    </h3>
    <p className="text-[#848E9C] text-sm leading-relaxed line-clamp-2">{description}</p>
  </Link>
);

const News = () => {
  if (!newsArticles?.length) return null;

  return (
    <div className="bg-[#0a0a0a] py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24">
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">Latest News</h2>
          <Link to="/help/category/announcements" className="text-[#2EBD85] text-sm font-medium hover:underline hidden md:inline-flex items-center gap-1">
            View all
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newsArticles.map((article, idx) => (
            <NewsCard key={idx} {...article} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default News;
