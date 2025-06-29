// frontend/src/components/ProducerList.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { 
  FaIndustry, 
  FaMapMarkerAlt, 
  FaSearch, 
  FaFilter, 
  FaSortAmountDown, 
  FaSortAmountUp,
  FaLeaf,
  FaFlask,
  FaFireAlt,
  FaBolt,
  FaSpinner
} from 'react-icons/fa';
import { FiArrowRight, FiX } from 'react-icons/fi';
import { getProducers } from '../api';

const ProducerList = ({ onFindMatches }) => {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedCapacityRange, setSelectedCapacityRange] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducer, setSelectedProducer] = useState(null);

  useEffect(() => {
    fetchProducers();
  }, []);

  const fetchProducers = async () => {
    try {
      setLoading(true);
      const data = await getProducers();
      setProducers(data);
    } catch (error) {
      console.error('Error fetching producers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique industries for filter
  const industries = useMemo(() => {
    const uniqueIndustries = [...new Set(producers.map(p => p.industry_type))];
    return uniqueIndustries.sort();
  }, [producers]);

  // Capacity ranges for filtering
  const capacityRanges = [
    { label: 'Small (< 1,000 tonnes/year)', min: 0, max: 999 },
    { label: 'Medium (1,000 - 10,000 tonnes/year)', min: 1000, max: 9999 },
    { label: 'Large (> 10,000 tonnes/year)', min: 10000, max: Infinity }
  ];

  // Filter and sort producers
  const filteredAndSortedProducers = useMemo(() => {
    let filtered = producers.filter(producer => {
      const matchesSearch = 
        producer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producer.industry_type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesIndustry = !selectedIndustry || producer.industry_type === selectedIndustry;
      
      const matchesCapacity = !selectedCapacityRange || (() => {
        const range = capacityRanges.find(r => r.label === selectedCapacityRange);
        const capacity = producer.co2_output_tonnes_per_year;
        return capacity >= range.min && capacity <= range.max;
      })();

      return matchesSearch && matchesIndustry && matchesCapacity;
    });

    // Sort producers
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'capacity':
          aValue = a.co2_output_tonnes_per_year;
          bValue = b.co2_output_tonnes_per_year;
          break;
        case 'location':
          aValue = `${a.location.lat},${a.location.lon}`;
          bValue = `${b.location.lat},${b.location.lon}`;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [producers, searchTerm, selectedIndustry, selectedCapacityRange, sortBy, sortOrder]);

  const getIndustryIcon = (industry) => {
    switch (industry.toLowerCase()) {
      case 'chemical':
      case 'petrochemical':
        return <FaFlask />;
      case 'power generation':
      case 'energy':
        return <FaBolt />;
      case 'steel':
      case 'manufacturing':
        return <FaFireAlt />;
      default:
        return <FaIndustry />;
    }
  };

  const formatCapacity = (capacity) => {
    if (capacity >= 1000000) {
      return `${(capacity / 1000000).toFixed(1)}M`;
    } else if (capacity >= 1000) {
      return `${(capacity / 1000).toFixed(1)}K`;
    }
    return capacity.toString();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedIndustry('');
    setSelectedCapacityRange('');
    setSortBy('name');
    setSortOrder('asc');
  };

  const handleProducerSelect = async (producer) => {
    setSelectedProducer(producer);
    await onFindMatches(producer);
  };

  const SkeletonCard = () => (
    <div className="producer-card skeleton">
      <div className="producer-header">
        <div className="skeleton-icon"></div>
        <div className="producer-info">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-subtitle"></div>
        </div>
      </div>
      <div className="producer-stats">
        <div className="stat-item">
          <div className="skeleton-line skeleton-stat"></div>
          <div className="skeleton-line skeleton-label"></div>
        </div>
        <div className="stat-item">
          <div className="skeleton-line skeleton-stat"></div>
          <div className="skeleton-line skeleton-label"></div>
        </div>
      </div>
      <div className="skeleton-button"></div>
    </div>
  );

  return (
    <div className="producer-list-container">
      <div className="producer-list-header">
        <div className="header-content">
          <h2>CO₂ Producers</h2>
          <p>Discover verified producers with available CO₂ supply</p>
        </div>
        
        {/* Search and Filters */}
        <div className="search-filter-section">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search producers, locations, or industries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="clear-search"
              >
                <FiX />
              </button>
            )}
          </div>
          
          <div className="filter-controls">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
            >
              <FaFilter />
              Filters
            </button>
            
            <div className="sort-controls">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="name">Sort by Name</option>
                <option value="capacity">Sort by Capacity</option>
                <option value="location">Sort by Location</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="sort-order-btn"
              >
                {sortOrder === 'asc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="advanced-filters">
            <div className="filter-row">
              <div className="filter-group">
                <label>Industry Type</label>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Industries</option>
                  {industries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>
              
              <div className="filter-group">
                <label>Capacity Range</label>
                <select
                  value={selectedCapacityRange}
                  onChange={(e) => setSelectedCapacityRange(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Capacities</option>
                  {capacityRanges.map(range => (
                    <option key={range.label} value={range.label}>{range.label}</option>
                  ))}
                </select>
              </div>
              
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="results-summary">
          <span className="results-count">
            {loading ? 'Loading...' : `${filteredAndSortedProducers.length} producer${filteredAndSortedProducers.length !== 1 ? 's' : ''} found`}
          </span>
          {(searchTerm || selectedIndustry || selectedCapacityRange) && (
            <button onClick={clearFilters} className="clear-all-link">
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Producer Cards */}
      <div className="producer-cards">
        {loading ? (
          // Skeleton loading state
          Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        ) : filteredAndSortedProducers.length === 0 ? (
          <div className="empty-state">
            <FaLeaf className="empty-icon" />
            <h3>No producers found</h3>
            <p>Try adjusting your search criteria or filters</p>
            <button onClick={clearFilters} className="reset-btn">
              Reset Filters
            </button>
          </div>
        ) : (
          filteredAndSortedProducers.map(producer => (
            <div 
              key={producer.id} 
              className={`producer-card ${selectedProducer?.id === producer.id ? 'selected' : ''}`}
            >
              <div className="producer-header">
                <div className="producer-icon">
                  {getIndustryIcon(producer.industry_type)}
                </div>
                <div className="producer-info">
                  <h3 className="producer-name">{producer.name}</h3>
                  <div className="producer-location">
                    <FaMapMarkerAlt />
                    <span>{producer.location.lat.toFixed(4)}, {producer.location.lon.toFixed(4)}</span>
                  </div>
                  <div className="producer-industry">
                    {producer.industry_type}
                  </div>
                </div>
              </div>
              
              <div className="producer-stats">
                <div className="stat-item">
                  <div className="stat-value">
                    {formatCapacity(producer.co2_output_tonnes_per_year)}
                  </div>
                  <div className="stat-label">tonnes/year</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{producer.co2_purity || 'N/A'}%</div>
                  <div className="stat-label">purity</div>
                </div>
              </div>
              
              <div className="producer-details">
                <div className="detail-item">
                  <strong>Transportation:</strong> {producer.transportation_methods ? producer.transportation_methods.join(', ') : 'Not specified'}
                </div>
                {producer.additional_info && (
                  <div className="detail-item">
                    <strong>Additional Info:</strong> {producer.additional_info}
                  </div>
                )}
              </div>
              
              <button 
                onClick={() => handleProducerSelect(producer)}
                className="find-matches-btn"
                disabled={selectedProducer?.id === producer.id}
              >
                {selectedProducer?.id === producer.id ? (
                  <>
                    <FaSpinner className="spinner" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Find Matches
                    <FiArrowRight />
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProducerList;