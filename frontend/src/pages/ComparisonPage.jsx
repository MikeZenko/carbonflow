// frontend/src/pages/ComparisonPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function ComparisonPage() {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const savedWatchlist = localStorage.getItem('carbonWatchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  const handleRemove = (matchId) => {
    const updatedWatchlist = watchlist.filter(item => item.id !== matchId);
    setWatchlist(updatedWatchlist);
    localStorage.setItem('carbonWatchlist', JSON.stringify(updatedWatchlist));
    window.dispatchEvent(new Event('watchlistUpdated'));
  };

  if (watchlist.length === 0) {
    return (
      <main className="registration-page">
        <div className="form-container">
          <div className="form-section">
            <h2>My Watchlist is Empty</h2>
            <p className="form-instruction">
              Go to the <Link to="/dashboard">Dashboard</Link> to find and save opportunities.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="comparison-page">
      <h1>Comparison Watchlist</h1>
      <p>Here are your saved opportunities. Compare them side-by-side to find the best fit.</p>
      <div className="comparison-table-container">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Consumer Name</th>
              <th>Industry</th>
              <th>Demand (Tonnes/Week)</th>
              <th>Distance (km)</th>
              <th>AI Synopsis</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {watchlist.map(item => (
              <tr key={item.id}>
                <td><span className="rank-badge">{item.analysis.rank}</span></td>
                <td>{item.name}</td>
                <td>{item.industry}</td>
                <td>{item.co2_demand_tonnes_per_week}</td>
                <td>{item.distance_km}</td>
                <td><em>{item.analysis.synopsis}</em></td>
                {/* THIS BUTTON NOW CORRECTLY CALLS handleRemove */}
                <td><button className="remove-btn" onClick={() => handleRemove(item.id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default ComparisonPage;