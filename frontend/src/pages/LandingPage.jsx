import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import LoginModal from '../components/LoginModal';
import Globe from '../components/Globe';
import { authAPI } from '../utils/auth';
import { getProducers, getConsumers } from '../api';

function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (authAPI.isAuthenticated()) setUser(authAPI.getUser());

    // Pull real producer + consumer coordinates and plot them on the globe.
    // Fails quietly to a markerless globe if the backend is cold.
    let cancelled = false;
    Promise.all([
      getProducers().catch(() => []),
      getConsumers().catch(() => []),
    ]).then(([producers, consumers]) => {
      if (cancelled) return;
      const points = [...producers, ...consumers]
        .filter((p) => p?.location?.lat != null && p?.location?.lon != null)
        .map((p) => ({ location: [p.location.lat, p.location.lon], size: 0.05 }));
      setLocations(points);
    });
    return () => { cancelled = true; };
  }, []);

  // Stable identity so Globe doesn't tear down on parent re-renders
  const markers = useMemo(() => locations, [locations]);

  const handleLogin = async (email, password) => {
    const res = await authAPI.login(email, password);
    setUser(res.user);
    setShowLogin(false);
    navigate('/dashboard');
  };

  const handleRegister = async (email, password, name) => {
    const res = await authAPI.register(email, password, name);
    setUser(res.user);
    setShowLogin(false);
    navigate('/dashboard');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Logo />
          <nav className="nav">
            <a href="#how" className="nav-link">How it works</a>
            <a href="#roles" className="nav-link">For producers</a>
            <a href="#roles" className="nav-link">For consumers</a>
          </nav>
          <div className="row">
            {user ? (
              <Link to="/dashboard" className="btn btn-ghost btn-sm">Open dashboard</Link>
            ) : (
              <>
                <button onClick={() => setShowLogin(true)} className="btn btn-quiet">Sign in</button>
                <Link to="/dashboard" className="btn btn-primary btn-sm">Try the dashboard</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <p className="eyebrow mb-6">An exchange for industrial CO₂</p>
              <h1 className="hero-headline">
                Treat captured carbon like&nbsp;<em>inventory</em>.
              </h1>
              <p className="hero-lede">
                CarbonFlow is a directory and scoring engine for industrial CO₂. Producers post weekly supply.
                Consumers post weekly demand. The matcher ranks every viable pair by capacity, purity, and
                proximity — with the weights visible, not hidden behind an LLM.
              </p>
              <div className="hero-actions">
                <Link to="/dashboard" className="btn btn-accent btn-lg">Open the dashboard</Link>
                <Link to="/register-producer" className="btn btn-ghost btn-lg">List your supply</Link>
              </div>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <Globe markers={markers} />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="metric-row">
            <div className="metric">
              <span className="metric-value num">32</span>
              <span className="metric-label">Dimensions in the producer vector</span>
            </div>
            <div className="metric">
              <span className="metric-value num">5</span>
              <span className="metric-label">Axes scored per candidate match</span>
            </div>
            <div className="metric">
              <span className="metric-value num">&lt;1s</span>
              <span className="metric-label">Time to rank a producer's full match set</span>
            </div>
            <div className="metric">
              <span className="metric-value num">0</span>
              <span className="metric-label">Black boxes between input and rank</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="container">
          <p className="eyebrow mb-4">Mechanics</p>
          <h2 className="mb-8" style={{ maxWidth: '24ch', fontSize: 'var(--text-3xl)' }}>
            List, match, rank. Three steps from capture to contract.
          </h2>

          <div className="numbered-list">
            <div className="numbered-item">
              <span className="num-marker">T·01</span>
              <div>
                <h3>List supply, or list demand</h3>
                <p>Producers post weekly CO₂ supply, purity, and address. Consumers post weekly demand, industry, and address. Both get geocoded into the index automatically.</p>
              </div>
            </div>
            <div className="numbered-item">
              <span className="num-marker">T·02</span>
              <div>
                <h3>Every viable pair is scored on five axes</h3>
                <p>Vector similarity, capacity fit, distance, purity alignment, and transport compatibility. Pairs that fail capacity or purity thresholds get rejected before scoring — no padding the leaderboard with unworkable matches.</p>
              </div>
            </div>
            <div className="numbered-item">
              <span className="num-marker">T·03</span>
              <div>
                <h3>You get a ranked ledger with its math attached</h3>
                <p>Each match shows its component scores and weights. No "AI magic." If you don't like how a pair ranks, you can see exactly which axis disagrees with you.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="roles" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <p className="eyebrow mb-4">Onboarding</p>
          <h2 className="mb-8" style={{ fontSize: 'var(--text-3xl)' }}>Pick your side of the trade.</h2>

          <div className="role-grid">
            <Link to="/register-producer" className="role-card">
              <p className="eyebrow">Producer</p>
              <h3>I have CO₂ to sell.</h3>
              <p>Cement, ethanol, petrochem, power. List weekly tonnage and purity. Get a ranked ledger of consumers within range.</p>
              <span className="arrow">List supply →</span>
            </Link>
            <Link to="/register-consumer" className="role-card">
              <p className="eyebrow">Consumer</p>
              <h3>I need CO₂ to buy.</h3>
              <p>Beverage carbonation, concrete curing, vertical farming, biofuel synthesis. List weekly demand. Get matched only to producers that meet your purity bar.</p>
              <span className="arrow">List demand →</span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div>
              <Logo />
              <p className="footer-meta mt-2">An exchange for captured carbon.</p>
            </div>
            <div className="footer-links">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/analytics">Analytics</Link>
              <a href="https://github.com/gokulgop2/CarbonFlow" target="_blank" rel="noreferrer">Source</a>
            </div>
          </div>
          <p className="footer-meta mt-8">© {new Date().getFullYear()} CarbonFlow</p>
        </div>
      </footer>

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}
    </div>
  );
}

export default LandingPage;
