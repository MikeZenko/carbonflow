import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiActivity, FiBarChart, FiUsers, FiMap, FiCalendar } from 'react-icons/fi';
import { FaLeaf, FaIndustry, FaGlobeAmericas } from 'react-icons/fa';

function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('7d');

  // Mock analytics data
  const analyticsData = {
    overview: {
      totalMatches: 2450,
      carbonSaved: 94,
      activeProducers: 156,
      revenueGenerated: 45000,
      trends: [
        { month: 'Jan', matches: 180, carbon: 85 },
        { month: 'Feb', matches: 220, carbon: 88 },
        { month: 'Mar', matches: 195, carbon: 90 },
        { month: 'Apr', matches: 265, carbon: 92 },
        { month: 'May', matches: 240, carbon: 94 },
        { month: 'Jun', matches: 285, carbon: 96 }
      ]
    },
    matches: {
      successRate: 78,
      avgDistance: 45,
      topIndustries: [
        { name: 'Manufacturing', count: 450, percentage: 32 },
        { name: 'Energy', count: 380, percentage: 27 },
        { name: 'Agriculture', count: 290, percentage: 21 },
        { name: 'Technology', count: 180, percentage: 13 },
        { name: 'Other', count: 100, percentage: 7 }
      ]
    }
  };

  const StatCard = ({ icon, title, value, change, color }) => (
    <div className="analytics-stat-card">
      <div className="stat-icon" style={{ color }}>
        {icon}
      </div>
      <div className="stat-content">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        {change && (
          <div className={`stat-change ${change > 0 ? 'positive' : 'negative'}`}>
            {change > 0 ? '↗' : '↘'} {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );

  const ChartBar = ({ label, value, maxValue, color }) => (
    <div className="chart-bar-container">
      <div className="chart-bar-label">{label}</div>
      <div className="chart-bar-track">
        <div 
          className="chart-bar-fill" 
          style={{ 
            width: `${(value / maxValue) * 100}%`, 
            backgroundColor: color || 'var(--primary-color)' 
          }}
        />
      </div>
      <div className="chart-bar-value">{value}</div>
    </div>
  );

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
          <FiBarChart />
          Overview
        </button>
        <button 
          className={`analytics-tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          <FiUsers />
          Matches
        </button>
        <button 
          className={`analytics-tab ${activeTab === 'geography' ? 'active' : ''}`}
          onClick={() => setActiveTab('geography')}
        >
          <FiMap />
          Geography
        </button>
      </div>

      <div className="analytics-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <StatCard
                icon={<FiUsers />}
                title="Total Matches"
                value="2,450"
                change={12}
                color="var(--primary-color)"
              />
              <StatCard
                icon={<FaLeaf />}
                title="Carbon Saved"
                value="94%"
                change={5}
                color="#10b981"
              />
              <StatCard
                icon={<FaIndustry />}
                title="Active Producers"
                value="156"
                change={8}
                color="#3b82f6"
              />
              <StatCard
                icon={<FiTrendingUp />}
                title="Revenue Generated"
                value="$45,000"
                change={15}
                color="#059669"
              />
            </div>

            <div className="chart-section">
              <h3>Monthly Trends</h3>
              <div className="trend-chart">
                {analyticsData.overview.trends.map((item, index) => (
                  <div key={index} className="trend-bar">
                    <div className="trend-month">{item.month}</div>
                    <div className="trend-bars">
                      <div 
                        className="trend-bar-matches" 
                        style={{ height: `${(item.matches / 300) * 100}px` }}
                        title={`${item.matches} matches`}
                      />
                      <div 
                        className="trend-bar-carbon" 
                        style={{ height: `${item.carbon}px` }}
                        title={`${item.carbon}% carbon saved`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color matches"></div>
                  <span>Matches</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color carbon"></div>
                  <span>Carbon Efficiency</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="matches-tab">
            <div className="matches-stats">
              <div className="match-success-rate">
                <h3>Match Success Rate</h3>
                <div className="success-rate-circle">
                  <div className="success-rate-value">{analyticsData.matches.successRate}%</div>
                </div>
              </div>
              
              <div className="avg-distance">
                <h3>Average Distance</h3>
                <div className="distance-value">{analyticsData.matches.avgDistance} km</div>
                <p>Between producers and consumers</p>
              </div>
            </div>

            <div className="industry-breakdown">
              <h3>Top Industries</h3>
              <div className="industry-chart">
                {analyticsData.matches.topIndustries.map((industry, index) => (
                  <ChartBar
                    key={index}
                    label={industry.name}
                    value={industry.count}
                    maxValue={500}
                    color={`hsl(${index * 60}, 70%, 50%)`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'geography' && (
          <div className="geography-tab">
            <div className="geo-placeholder">
              <FaGlobeAmericas className="geo-icon" />
              <h3>Geographic Analytics</h3>
              <p>Interactive map showing distribution of producers and consumers across regions</p>
              <div className="geo-stats">
                <div className="geo-stat">
                  <strong>North America</strong>
                  <span>65% of matches</span>
                </div>
                <div className="geo-stat">
                  <strong>Europe</strong>
                  <span>25% of matches</span>
                </div>
                <div className="geo-stat">
                  <strong>Asia Pacific</strong>
                  <span>10% of matches</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage; 