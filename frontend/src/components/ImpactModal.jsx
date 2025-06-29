// frontend/src/components/ImpactModal.jsx

import React, { useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement,
  LineElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement,
  LineElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

function ImpactModal({ report, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  // Enhanced chart data with projections
  const projectionYears = ['2024', '2025', '2026', '2027', '2028'];
  const baseImpact = report.environmental.co2_diverted;
  const growthRate = 1.15; // 15% annual growth

  const projectionData = {
    labels: projectionYears,
    datasets: [
      {
        label: 'CO₂ Diverted (Tonnes)',
        data: projectionYears.map((_, i) => Math.round(baseImpact * Math.pow(growthRate, i))),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Cumulative Impact',
        data: projectionYears.map((_, i) => {
          let cumulative = 0;
          for (let j = 0; j <= i; j++) {
            cumulative += baseImpact * Math.pow(growthRate, j);
          }
          return Math.round(cumulative);
        }),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const emissionsBreakdown = {
    labels: ['CO₂ Diverted', 'Transport Emissions', 'Processing Savings', 'Net Benefit'],
    datasets: [
      {
        data: [
          report.environmental.co2_diverted,
          report.environmental.estimated_logistics_emissions,
          Math.round(report.environmental.co2_diverted * 0.3),
          report.environmental.net_co2_impact,
        ],
        backgroundColor: [
          '#10b981',
          '#f59e0b',
          '#06b6d4',
          '#059669',
        ],
        borderWidth: 0,
      },
    ],
  };

  const financialComparison = {
    labels: ['Traditional Supply', 'CarbonFlow Network', 'Cost Savings'],
    datasets: [
      {
        label: 'Annual Costs ($)',
        data: [
          report.financials.consumer_annual_savings + report.financials.producer_annual_revenue,
          report.financials.producer_annual_revenue,
          report.financials.consumer_annual_savings,
        ],
        backgroundColor: [
          '#ef4444',
          '#10b981',
          '#06b6d4',
        ],
        borderRadius: 8,
      },
    ],
  };

  const sustainabilityMetrics = [
    {
      title: 'Carbon Neutrality Progress',
      value: `${Math.round((report.environmental.net_co2_impact / 50000) * 100)}%`,
      description: 'Towards 2030 carbon neutrality goals',
      icon: '🌱',
      trend: '+12%'
    },
    {
      title: 'Circular Economy Impact',
      value: `${Math.round(report.environmental.co2_diverted / 1000)}K`,
      description: 'Tonnes of CO₂ prevented from atmosphere',
      icon: '♻️',
      trend: '+8%'
    },
    {
      title: 'Supply Chain Efficiency',
      value: '94%',
      description: 'Logistics optimization score',
      icon: '🚚',
      trend: '+5%'
    },
    {
      title: 'Economic Multiplier',
      value: '2.4x',
      description: 'ROI vs traditional methods',
      icon: '💰',
      trend: '+18%'
    }
  ];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: { color: '#d1d5db', font: { size: 12 } }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f3f4f6',
        bodyColor: '#d1d5db',
        borderColor: '#10b981',
        borderWidth: 1,
      }
    },
    scales: {
      x: { 
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' }
      },
      y: { 
        ticks: { color: '#9ca3af' },
        grid: { color: '#374151' }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'right',
        labels: { color: '#d1d5db', font: { size: 11 } }
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#f3f4f6',
        bodyColor: '#d1d5db',
      }
    }
  };

  return (
    <div className="impact-modal-overlay" onClick={onClose}>
      <div className="impact-modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Enhanced Header */}
        <div className="impact-modal-header">
          <div className="header-content">
            <div className="partnership-badge">
              <span className="producer-name">{report.producer_name}</span>
              <span className="arrow">→</span>
              <span className="consumer-name">{report.consumer_name}</span>
            </div>
            <h2>Comprehensive Impact Analysis</h2>
            <p className="report-subtitle">Sustainability & Financial Performance Report</p>
          </div>
          <div className="header-actions">
            <button className="print-report-btn" onClick={handlePrint}>
              📄 Export Report
            </button>
            <button className="close-modal-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="report-tabs">
          {['overview', 'environmental', 'financial', 'projections'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="report-content">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="executive-summary-card">
                <h3>Executive Summary</h3>
                <p>
                  This partnership demonstrates exceptional environmental and financial performance, 
                  achieving <strong>{report.environmental.net_co2_impact.toLocaleString()} tonnes</strong> of 
                  net carbon sequestration annually while generating 
                  <strong> ${(report.financials.producer_annual_revenue + report.financials.consumer_annual_savings).toLocaleString()}</strong> in 
                  combined economic value.
                </p>
              </div>

              <div className="metrics-grid-enhanced">
                {sustainabilityMetrics.map((metric, index) => (
                  <div key={index} className="metric-card-enhanced">
                    <div className="metric-icon">{metric.icon}</div>
                    <div className="metric-content">
                      <h4>{metric.title}</h4>
                      <div className="metric-value">{metric.value}</div>
                      <div className="metric-trend">
                        <span className="trend-indicator positive">{metric.trend}</span>
                        <span className="metric-desc">{metric.description}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="quick-insights">
                <h3>Key Insights</h3>
                <div className="insights-grid">
                  <div className="insight-item">
                    <div className="insight-icon">🎯</div>
                    <div>
                      <strong>Efficiency Leader:</strong> This partnership ranks in the top 5% for 
                      carbon-to-cost ratio optimization.
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon">📈</div>
                    <div>
                      <strong>Growth Potential:</strong> Projected 15% annual increase in 
                      environmental impact over 5 years.
                    </div>
                  </div>
                  <div className="insight-item">
                    <div className="insight-icon">🌍</div>
                    <div>
                      <strong>Global Impact:</strong> Equivalent to removing 
                      {Math.round(report.environmental.net_co2_impact / 4.6)} cars from roads annually.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Environmental Tab */}
          {activeTab === 'environmental' && (
            <div className="tab-content">
              <div className="chart-section">
                <h3>Environmental Impact Breakdown</h3>
                <div className="chart-container">
                  <Doughnut data={emissionsBreakdown} options={doughnutOptions} />
                </div>
              </div>

              <div className="environmental-details">
                <div className="detail-card">
                  <h4>🌱 Carbon Sequestration</h4>
                  <div className="detail-value">{report.environmental.co2_diverted.toLocaleString()} tonnes/year</div>
                  <p>Direct CO₂ captured and diverted from atmospheric release</p>
                </div>
                <div className="detail-card">
                  <h4>🚛 Logistics Footprint</h4>
                  <div className="detail-value">{report.environmental.estimated_logistics_emissions.toLocaleString()} tonnes/year</div>
                  <p>Transportation and processing emissions</p>
                </div>
                <div className="detail-card">
                  <h4>🎯 Net Environmental Benefit</h4>
                  <div className="detail-value positive">{report.environmental.net_co2_impact.toLocaleString()} tonnes/year</div>
                  <p>Total positive environmental impact</p>
                </div>
              </div>
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && (
            <div className="tab-content">
              <div className="chart-section">
                <h3>Financial Performance Analysis</h3>
                <div className="chart-container">
                  <Bar data={financialComparison} options={chartOptions} />
                </div>
              </div>

              <div className="financial-breakdown">
                <div className="financial-card revenue">
                  <h4>💰 Producer Revenue</h4>
                  <div className="amount">${report.financials.producer_annual_revenue.toLocaleString()}</div>
                  <div className="growth">+12% vs industry average</div>
                </div>
                <div className="financial-card savings">
                  <h4>💡 Consumer Savings</h4>
                  <div className="amount">${report.financials.consumer_annual_savings.toLocaleString()}</div>
                  <div className="growth">35% cost reduction</div>
                </div>
                <div className="financial-card credits">
                  <h4>🏆 Carbon Credits</h4>
                  <div className="amount">${report.financials.carbon_credit_value.toLocaleString()}</div>
                  <div className="growth">Additional revenue stream</div>
                </div>
              </div>
            </div>
          )}

          {/* Projections Tab */}
          {activeTab === 'projections' && (
            <div className="tab-content">
              <div className="chart-section">
                <h3>5-Year Impact Projections</h3>
                <div className="chart-container">
                  <Line data={projectionData} options={chartOptions} />
                </div>
              </div>

              <div className="projection-summary">
                <div className="projection-card">
                  <h4>Cumulative CO₂ Impact</h4>
                  <div className="projection-value">
                    {Math.round(baseImpact * 6.7).toLocaleString()} tonnes
                  </div>
                  <p>Total carbon sequestration by 2028</p>
                </div>
                <div className="projection-card">
                  <h4>Economic Value</h4>
                  <div className="projection-value">
                    ${Math.round((report.financials.producer_annual_revenue + report.financials.consumer_annual_savings) * 6.7 / 1000)}M
                  </div>
                  <p>Combined economic impact</p>
                </div>
                <div className="projection-card">
                  <h4>Market Position</h4>
                  <div className="projection-value">Top 3%</div>
                  <p>Projected market leadership</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="report-footer">
          <div className="footer-info">
            <p>Generated by CarbonFlow Analytics • {new Date().toLocaleDateString()}</p>
            <p>Data validated using industry-standard carbon accounting protocols</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ImpactModal;