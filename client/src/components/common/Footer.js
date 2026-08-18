import React from 'react';
import { Link } from 'react-router-dom';
import hunarHubLogo from '../../assets/hunarhub-logo.png';

export default function Footer() {
  return (
    <footer className="footer-bar">
      <Link to="/" className="brand">
        <img className="brand-logo" src={hunarHubLogo} alt="HunarHub" />
        <span>Hunar<span>Hub</span></span>
      </Link>
      <p>Celebrating skill. Strengthening communities.</p>
      <span>Copyright {new Date().getFullYear()} HunarHub</span>
    </footer>
  );
}
