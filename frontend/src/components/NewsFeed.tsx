import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper, ExternalLink } from 'lucide-react';

interface NewsItem {
  title: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  source: string;
  time: string;
}

interface NewsFeedProps {
  news: NewsItem[];
}

const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  const getSentimentStyles = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive': return 'bg-accent-green/10 text-accent-green';
      case 'Negative': return 'bg-accent-red/10 text-accent-red';
      default: return 'bg-white/5 text-gray-400';
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {news.map((newsItem, index) => (
        <motion.div 
          key={index} 
          variants={item}
          className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${getSentimentStyles(newsItem.sentiment)}`}>
              {newsItem.sentiment}
            </span>
            <span className="text-[10px] text-gray-500">{newsItem.time}</span>
          </div>
          <h4 className="text-sm font-semibold text-gray-200 mb-3 group-hover:text-white transition-colors line-clamp-2">
            {newsItem.title}
          </h4>
          <div className="flex items-center justify-between text-[10px] text-gray-500 uppercase font-bold tracking-widest">
            <span>{newsItem.source}</span>
            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default NewsFeed;
