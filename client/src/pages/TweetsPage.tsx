import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { fetchTrumpAndBidenTweets } from '../services/api'; // Add API call for tweets

interface Tweet {
  id: string;
  content: string;
  user: string;
}

const TweetsPage: React.FC = () => {
  const [trumpTweets, setTrumpTweets] = useState<Tweet[]>([]);
  const [bidenTweets, setBidenTweets] = useState<Tweet[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'both' | 'trump' | 'biden'>('both');

  useEffect(() => {
    fetchTrumpAndBidenTweets()
      .then(({ trump, biden }) => {
        setTrumpTweets(trump);
        setBidenTweets(biden);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="p-6 bg-gradient-to-r from-green-50 to-green-100">
      {/* Header with Title and Back Link */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Scraped Tweets</h1>
        <Link
          to="/"
          className="px-4 py-2 bg-black text-white rounded hover:bg-red-600"
        >
          Go to Home Page
        </Link>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Toggle Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${view === 'both' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setView('both')}
        >
          View Both
        </button>
        <button
          className={`px-4 py-2 rounded ${view === 'trump' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setView('trump')}
        >
          View Trump Tweets
        </button>
        <button
          className={`px-4 py-2 rounded ${view === 'biden' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}
          onClick={() => setView('biden')}
        >
          View Biden Tweets
        </button>
      </div>

      {/* Display Tweets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(view === 'both' || view === 'trump') && (
          <div>
            <h2 className="text-xl font-bold mb-4">Trump Tweets</h2>
            <ul>
              {trumpTweets.map((tweet) => (
                <li key={tweet.id} className="bg-white p-4 shadow-md rounded mb-2">
                  <p>{tweet.content}</p>
                  <span className="text-gray-500 text-sm">- {tweet.user}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(view === 'both' || view === 'biden') && (
          <div>
            <h2 className="text-xl font-bold mb-4">Biden Tweets</h2>
            <ul>
              {bidenTweets.map((tweet) => (
                <li key={tweet.id} className="bg-white p-4 shadow-md rounded mb-2">
                  <p>{tweet.content}</p>
                  <span className="text-gray-500 text-sm">- {tweet.user}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TweetsPage;
