// frontend/src/pages/RegisterConsumerPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addConsumer, geocodeAddress } from '../api';

function RegisterConsumerPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const [consumerName, setConsumerName] = useState('');
  const [consumerIndustry, setConsumerIndustry] = useState('');
  const [consumerDemand, setConsumerDemand] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!address || !consumerName || !consumerIndustry || !consumerDemand) {
        alert("Please fill out all fields.");
        return;
    }
    setIsLoading(true);
    try {
      const location = await geocodeAddress(address);
      const consumerData = {
        name: consumerName,
        industry: consumerIndustry,
        location: { lat: location.lat, lon: location.lon },
        co2_demand_tonnes_per_week: parseInt(consumerDemand, 10),
      };
      await addConsumer(consumerData);

      alert(`Successfully registered consumer: ${consumerName}`);
      navigate('/');
    } catch (error) {
      alert(error.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <main className="registration-page">
      {isLoading && <div className="loading-overlay">Registering...</div>}
      <div className="form-container">
        <div className="form-section">
          <h2>Register a CO₂ Consumer</h2>
          <p className="form-instruction">
            Enter your company's full address. Our system will automatically find its location upon registration.
          </p>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Enter Consumer Name" value={consumerName} onChange={(e) => setConsumerName(e.target.value)} />
            <input type="text" placeholder="Enter Industry" value={consumerIndustry} onChange={(e) => setConsumerIndustry(e.target.value)} />
            <input type="text" placeholder="Enter Full Address (e.g., 111 8th Ave, New York, NY)" value={address} onChange={(e) => setAddress(e.target.value)} />
            <input type="number" placeholder="Enter CO₂ Demand (tonnes/week)" value={consumerDemand} onChange={(e) => setConsumerDemand(e.target.value)} />
            <button type="submit" disabled={isLoading}>Register Consumer</button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default RegisterConsumerPage;