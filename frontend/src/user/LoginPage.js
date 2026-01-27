import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './userstyles/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login dengan:", email, password);
  };

  return (
    <>
      <div className="login-container">
        <div className="login-card">
          
          {/* Logo RJI */}
          <div style={{marginBottom: '20px'}}>
             <img src="/logorji.png" alt="Logo" style={{height: '50px'}} />
          </div>

          <h2 className="login-title">Login</h2>
          
          {/* Deskripsi Kebijakan (Tetap di atas) */}
          <p className="login-desc">
            Document Management System for RJI Guarantee Letter Policy.
          </p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="Input your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="Input your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-login">Login</button>
          </form>

          {/* LINK DAFTAR - PINDAH KE SINI (Di Bawah Tombol Login) */}
          <div style={{marginTop: '25px', fontSize: '14px', color: '#666'}}>
            Don't have an account? <Link to="/register" className="text-link">Create your account</Link>
          </div>

        </div>
      </div>
    </>
  );
};

export default LoginPage;