import React from 'react';

function MatchesPanel({ producer, report, isLoading, onSelectMatch, onGenerateReport, onAddToWatchlist }) {
  if (!producer) {
    return (
      <section className="matches">
        <div className="matches-header">
          <p className="eyebrow">Matches</p>
          <h2>Pick a producer to start</h2>
          <p className="text-muted">Select a supplier on the left. CarbonFlow will score every consumer within range on capacity fit, purity, distance, and transport compatibility — then rank them.</p>
        </div>
      </section>
    );
  }

  if (isLoading || !report) {
    return (
      <section className="matches">
        <div className="matches-header">
          <p className="eyebrow">Analyzing</p>
          <h2>{producer.name}</h2>
          <p className="text-muted"><span className="loading">Scoring matches…</span></p>
        </div>
      </section>
    );
  }

  const matches = report.ranked_matches || [];

  return (
    <section className="matches">
      <div className="matches-header">
        <p className="eyebrow">{matches.length} match{matches.length === 1 ? '' : 'es'} for</p>
        <h2>{producer.name}</h2>
        {report.overall_summary && (
          <p className="text-muted">{report.overall_summary}</p>
        )}
      </div>

      <div className="matches-list">
        {matches.length === 0 && (
          <div className="panel-empty">No viable matches in range.</div>
        )}

        {matches.map((m) => {
          const score = typeof m.match_score === 'number' ? m.match_score : null;
          return (
            <article key={m.id} className="match">
              <header className="match-top">
                <div className="match-name">
                  <span className={`rank ${m.analysis?.rank === 1 ? 'rank-1' : ''}`}>
                    {m.analysis?.rank ?? '–'}
                  </span>
                  <span>{m.name}</span>
                </div>
                {score !== null && (
                  <span className="match-score">{(score * 100).toFixed(0)}<span className="text-quiet">%</span></span>
                )}
              </header>

              <div className="match-meta">
                <span className="tag">{m.industry}</span>
                <span className="tag mono">{m.distance_km} km</span>
                <span className="tag mono">{m.co2_demand_tonnes_per_week} t/wk</span>
              </div>

              <div className="match-bars">
                {typeof m.vector_similarity === 'number' && (
                  <Bar label="Business fit" value={m.vector_similarity} />
                )}
                {typeof m.capacity_fit === 'number' && (
                  <Bar label="Capacity fit" value={m.capacity_fit} />
                )}
                {typeof m.distance_score === 'number' && (
                  <Bar label="Proximity" value={m.distance_score} />
                )}
                {typeof m.quality_match === 'number' && (
                  <Bar label="Purity" value={m.quality_match} />
                )}
              </div>

              {m.analysis?.justification && (
                <p className="match-just">{m.analysis.justification}</p>
              )}

              <div className="match-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => onSelectMatch(m)}>Show on map</button>
                <button className="btn btn-primary btn-sm" onClick={() => onGenerateReport(m)}>Impact report</button>
                <button className="btn btn-quiet btn-sm" onClick={() => onAddToWatchlist(m)}>Save</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Bar({ label, value }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="match-bar">
      <span className="lbl">{label}</span>
      <span className="track"><span className="fill" style={{ width: `${pct}%` }} /></span>
      <span className="pct">{pct.toFixed(0)}%</span>
    </div>
  );
}

export default MatchesPanel;
