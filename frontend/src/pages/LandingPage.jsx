// frontend/src/pages/LandingPage.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import LoginModal from '../components/LoginModal';
import { 
  FaIndustry, 
  FaShippingFast, 
  FaChartLine, 
  FaGlobe, 
  FaShieldAlt, 
  FaRocket,
  FaLeaf,
  FaBolt,
  FaUsers,
  FaStar,
  FaArrowRight,
  FaPlay
} from 'react-icons/fa';
import { FiUser, FiCheck, FiArrowRight } from 'react-icons/fi';
import { authAPI } from '../utils/auth';

function LandingPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [user, setUser] = useState(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    if (authAPI.isAuthenticated()) {
      const userData = authAPI.getUser();
      setUser(userData);
    }

    // Cycle through features
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 3);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      setUser(response.user);
      setShowLoginModal(false);
      navigate('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const handleRegister = async (email, password, name) => {
    try {
      const response = await authAPI.register(email, password, name);
      setUser(response.user);
      setShowLoginModal(false);
      navigate('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const features = [
    {
      icon: <FaChartLine />,
      title: 'AI-Powered Matching',
      description: 'Advanced algorithms find optimal partnerships based on location, capacity, and business requirements.'
    },
    {
      icon: <FaGlobe />,
      title: 'Global Network',
      description: 'Connect with verified CO₂ producers and consumers across multiple industries and regions.'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Secure Transactions',
      description: 'Enterprise-grade security with verified business profiles and transparent transaction records.'
    }
  ];

  const stats = [
    { number: '500+', label: 'Active Partners' },
    { number: '2.5M', label: 'Tonnes CO₂ Traded' },
    { number: '98%', label: 'Match Success Rate' },
    { number: '$150M+', label: 'Value Generated' }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Sustainability Director',
      company: 'GreenTech Industries',
      content: 'CarbonFlow transformed our carbon strategy. We found reliable suppliers and reduced costs by 35% while improving our environmental impact.',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Operations Manager',
      company: 'Industrial Solutions Ltd',
      content: 'The AI matching is incredibly accurate. We connected with partners we never would have found otherwise.',
      rating: 5
    },
    {
      name: 'Elena Rodriguez',
      role: 'Chief Technology Officer',
      company: 'FutureFuel Corp',
      content: 'Finally, a platform that understands the complexity of carbon markets. The analytics are game-changing.',
      rating: 5
    }
  ];

  return (
    <div className="modern-landing">
      {/* Enhanced Header */}
      <header className="modern-header">
        <div className="header-container">
          <Logo />
          <nav className="header-nav">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How it Works</a>
            <a href="#testimonials" className="nav-link">Testimonials</a>
            {!user && (
              <button onClick={() => setShowLoginModal(true)} className="header-login-btn">
                <FiUser />
                Sign In
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <FaLeaf className="badge-icon" />
              <span>The Future of Carbon Markets</span>
            </div>
            <h1 className="hero-title">
              Transform Carbon into
              <span className="hero-highlight"> Competitive Advantage</span>
            </h1>
            <p className="hero-description">
              The world's most advanced B2B marketplace for CO₂ trading. 
              Connect with verified partners, optimize supply chains, and 
              accelerate your sustainability goals with AI-powered insights.
            </p>
            
            {user ? (
              <div className="hero-authenticated">
                <h3>Welcome back, {user.name}! 👋</h3>
                <Link to="/dashboard" className="hero-primary-btn">
                  <FaRocket />
                  Go to Dashboard
                  <FiArrowRight />
                </Link>
              </div>
            ) : (
              <div className="hero-actions">
                <button onClick={() => setShowLoginModal(true)} className="hero-primary-btn">
                  <FaBolt />
                  Get Started Free
                  <FiArrowRight />
                </button>
                <Link to="/dashboard" className="hero-secondary-btn">
                  <FaPlay />
                  Watch Demo
                </Link>
              </div>
            )}

            <div className="hero-stats">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-tabs">
                  <div className="tab active">Dashboard</div>
                  <div className="tab">Analytics</div>
                  <div className="tab">Matches</div>
                </div>
              </div>
              <div className="preview-content">
                <div className="preview-chart">
                  <div className="chart-bars">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="chart-bar" style={{height: `${Math.random() * 60 + 20}%`}}></div>
                    ))}
                  </div>
                </div>
                <div className="preview-metrics">
                  <div className="metric">
                    <div className="metric-icon green">
                      <FaLeaf />
                    </div>
                    <div className="metric-text">
                      <div className="metric-value">2,450</div>
                      <div className="metric-label">Tonnes Saved</div>
                    </div>
                  </div>
                  <div className="metric">
                    <div className="metric-icon blue">
                      <FaChartLine />
                    </div>
                    <div className="metric-text">
                      <div className="metric-value">94%</div>
                      <div className="metric-label">Efficiency</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Built for the Modern Carbon Economy</h2>
            <p>Powerful features designed to accelerate your sustainability and business goals</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className={`feature-card ${activeFeature === index ? 'active' : ''}`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-arrow">
                  <FaArrowRight />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="section-container">
          <div className="section-header">
            <h2>How CarbonFlow Works</h2>
            <p>Simple steps to transform your carbon strategy</p>
          </div>
          
          <div className="steps-container">
            <div className="step">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>Connect & Verify</h3>
                <p>Join our verified network of CO₂ producers and consumers. Complete our streamlined onboarding process.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>AI-Powered Matching</h3>
                <p>Our advanced algorithms analyze your requirements and find optimal partnerships based on location, capacity, and business needs.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>Optimize & Scale</h3>
                <p>Access detailed analytics, track environmental impact, and continuously optimize your carbon supply chain.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      {!user && (
        <section className="role-selection-section">
          <div className="section-container">
            <div className="section-header">
              <h2>Choose Your Role</h2>
              <p>Join the marketplace that fits your business needs</p>
            </div>
            
            <div className="role-cards">
              <Link to="/register-producer" className="role-card">
                <div className="role-icon producer">
                  <FaShippingFast />
                </div>
                <h3>CO₂ Producer</h3>
                <p>I have a supply of CO₂ and want to find commercial partners to create value from waste streams.</p>
                <ul className="role-benefits">
                  <li><FiCheck /> Access verified buyer network</li>
                  <li><FiCheck /> Optimize logistics & pricing</li>
                  <li><FiCheck /> Track environmental impact</li>
                </ul>
                <div className="role-cta">
                  <span>Register as Producer</span>
                  <FaArrowRight />
                </div>
              </Link>
              
              <Link to="/register-consumer" className="role-card">
                <div className="role-icon consumer">
                  <FaIndustry />
                </div>
                <h3>CO₂ Consumer</h3>
                <p>I need a reliable supply of CO₂ for my industrial processes and sustainability initiatives.</p>
                <ul className="role-benefits">
                  <li><FiCheck /> Find verified suppliers</li>
                  <li><FiCheck /> Reduce procurement costs</li>
                  <li><FiCheck /> Improve sustainability metrics</li>
                </ul>
                <div className="role-cta">
                  <span>Register as Consumer</span>
                  <FaArrowRight />
                </div>
              </Link>
            </div>
            
            <div className="guest-access">
              <p>Want to explore first?</p>
              <Link to="/dashboard" className="guest-link">
                <FaPlay />
                Explore the dashboard as a guest
                <FaArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section id="testimonials" className="testimonials-section">
        <div className="section-container">
          <div className="section-header">
            <h2>Trusted by Industry Leaders</h2>
            <p>See how companies are transforming their carbon strategy with CarbonFlow</p>
          </div>
          
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} />
                  ))}
                </div>
                <p className="testimonial-content">"{testimonial.content}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="author-info">
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Ready to Transform Your Carbon Strategy?</h2>
            <p>Join thousands of companies already using CarbonFlow to optimize their carbon supply chains and drive sustainable growth.</p>
            {!user && (
              <button onClick={() => setShowLoginModal(true)} className="cta-button">
                <FaBolt />
                Start Your Journey Today
                <FaArrowRight />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="modern-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-brand">
              <Logo />
              <p>Transforming carbon into competitive advantage through intelligent marketplace technology.</p>
            </div>
            <div className="footer-links">
              <div className="link-group">
                <h4>Platform</h4>
                <a href="#features">Features</a>
                <a href="/dashboard">Dashboard</a>
                <a href="#testimonials">Testimonials</a>
              </div>
              <div className="link-group">
                <h4>Company</h4>
                <a href="/about">About</a>
                <a href="/contact">Contact</a>
                <a href="/careers">Careers</a>
              </div>
              <div className="link-group">
                <h4>Resources</h4>
                <a href="/docs">Documentation</a>
                <a href="/blog">Blog</a>
                <a href="/support">Support</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 CarbonFlow. All rights reserved.</p>
            <div className="footer-legal">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
      
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    </div>
  );
}

export default LandingPage;