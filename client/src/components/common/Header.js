import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import hunarHubLogo from '../../assets/hunarhub-logo.png';

export default function Header() {
  const { auth, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    toast.success('Signed out successfully.');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="topbar">
      <Link to="/" className="brand" onClick={closeMenu}>
        <img className="brand-logo" src={hunarHubLogo} alt="HunarHub" />
        <span>Hunar<span>Hub</span><small>Crafted locally. Trusted widely.</small></span>
      </Link>

      <button
        type="button"
        className={`nav-toggle ${menuOpen ? 'nav-toggle--open' : ''}`}
        onClick={() => setMenuOpen(o => !o)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        <span /><span /><span />
      </button>

      <nav className={`topnav ${menuOpen ? 'topnav--open' : ''}`}>
        <NavLink to="/" end onClick={closeMenu}>Home</NavLink>
        <NavLink to="/entrepreneurs" onClick={closeMenu}>Makers</NavLink>
        <NavLink to="/products" onClick={closeMenu}>Products</NavLink>
        {auth && <NavLink to="/dashboard" onClick={closeMenu}>Dashboard</NavLink>}

        <div className="topnav-mobile-actions">
          {auth ? (
            <>
              <span className="user-chip">
                <b>{auth.name?.[0]?.toUpperCase()}</b>
                <span>{auth.name}<small>{auth.role}</small></span>
              </span>
              <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <Link className="btn btn-primary" to="/auth" onClick={closeMenu}>Get started</Link>
          )}
        </div>
      </nav>

      <div className="header-actions">
        {auth ? (
          <>
            <span className="user-chip">
              <b>{auth.name?.[0]?.toUpperCase()}</b>
              <span>{auth.name}<small>{auth.role}</small></span>
            </span>
            <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <Link className="btn btn-primary" to="/auth">Get started</Link>
        )}
      </div>
    </header>
  );
}
