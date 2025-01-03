import React from 'react';
import ArticleCard from './ArticleCard';

interface Article {
  title: string;
  link: string;
}

interface ArticleListProps {
  articles: Article[];
}

const ArticleList: React.FC<ArticleListProps> = ({ articles }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article, index) => (
        <ArticleCard key={index} title={article.title} link={article.link} />
      ))}
    </div>
  );
};

export default ArticleList;
