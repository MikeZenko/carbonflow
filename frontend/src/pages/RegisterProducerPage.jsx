// frontend/src/pages/RegisterProducerPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addProducer, geocodeAddress } from '../api';

function RegisterProducerPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [producerName, setProducerName] = useState('');
  const [producerSupply, setProducerSupply] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!address || !producerName || !producerSupply) {
      alert("Please fill out all fields.");
      return;
    }
    setIsLoading(true);
    try {
      const location = await geocodeAddress(address);
      const producerData = {
        name: producerName,
        location: { lat: location.lat, lon: location.lon },
        co2_supply_tonnes_per_week: parseInt(producerSupply, 10),
      };
      await addProducer(producerData);
      
      alert(`Successfully registered producer: ${producerName}`);
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
          <h2>Register a CO₂ Producer</h2>
          <p className="form-instruction">
            Enter your company's full address. Our system will automatically find its location upon registration.
          </p>
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Enter Producer Name" value={producerName} onChange={(e) => setProducerName(e.target.value)} />
            <input type="text" placeholder="Enter Full Address (e.g., 1600 Amphitheatre Parkway, Mountain View, CA)" value={address} onChange={(e) => setAddress(e.target.value)} />
            <input type="number" placeholder="Enter CO₂ Supply (tonnes/week)" value={producerSupply} onChange={(e) => setProducerSupply(e.target.value)} />
            <button type="submit" disabled={isLoading}>Register Producer</button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default RegisterProducerPage;