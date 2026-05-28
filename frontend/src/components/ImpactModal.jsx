import React, { useEffect } from 'react';

function ImpactModal({ report, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!report) return null;

  const fmt = (n, opts = {}) => Number(n || 0).toLocaleString(undefined, opts);
  const usd = (n) => `$${fmt(n, { maximumFractionDigits: 0 })}`;
  const t = (n) => `${fmt(n, { maximumFractionDigits: 1 })} t`;

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label="Impact report">
        <header className="drawer-header">
          <div>
            <p className="eyebrow">Impact report</p>
            <h2>{report.producer_name} → {report.consumer_name}</h2>
          </div>
          <button className="btn btn-quiet" onClick={onClose} aria-label="Close">Close</button>
        </header>

        <div className="drawer-body">
          <p className="eyebrow mb-4">Annual</p>
          <div className="stat-grid mb-8">
            <div className="stat-cell">
              <span className="label">Tonnage</span>
              <span className="value num">{fmt(report.annual_tonnage)}<span className="text-quiet" style={{ fontSize: '0.6em', marginLeft: 4 }}>t</span></span>
            </div>
            <div className="stat-cell">
              <span className="label">Producer revenue</span>
              <span className="value num">{usd(report.financials.producer_annual_revenue)}</span>
            </div>
            <div className="stat-cell">
              <span className="label">Consumer savings</span>
              <span className="value num">{usd(report.financials.consumer_annual_savings)}</span>
            </div>
          </div>

          <p className="eyebrow mb-4">Environmental</p>
          <dl className="kv mb-8">
            <dt>CO₂ diverted</dt>
            <dd>{t(report.environmental.co2_diverted)}</dd>
            <dt>Logistics emissions</dt>
            <dd>{t(report.environmental.estimated_logistics_emissions)}</dd>
            <dt>Net CO₂ impact</dt>
            <dd style={{ color: 'var(--positive)' }}>{t(report.environmental.net_co2_impact)}</dd>
          </dl>

          <p className="eyebrow mb-4">Financial</p>
          <dl className="kv mb-8">
            <dt>Carbon credit value</dt>
            <dd>{usd(report.financials.carbon_credit_value)}</dd>
            <dt>Producer revenue</dt>
            <dd>{usd(report.financials.producer_annual_revenue)}</dd>
            <dt>Consumer savings</dt>
            <dd>{usd(report.financials.consumer_annual_savings)}</dd>
          </dl>

        </div>
      </aside>
    </>
  );
}

export default ImpactModal;
