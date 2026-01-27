import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import './userstyles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nama: '', role: '' });

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      navigate('/login');
    } else {
      const decoded = parseJwt(token);
      if (decoded) {
        setUser({
          nama: decoded.nama,
          role: decoded.role
        });
      } else {
        localStorage.removeItem('accessToken');
        navigate('/login');
      }
    }
  }, [navigate]);

  return (
    <div className="homepage-bg">
      <Navbar />
      
      {/* PERBAIKAN DI SINI: Container utama dibatasi lebarnya */}
      <div className="main-content-container">
        
        {/* HEADER SECTION */}
        <div className="welcome-banner">
            <div>
              <h1>Halo, <span className="text-orange">{user.nama}</span>! 👋</h1>
              <p>Selamat datang di RJI Document Management System.</p>
            </div>
            <div className="date-badge">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>

        {/* STATS CARDS (Dashboard Sementara) */}
        <div className="dashboard-grid">
          <div className="card-stat">
            <div className="icon-stat orange-bg">📄</div>
            <div className="info-stat">
              <h3>0</h3>
              <p>Total Invoice</p>
            </div>
          </div>
          
          <div className="card-stat">
            <div className="icon-stat green-bg">💰</div>
            <div className="info-stat">
              <h3>0</h3>
              <p>Lunas</p>
            </div>
          </div>

          <div className="card-stat">
            <div className="icon-stat red-bg">⏳</div>
            <div className="info-stat">
              <h3>0</h3>
              <p>Belum Dibayar</p>
            </div>
          </div>

          <div className="card-stat">
            <div className="icon-stat blue-bg">🧾</div>
            <div className="info-stat">
              <h3>0</h3>
              <p>Kwitansi</p>
            </div>
          </div>
        </div>

        {/* QUICK ACTION MENU */}
        <h3 style={{marginTop: '40px', marginBottom: '20px', color: '#333'}}>Menu Cepat</h3>
        <div className="action-grid">
          <button className="btn-action">
            <span className="plus-icon">+</span> Buat Invoice Baru
          </button>
          <button className="btn-action outline">
            Lihat Riwayat Transaksi
          </button>
          <button className="btn-action outline">
            Download Laporan
          </button>
        </div>

      </div>
    </div>
  );
};

export default HomePage;