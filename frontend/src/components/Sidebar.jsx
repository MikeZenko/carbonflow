// frontend/src/components/Sidebar.jsx

import React from 'react';

function Sidebar({ producer, report, onSelectMatch, onGenerateReport, onAddToWatchlist }) {
  if (!producer) {
    return (
      <div className="sidebar-container">
        <div className="sidebar-header"><h2>Opportunity Report</h2></div>
        <div className="sidebar-content"><p>Select a producer to generate a ranked analysis of potential partners.</p></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="sidebar-container">
        <div className="sidebar-header"><h2>Opportunity Report for {producer.name}</h2></div>
        <div className="sidebar-content"><p>Analysis in progress...</p></div>
      </div>
    );
  }

  return (
    <div className="sidebar-container">
      <div className="sidebar-header">
        <h2>Opportunity Report for {producer.name}</h2>
      </div>
      <div className="sidebar-content">
        <div className="executive-summary">
          <h3>Executive Summary</h3>
          <p>{report.overall_summary}</p>
        </div>
        <h3>Ranked Opportunities</h3>
        {report.ranked_matches.map((match) => (
          <div key={match.id} className="match-card">
            <h3>
              <span className="rank-badge">{match.analysis.rank}</span> {match.name}
            </h3>
            <p><strong>Distance:</strong> {match.distance_km} km</p>
            
            {/* THIS IS THE SECTION THAT HAS BEEN RESTORED */}
            <div className="analysis-section">
              <h4>Justification</h4>
              <p>{match.analysis.justification}</p>
              <h4>Strategic Considerations</h4>
              <ul>
                {match.analysis.strategic_considerations.map((item, index) => <li key={index}>{item}</li>)}
              </ul>
            </div>
            
            <div className="card-buttons">
              <button onClick={() => onSelectMatch(match)}>Focus on Map</button>
              <button className="report-btn" onClick={() => onGenerateReport(match)}>Impact Report</button>
            </div>
            <button className="watchlist-btn" onClick={() => onAddToWatchlist(match)}>
              + Save to Watchlist
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;