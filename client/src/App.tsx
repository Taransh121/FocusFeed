import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NewsPage from './pages/NewsPage';
import TweetsPage from './pages/TweetsPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TweetsPage />} />
        <Route path="/news" element={<NewsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
