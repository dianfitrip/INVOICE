import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './stylecomponents/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook untuk mengetahui halaman aktif saat ini

  // Fungsi Logout
  const handleLogout = () => {
    const confirm = window.confirm("Yakin ingin keluar?");
    if (confirm) {
      localStorage.removeItem('accessToken');
      navigate('/login');
    }
  };

  // Helper function untuk menentukan class aktif
  const getMenuClass = (path) => {
    // Jika path sama dengan lokasi sekarang, tambahkan class 'active'
    return location.pathname === path ? "menu-link active" : "menu-link";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container-fluid">
        
        {/* --- Logo Section (Hanya Logo) --- */}
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
        <div className="profile-section">
          <div className="profile-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <span className="profile-text">Profil</span>
          
          <button onClick={handleLogout} className="btn-logout-small" title="Keluar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;