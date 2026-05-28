import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import LoginModal from './LoginModal';
import ThemeToggle from './ThemeToggle';
import { authAPI } from '../utils/auth';

function MainLayout() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authAPI.isAuthenticated()) setUser(authAPI.getUser());
  }, []);

  const handleLogin = async (email, password) => {
    const res = await authAPI.login(email, password);
    setUser(res.user);
    setShowLogin(false);
  };

  const handleRegister = async (email, password, name) => {
    const res = await authAPI.register(email, password, name);
    setUser(res.user);
    setShowLogin(false);
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    navigate('/');
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Logo />
          <nav className="nav">
            <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
              Dashboard
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
              Analytics
            </NavLink>
            <NavLink to="/register-producer" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
              List supply
            </NavLink>
            <NavLink to="/register-consumer" className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}>
              List demand
            </NavLink>
          </nav>
          <div className="row">
            <ThemeToggle />
            {user ? (
              <>
                <span className="text-sm text-muted">{user.name}</span>
                <button onClick={handleLogout} className="btn btn-quiet">Sign out</button>
              </>
            ) : (
              <button onClick={() => setShowLogin(true)} className="btn btn-ghost btn-sm">Sign in</button>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

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

export default MainLayout;
