import React from 'react';

interface ArticleCardProps {
  title: string;
  link: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ title, link }) => {
  return (
    <div className="border p-4 rounded shadow-md hover:shadow-lg transition">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline"
      >
        Read more
      </a>
    </div>
  );
};

export default ArticleCard;
