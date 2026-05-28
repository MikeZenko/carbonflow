import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProducer, geocodeAddress } from '../api';

function RegisterProducerPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: '', address: '', supply: '' });

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const loc = await geocodeAddress(form.address);
      await addProducer({
        name: form.name,
        location: { lat: loc.lat, lon: loc.lon },
        co2_supply_tonnes_per_week: parseInt(form.supply, 10),
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
      <p className="eyebrow">Producer onboarding</p>
      <h1>List your CO₂ supply.</h1>
      <p>Tell us where you are and how much you produce weekly. We'll geocode the address and start scoring matches.</p>

      <form onSubmit={submit} className="form-stack">
        <div className="field">
          <label htmlFor="name">Company name</label>
          <input id="name" className="input" type="text" value={form.name} onChange={update('name')} required autoFocus />
        </div>
        <div className="field">
          <label htmlFor="address">Address</label>
          <input id="address" className="input" type="text" placeholder="1600 Amphitheatre Parkway, Mountain View, CA" value={form.address} onChange={update('address')} required />
        </div>
        <div className="field">
          <label htmlFor="supply">Weekly CO₂ supply (tonnes)</label>
          <input id="supply" className="input" type="number" min="1" value={form.supply} onChange={update('supply')} required />
        </div>

        {error && <p className="text-sm" style={{ color: 'var(--negative)' }}>{error}</p>}

        <div className="actions">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? <span className="loading" /> : 'List my supply'}
          </button>
          <button type="button" className="btn btn-quiet" onClick={() => navigate(-1)}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default RegisterProducerPage;
