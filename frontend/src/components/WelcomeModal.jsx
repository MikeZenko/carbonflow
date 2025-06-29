// frontend/src/components/WelcomeModal.jsx

import React from 'react';
import { Link } from 'react-router-dom';

function WelcomeModal({ onGuestContinue }) {
  return (
    <div className="welcome-modal-overlay">
      <div className="welcome-modal-content">
        <h1>Unlock the Value of Carbon</h1>
        <p>Welcome to the premier B2B marketplace connecting CO₂ producers with innovative consumers. Our AI-powered platform provides the strategic insights needed to build a profitable and sustainable circular economy.</p>
        
        <h2>Join the Marketplace</h2>
        <div className="role-selection">
          <Link to="/register-producer" className="role-button producer-btn">
            <h3>I am a Producer</h3>
            <p>I have a supply of CO₂ and want to find partners.</p>
          </Link>
          <Link to="/register-consumer" className="role-button consumer-btn">
            <h3>I am a Consumer</h3>
            <p>I need a supply of CO₂ for my industrial process.</p>
          </Link>
        </div>

        <button onClick={onGuestContinue} className="guest-button">
          Continue as Guest &rarr;
        </button>
      </div>
    </div>
  );
}

export default WelcomeModal;