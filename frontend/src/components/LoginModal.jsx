import React, { useState, useEffect } from 'react';

function LoginModal({ onClose, onLogin, onRegister }) {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      if (mode === 'signin') await onLogin(form.email, form.password);
      else await onRegister(form.email, form.password, form.name);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  const update = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setError(''); };

  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <p className="eyebrow mb-2">{mode === 'signin' ? 'Sign in' : 'Create account'}</p>
        <h2>{mode === 'signin' ? 'Welcome back' : 'Get started'}</h2>
        <p>{mode === 'signin' ? 'Sign in to continue to your dashboard.' : 'Create an account to save matches and track impact.'}</p>

        <form onSubmit={submit} className="form-stack">
          {mode === 'signup' && (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" className="input" type="text" value={form.name} onChange={update('name')} required autoFocus />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" value={form.email} onChange={update('email')} required autoFocus={mode === 'signin'} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" className="input" type="password" value={form.password} onChange={update('password')} required minLength={6} />
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--negative)' }}>{error}</p>}

          <div className="actions">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {busy ? <span className="loading" /> : (mode === 'signin' ? 'Sign in' : 'Create account')}
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}>
              {mode === 'signin' ? 'Need an account?' : 'Have an account?'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
