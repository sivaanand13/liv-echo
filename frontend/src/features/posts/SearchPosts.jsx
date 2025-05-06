// components/SearchPosts.jsx
import React, { useState } from 'react';
import postUtils  from './postUtils';

export default function SearchPosts() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await postUtils.searchPosts(query);
      setResults(res);
    } catch (err) {
      setError('Search failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Search Posts</h2>
      <input
        type="text"
        placeholder="Enter search text..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: '300px', marginRight: '10px' }}
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ul>
        {results.map((post) => (
          <li key={post.id}>
            <strong>{post.senderName} (@{post.senderUsername}):</strong> {post.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
