import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addConsumer, geocodeAddress } from '../api';

const INDUSTRIES = [
  'Beverage Carbonation',
  'Concrete Curing',
  'Vertical Farming',
  'Biofuel Synthesis',
  'Chemical Synthesis',
  'Food Processing',
  'Manufacturing',
  'Other',
];

function RegisterConsumerPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', industry: INDUSTRIES[0], address: '', demand: '' });

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const loc = await geocodeAddress(form.address);
      await addConsumer({
        name: form.name,
        industry: form.industry,
        location: { lat: loc.lat, lon: loc.lon },
        co2_demand_tonnes_per_week: parseInt(form.demand, 10),
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="form-page">
      <p className="eyebrow">Consumer onboarding</p>
      <h1>List your CO₂ demand.</h1>
      <p>Tell us your industry, location, and weekly need. We'll match you with producers that meet your purity bar.</p>

      <form onSubmit={submit} className="form-stack">
        <div className="field">
          <label htmlFor="name">Company name</label>
          <input id="name" className="input" type="text" value={form.name} onChange={update('name')} required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="industry">Industry</label>
          <select id="industry" className="select" value={form.industry} onChange={update('industry')}>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="address">Address</label>
          <input id="address" className="input" type="text" placeholder="111 8th Ave, New York, NY" value={form.address} onChange={update('address')} required />
        </div>
        <div className="field">
          <label htmlFor="demand">Weekly CO₂ demand (tonnes)</label>
          <input id="demand" className="input" type="number" min="1" value={form.demand} onChange={update('demand')} required />
        </div>

        {error && <p className="text-sm" style={{ color: 'var(--negative)' }}>{error}</p>}

        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? <span className="loading" /> : 'List my demand'}
          </button>
          <button type="button" className="btn btn-quiet" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default RegisterConsumerPage;
