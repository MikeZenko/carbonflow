// frontend/src/components/MainLayout.jsx

import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import LoginModal from './LoginModal';
import { 
  FiLogOut, 
  FiUser, 
  FiSearch, 
  FiBell, 
  FiSettings, 
  FiBarChart, 
  FiMap, 
  FiTrendingUp,
  FiGlobe,
  FiChevronDown,
  FiCommand
} from 'react-icons/fi';
import { 
  FaLeaf, 
  FaRocket, 
  FaChartLine,
  FaCog,
  FaBook
} from 'react-icons/fa';
import { authAPI } from '../utils/auth';

function MainLayout() {
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchCommand, setShowSearchCommand] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated
    if (authAPI.isAuthenticated()) {
      const userData = authAPI.getUser();
      setUser(userData);
    }

    // Update watchlist count
    const updateCount = () => {
      const savedWatchlist = localStorage.getItem('carbonWatchlist');
      if (savedWatchlist) {
        setWatchlistCount(JSON.parse(savedWatchlist).length);
      }
    };
    
    updateCount();
    
    window.addEventListener('storage', updateCount);
    window.addEventListener('watchlistUpdated', updateCount);

    // Mock notifications for demo
    setNotifications([
      {
        id: 1,
        type: 'match',
        title: 'New Match Found',
        message: 'A high-quality match for Industrial Solutions Ltd has been identified',
        time: '2 minutes ago',
        unread: true
      },
      {
        id: 2,
        type: 'system',
        title: 'System Update',
        message: 'Enhanced AI matching algorithm is now live',
        time: '1 hour ago',
        unread: false
      },
      {
        id: 3,
        type: 'report',
        title: 'Weekly Report Ready',
        message: 'Your carbon trading insights for this week are available',
        time: '2 hours ago',
        unread: false
      }
    ]);

    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchCommand(true);
      }
      if (e.key === 'Escape') {
        setShowSearchCommand(false);
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('watchlistUpdated', updateCount);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      setUser(response.user);
      setShowLoginModal(false);
    } catch (error) {
      throw error;
    }
  };

  const handleRegister = async (email, password, name) => {
    try {
      const response = await authAPI.register(email, password, name);
      setUser(response.user);
      setShowLoginModal(false);
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setShowUserMenu(false);
    navigate('/');
  };

  const handleProfileSettings = () => {
    setShowUserMenu(false);
    // Create a modal or navigate to profile settings page
    alert('Profile Settings - Coming Soon!\n\nThis feature will allow you to:\n• Update personal information\n• Change avatar\n• Manage account settings\n• Update contact preferences');
  };

  const handlePreferences = () => {
    setShowUserMenu(false);
    // Create a modal or navigate to preferences page
    alert('Preferences - Coming Soon!\n\nThis feature will allow you to:\n• Set notification preferences\n• Choose theme settings\n• Configure dashboard layout\n• Set language preferences');
  };

  const handleSustainabilityGoals = () => {
    setShowUserMenu(false);
    // Create a modal or navigate to sustainability goals page
    alert('Sustainability Goals - Coming Soon!\n\nThis feature will allow you to:\n• Set carbon reduction targets\n• Track progress towards goals\n• Create sustainability milestones\n• Generate impact reports');
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, unread: false } : notif
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, unread: false }))
    );
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const getNavItemClass = (path) => {
    return `nav-link ${location.pathname === path ? 'active' : ''}`;
  };

  const searchCommands = [
    { icon: <FiBarChart />, label: 'Dashboard', path: '/dashboard', shortcut: 'D' },
    { icon: <FiTrendingUp />, label: 'My Watchlist', path: '/compare', shortcut: 'W' },
    { icon: <FiMap />, label: 'Map View', action: () => {}, shortcut: 'M' },
    { icon: <FaChartLine />, label: 'Analytics', action: () => {}, shortcut: 'A' },
    { icon: <FiSettings />, label: 'Settings', action: () => {}, shortcut: 'S' },
  ];

  const handleSearchCommand = (command) => {
    if (command.path) {
      navigate(command.path);
    } else if (command.action) {
      command.action();
    }
    setShowSearchCommand(false);
  };

  return (
    <div className="modern-app-container">
      {/* Enhanced Header */}
      <header className="modern-app-header">
        <div className="header-left">
          <Link to="/dashboard" className="header-logo">
            <Logo />
          </Link>
          
          <nav className="main-navigation">
            <Link to="/dashboard" className={getNavItemClass('/dashboard')}>
              <FiBarChart />
              <span>Dashboard</span>
            </Link>
            <Link to="/compare" className={getNavItemClass('/compare')}>
              <FiTrendingUp />
              <span>Watchlist</span>
              {watchlistCount > 0 && (
                <span className="nav-badge">{watchlistCount}</span>
              )}
            </Link>
            <Link to="/analytics" className={getNavItemClass('/analytics')}>
              <FaChartLine />
              <span>Analytics</span>
            </Link>
          </nav>
        </div>

        <div className="header-center">
          <button 
            className="global-search"
            onClick={() => setShowSearchCommand(true)}
          >
            <FiSearch />
            <span>Search or jump to...</span>
            <div className="search-shortcut">
              <FiCommand />
              K
            </div>
          </button>
        </div>

        <div className="header-right">
          {/* Global Actions */}
          <div className="header-actions">
            {/* Notifications */}
            <div className="notification-container">
              <button 
                className="action-btn notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                title={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              >
                <FiBell className="bell-icon" />
                <span className="bell-fallback">🔔</span>
                {unreadCount > 0 && (
                  <span className="notification-badge" title={`${unreadCount} unread notifications`}>
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="dropdown-header">
                    <h3>Notifications</h3>
                    <div className="notification-actions">
                      <span className="notification-count">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                      </span>
                      {unreadCount > 0 && (
                        <button 
                          className="mark-all-read-btn"
                          onClick={markAllNotificationsAsRead}
                          title="Mark all as read"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="notifications-list">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${notification.unread ? 'unread' : ''}`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="notification-icon">
                          {notification.type === 'match' && <FaRocket />}
                          {notification.type === 'system' && <FaCog />}
                          {notification.type === 'report' && <FaBook />}
                        </div>
                        <div className="notification-content">
                          <h4>{notification.title}</h4>
                          <p>{notification.message}</p>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* User Section */}
          {user ? (
            <div className="user-menu-container">
              <button 
                className="user-menu-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="user-avatar">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">Carbon Trader</span>
                </div>
                <FiChevronDown className={`chevron ${showUserMenu ? 'rotated' : ''}`} />
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-avatar large">
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="user-details">
                      <h3>{user.name}</h3>
                      <p>{user.email}</p>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="dropdown-menu">
                    <button className="dropdown-item" onClick={handleProfileSettings}>
                      <FiUser />
                      <span>Profile Settings</span>
                    </button>
                    <button className="dropdown-item" onClick={handlePreferences}>
                      <FiSettings />
                      <span>Preferences</span>
                    </button>
                    <button className="dropdown-item" onClick={handleSustainabilityGoals}>
                      <FaLeaf />
                      <span>Sustainability Goals</span>
                    </button>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item logout">
                    <FiLogOut />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setShowLoginModal(true)} className="login-button">
              <FiUser />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Command Palette */}
      {showSearchCommand && (
        <div className="command-palette-overlay" onClick={() => setShowSearchCommand(false)}>
          <div className="command-palette" onClick={(e) => e.stopPropagation()}>
            <div className="command-search">
              <FiSearch />
              <input
                type="text"
                placeholder="Type a command or search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="command-list">
              <div className="command-group">
                <div className="command-group-title">Navigation</div>
                {searchCommands.map((command, index) => (
                  <button
                    key={index}
                    className="command-item"
                    onClick={() => handleSearchCommand(command)}
                  >
                    <div className="command-left">
                      {command.icon}
                      <span>{command.label}</span>
                    </div>
                    <div className="command-shortcut">{command.shortcut}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="command-footer">
              <span>Use <kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
              <span><kbd>Enter</kbd> to select</span>
              <span><kbd>Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="app-main">
        <Outlet />
      </main>
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </div>
  );
}

export default MainLayout;