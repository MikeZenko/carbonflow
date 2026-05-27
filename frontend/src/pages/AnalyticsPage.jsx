import React, { useEffect, useState } from 'react';
import { FiTrendingUp, FiActivity, FiBarChart, FiUsers, FiMap } from 'react-icons/fi';
import { FaLeaf, FaIndustry, FaGlobeAmericas } from 'react-icons/fa';
import { getMatchingStats } from '../api';

function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    localStorage.setItem('carbonflow_analytics_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('carbonflow_analytics_timerange', timeRange);
  }, [timeRange]);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getMatchingStats();
        setStats(data);
      } catch (err) {
        setError(err.message || 'Error fetching analytics data');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [timeRange]);

  const StatCard = ({ icon, title, value, color }) => (
    <div className="analytics-stat-card">
      <div className="stat-icon" style={{ color }}>{icon}</div>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );

  const weightEntries = stats?.weights
    ? Object.entries(stats.weights).map(([key, value]) => ({
        label: key.replace(/_/g, ' '),
        value: Math.round(value * 100),
      }))
    : [];

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div className="page-title">
          <FiActivity className="page-icon" />
          <h1>Analytics Dashboard</h1>
        </div>
        <div className="analytics-controls">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-range-select"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      <div className="analytics-tabs">
        <button
          className={`analytics-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FiBarChart /> Overview
        </button>
        <button
          className={`analytics-tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          <FiUsers /> Matches
        </button>
        <button
          className={`analytics-tab ${activeTab === 'vector' ? 'active' : ''}`}
          onClick={() => setActiveTab('vector')}
        >
          <FiTrendingUp /> Vector Engine
        </button>
        <button
          className={`analytics-tab ${activeTab === 'geography' ? 'active' : ''}`}
          onClick={() => setActiveTab('geography')}
        >
          <FiMap /> Geography
        </button>
      </div>

      <div className="analytics-content">
        {loading && <p>Loading analytics data...</p>}
        {error && <p className="form-error">{error}</p>}

        {!loading && !error && stats && activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <StatCard
                icon={<FiUsers />}
                title="Total Producers"
                value={stats.total_producers}
                color="var(--primary-color)"
              />
              <StatCard
                icon={<FaIndustry />}
                title="Active Consumers"
                value={stats.total_consumers}
                color="#3b82f6"
              />
              <StatCard
                icon={<FaLeaf />}
                title="Avg Matches/Producer"
                value={stats.avg_matches_per_producer}
                color="#10b981"
              />
              <StatCard
                icon={<FiTrendingUp />}
                title="AI Matching Accuracy"
                value="Enhanced"
                color="#059669"
              />
            </div>
            <p className="analytics-note">Enhanced AI matching algorithm is now live</p>
          </div>
        )}

        {!loading && !error && stats && activeTab === 'matches' && (
          <div className="matches-tab">
            <div className="matches-stats">
              <div className="match-success-rate">
                <h3>Matching Algorithm</h3>
                <p>Advanced vector similarity analysis with capacity, distance, and quality scoring.</p>
              </div>
            </div>
            <div className="industry-breakdown">
              <h3>Algorithm Weights</h3>
              <div className="industry-chart">
                {weightEntries.map((item, index) => (
                  <div key={item.label} className="chart-bar-container">
                    <div className="chart-bar-label">{item.label}</div>
                    <div className="chart-bar-track">
                      <div
                        className="chart-bar-fill"
                        style={{
                          width: `${item.value}%`,
                          backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                        }}
                      />
                    </div>
                    <div className="chart-bar-value">{item.value}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!loading && !error && stats && activeTab === 'vector' && (
          <div className="vector-architecture-section">
            <h3>Vector Architecture</h3>
            <p>Real-time vector processing and compatibility scoring across the marketplace.</p>
            <div className="architecture-breakdown">
              <div className="vector-type producer-vectors">
                <h4>Producer Vectors</h4>
                <div className="vector-count">
                  {stats.vector_engine_stats?.producer_vectors ?? 0} vectors
                </div>
                <p>{stats.vector_engine_stats?.vector_dimensions?.producer ?? 32} dimensions</p>
              </div>
              <div className="vector-type consumer-vectors">
                <h4>Consumer Vectors</h4>
                <div className="vector-count">
                  {stats.vector_engine_stats?.consumer_vectors ?? 0} vectors
                </div>
                <p>{stats.vector_engine_stats?.vector_dimensions?.consumer ?? 28} dimensions</p>
              </div>
            </div>
            <p className="analytics-footer">
              Generated by CarbonFlow Analytics • {new Date().toLocaleDateString()}
            </p>
          </div>
        )}

        {activeTab === 'geography' && (
          <div className="geography-tab">
            <div className="geo-placeholder">
              <FaGlobeAmericas className="geo-icon" />
              <h3>Geographic Analytics</h3>
              <p>Producer and consumer coverage across North America.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
