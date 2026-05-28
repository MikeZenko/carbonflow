import React from 'react';
import { Link } from 'react-router-dom';

/* The flow glyph: a filled producer disc connected to an outlined
 * consumer disc. Tells the whole CarbonFlow product story in 24px.
 * `currentColor` inherits from .brand svg in styles.css (moss accent). */
function FlowMark() {
  return (
    <svg
      width="26"
      height="14"
      viewBox="0 0 26 14"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="4" cy="7" r="3.5" fill="currentColor" />
      <line x1="8.5" y1="7" x2="17.5" y2="7" stroke="currentColor" strokeWidth="1.25" />
      <circle cx="22" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

function Logo() {
  return (
    <Link to="/" className="brand">
      <FlowMark />
      <span className="brand-word">CarbonFlow</span>
    </Link>
  );
}

export default Logo;
