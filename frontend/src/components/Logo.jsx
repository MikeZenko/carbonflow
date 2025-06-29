// frontend/src/components/Logo.jsx

import React from 'react';
import { FaFeatherAlt } from 'react-icons/fa'; // A nice, lightweight icon

function Logo() {
  return (
    <div className="logo-container">
      <FaFeatherAlt className="logo-icon" />
      <span className="logo-text">CarbonFlow</span>
    </div>
  );
}

export default Logo;