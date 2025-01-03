import React, { useEffect, useState } from 'react';
import ArticleList from '../components/ArticleList';
import { fetchTrumpAndBidenArticles } from '../services/api';

interface Article {
  title: string;
  link: string;
}

const HomePage: React.FC = () => {
  const [trumpArticles, setTrumpArticles] = useState<Article[]>([]);
  const [bidenArticles, setBidenArticles] = useState<Article[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'both' | 'trump' | 'biden'>('both');

  useEffect(() => {
    fetchTrumpAndBidenArticles()
      .then(({ trump, biden }) => {
        setTrumpArticles(trump);
        setBidenArticles(biden);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100">
      <h1 className="text-2xl font-bold mb-6">Scraped CNN Articles</h1>
      {error && <p className="text-red-500">{error}</p>}

      {/* Toggle Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${view === 'both' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setView('both')}
        >
          View Both
        </button>
        <button
          className={`px-4 py-2 rounded ${view === 'trump' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setView('trump')}
        >
          View Trump Articles
        </button>
        <button
          className={`px-4 py-2 rounded ${view === 'biden' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setView('biden')}
        >
          View Biden Articles
        </button>
      </div>

      {/* Display Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(view === 'both' || view === 'trump') && (
          <div>
            <h2 className="text-xl font-bold mb-4">Trump Articles</h2>
            <ArticleList articles={trumpArticles} />
          </div>
        )}

        {(view === 'both' || view === 'biden') && (
          <div>
            <h2 className="text-xl font-bold mb-4">Biden Articles</h2>
            <ArticleList articles={bidenArticles} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
