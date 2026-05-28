import React, { useEffect, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://carbonflow-production.up.railway.app';

function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch(`${API_BASE}/api/matching-stats`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!cancelled) setStats(data);
      } catch (e) {
        if (!cancelled) setErr(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="container" style={{ padding: 'var(--s-16) var(--s-6)' }}>
      <p className="eyebrow mb-3">System</p>
      <h1 className="mb-2" style={{ fontSize: 'var(--text-3xl)', letterSpacing: '-0.02em' }}>Matching engine</h1>
      <p className="mb-8 text-muted" style={{ maxWidth: '60ch' }}>
        Live state of the vector index and scoring pipeline. These numbers are recomputed on every page load —
        no caching, no stale telemetry.
      </p>

      {loading && <div className="loading">Loading stats…</div>}
      {err && <p style={{ color: 'var(--negative)' }}>Failed to load stats: {err}</p>}

      {stats && (
        <>
          <div className="stat-grid mb-12">
            <div className="stat-cell">
              <span className="label">Producers indexed</span>
              <span className="value num">{stats.total_producers ?? 0}</span>
            </div>
            <div className="stat-cell">
              <span className="label">Consumers indexed</span>
              <span className="value num">{stats.total_consumers ?? 0}</span>
            </div>
            <div className="stat-cell">
              <span className="label">Avg matches / producer</span>
              <span className="value num">{(stats.avg_matches_per_producer ?? 0).toFixed(2)}</span>
            </div>
            <div className="stat-cell">
              <span className="label">Producer vector dims</span>
              <span className="value num">{stats.vector_engine_stats?.vector_dimensions?.producer ?? '–'}</span>
            </div>
          </div>

          <p className="eyebrow mb-4">Scoring weights</p>
          <div className="card mb-12" style={{ padding: 0, overflow: 'hidden' }}>
            <dl className="kv" style={{ padding: 'var(--s-6)', margin: 0 }}>
              {Object.entries(stats.weights || {}).map(([k, v]) => (
                <React.Fragment key={k}>
                  <dt>{prettify(k)}</dt>
                  <dd>{(Number(v) * 100).toFixed(0)}%</dd>
                </React.Fragment>
              ))}
            </dl>
          </div>

          <p className="eyebrow mb-4">Vector index</p>
          <div className="card">
            <dl className="kv" style={{ margin: 0 }}>
              <dt>Producer vectors cached</dt>
              <dd>{stats.vector_engine_stats?.producer_vectors ?? '–'}</dd>
              <dt>Consumer vectors cached</dt>
              <dd>{stats.vector_engine_stats?.consumer_vectors ?? '–'}</dd>
              <dt>Producer vector dimensions</dt>
              <dd>{stats.vector_engine_stats?.vector_dimensions?.producer ?? '–'}</dd>
              <dt>Consumer vector dimensions</dt>
              <dd>{stats.vector_engine_stats?.vector_dimensions?.consumer ?? '–'}</dd>
            </dl>
          </div>
        </>
      )}
    </div>
  );
}

function prettify(s) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default AnalyticsPage;
