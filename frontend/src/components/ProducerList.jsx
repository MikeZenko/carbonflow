import React, { useState, useEffect, useMemo } from 'react';
import { getProducers } from '../api';

function ProducerList({ selectedId, onSelect }) {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getProducers();
        if (!cancelled) setProducers(data);
      } catch (e) {
        if (!cancelled) setErr(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return producers;
    return producers.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.industry_type || p.industry || '').toLowerCase().includes(q)
    );
  }, [producers, query]);

  return (
    <aside className="panel">
      <div className="panel-header">
        <p className="eyebrow">Producers</p>
        <h2>Select a supplier</h2>
        <p className="sub mt-2">{loading ? 'Loading…' : `${filtered.length} of ${producers.length}`}</p>
        <div className="panel-search">
          <input
            type="search"
            placeholder="Search by name or industry"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="panel-body">
        {err && <div className="panel-empty">Failed to load producers. {err}</div>}

        {loading && (
          <div style={{ padding: 'var(--s-4)' }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ marginBottom: 12, height: 32 }} />
            ))}
          </div>
        )}

        {!loading && !err && filtered.length === 0 && (
          <div className="panel-empty">No producers match that search.</div>
        )}

        {!loading && !err && filtered.map(p => {
          const supply = p.co2_supply_tonnes_per_week ?? 0;
          const industry = p.industry_type || p.industry || 'Industrial';
          const isActive = selectedId === p.id;
          return (
            <button
              key={p.id}
              className={`producer-row ${isActive ? 'is-active' : ''}`}
              onClick={() => onSelect(p)}
            >
              <div className="row-top">
                <span className="row-name">{p.name}</span>
                <span className="row-supply">{supply.toLocaleString()} t/wk</span>
              </div>
              <div className="row-meta">
                <span>{industry}</span>
                {p.co2_purity && <span>· {p.co2_purity}% purity</span>}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export default ProducerList;
