import React from 'react';
import { Link } from 'react-router-dom';
import './stylecomponents/Navbar.css'; // Import CSS yang baru dibuat

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo Section */}
        <div className="logo-section">
          {/* PERBAIKAN LOGO: Cukup pakai slash (/) untuk akses folder public */}
          <img src="/logorji.png" alt="RJI Logo" className="logo-image" />
          <span>DOI by <span className="highlight-text">RJI</span></span>
        </div>

        {/* Menu Section */}
        <div className="menu-section">
          <Link to="/" className="menu-link">Home</Link>
          <Link to="/faq" className="menu-link">FAQ</Link>
          <Link to="/login">
            <button className="btn-nav-login">
              Login
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;