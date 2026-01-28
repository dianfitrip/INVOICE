import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import './authstyles/LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!email) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email.toLowerCase())) {
      tempErrors.email = "Invalid email address format";
      isValid = false;
    }

    if (!password) {
      tempErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError('');

    if (validate()) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('accessToken', data.accessToken);
          
          const decoded = parseJwt(data.accessToken);
          const role = decoded?.role || 'user'; 

          Swal.fire({
            icon: 'success',
            title: 'Login Berhasil!',
            text: `Selamat datang, ${decoded.nama}`,
            showConfirmButton: false, 
            timer: 1500,
            timerProgressBar: true
          }).then(() => {
            if (role === 'admin' || role === 'superadmin') {
                navigate('/admin'); 
            } else {
                navigate('/'); 
            }
          });

        } else {
          Swal.fire({
            icon: 'error',
            title: 'Login Gagal',
            text: data.msg || "Email atau password salah",
            confirmButtonColor: '#d33'
          });
        }

      } catch (error) {
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Error Server',
            text: 'Gagal terhubung ke server.',
            confirmButtonColor: '#d33'
        });
      }
    }
  };

  const handleGoogleLogin = () => {
    Swal.fire({
        icon: 'info',
        title: 'Coming Soon',
        text: 'Fitur Google Login akan segera hadir!',
        confirmButtonColor: '#F7941E'
    });
  };

  return (
    <div className="login-container">
        <div className="login-card">
          <div className="logo-wrapper">
             <img src="/logorji.png" alt="Logo" className="logo-img" />
          </div>

          <h2 className="login-title">Login</h2>
          <p className="login-desc">Document Management System for RJI Guarantee Letter Policy.</p>

          {apiError && <p className="api-error-text">{apiError}</p>}

          <form onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="Input your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({...errors, email: ''});
                }}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Input your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors({...errors, password: ''});
                  }}
                />
                
                {/* --- PERBAIKAN: KEMBALI KE SVG ICON --- */}
                <div className="password-toggle-icon" onClick={togglePasswordVisibility}>
                  {showPassword ? (
                    // Ikon Mata Terbuka (SVG)
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  ) : (
                    // Ikon Mata Tertutup/Coret (SVG)
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  )}
                </div>
                {/* --------------------------------------- */}

              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <button type="submit" className="btn-login">Login</button>
            <div className="divider"><span>OR</span></div>
            <button type="button" className="btn-google" onClick={handleGoogleLogin}>
              Login with Google
            </button>
          </form>

          <div className="register-link-box">
            Don't have an account? <Link to="/register" className="text-link">Create your account</Link>
          </div>
        </div>
      </div>
  );
};

export default LoginPage;