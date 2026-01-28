import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './stylecomponents/Navbar.css';

const Navbar = () => {
  const location = useLocation(); // Hook untuk mengetahui halaman aktif

  // Helper function untuk menentukan class aktif (Garis bawah oranye)
  const getMenuClass = (path) => {
    // Jika path sama dengan lokasi sekarang, tambahkan class 'active'
    return location.pathname === path ? "menu-link active" : "menu-link";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container-fluid">
        
        {/* --- Logo Section --- */}
        <div className="logo-section">
          <Link to="/">
            <img src="/logorji.png" alt="RJI Logo" className="logo-image" />
          </Link>
        </div>

        {/* --- Menu Section (Tengah) --- */}
        <div className="menu-center">
          <Link to="/" className={getMenuClass('/')}>Home</Link>
          <Link to="/invoice" className={getMenuClass('/invoice')}>Invoice</Link>
          <Link to="/kwitansi" className={getMenuClass('/kwitansi')}>Kwitansi</Link>
          <Link to="/faq" className={getMenuClass('/faq')}>FAQ</Link>
        </div>

        {/* --- Profil Section (Kanan) --- */}
        {/* Sekarang menjadi Link ke halaman Profil */}
        <Link to="/profile" style={{textDecoration: 'none'}}> 
            <div className="profile-section">
                <div className="profile-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <span className="profile-text">Profil Saya</span>
            </div>
        </Link>

      </div>
    </nav>
  );
};

export default Navbar;