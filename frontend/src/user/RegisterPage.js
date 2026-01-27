import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './userstyles/RegisterPage.css';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setErrors({
      ...errors,
      [name]: ''
    });
  };

  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    // 1. Validasi Nama
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!formData.fullName.trim()) {
      tempErrors.fullName = "Full Name is required";
      isValid = false;
    } else if (!nameRegex.test(formData.fullName)) {
      tempErrors.fullName = "Name must contain only letters";
      isValid = false;
    }

    // 2. Validasi Email (SUPER STRICT UNTUK TYPO GMAIL)
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const email = formData.email.toLowerCase(); 
    
    if (!email) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      tempErrors.email = "Invalid email address format";
      isValid = false;
    } else if (
      // --- DAFTAR BLACKLIST TYPO GMAIL ---
      email.endsWith('@gmil.com') ||     // Kurang 'a'
      email.endsWith('@gmal.com') ||     // Kurang 'i'
      email.endsWith('@gmial.com') ||    // Kebalik 'ia'
      email.endsWith('@gmaill.com') ||   // Kelebihan 'l'
      email.endsWith('@gmai.com') ||     // Kurang 'l'
      email.endsWith('@gmail.co') ||     // Kurang 'm'
      email.endsWith('@mail.com') ||     // Kurang 'g'
      email.endsWith('@gmail.comm')      // Kelebihan 'm'
    ) {
      tempErrors.email = "Please check your spelling email. Did you mean @gmail.com?";
      isValid = false;
    } else if (
      // Cek Typo Yahoo & Hotmail
      email.endsWith('@yahoo.co') || 
      email.endsWith('@hotmail.co')
    ) {
      tempErrors.email = "Did you mean .com?";
      isValid = false;
    }

    // 3. Validasi Password
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!formData.password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (!passwordRegex.test(formData.password)) {
      tempErrors.password = "Must be at least 6 chars with letters & numbers";
      isValid = false;
    }

    // 4. Confirm Password
    if (formData.confirmPassword !== formData.password) {
      tempErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Valid Data:", formData);
      alert("Registration Successful! (Data Ready for Backend)");
    }
  };

  // --- Fungsi Placeholder untuk Google Login ---
  const handleGoogleLogin = () => {
    alert("Fitur Google Login akan diaktifkan saat Backend siap!");
  };

  return (
    <>
      <div className="register-container">
        <div className="register-card">
          <div style={{marginBottom: '20px'}}>
             <img src="/logorji.png" alt="Logo" style={{height: '50px'}} />
          </div>

          <h2 className="register-title">Register</h2>
          <p style={{marginBottom: '20px', color: '#666'}}>
             Create an account to access the RJI Document Management System.
          </p>
          
          <form className="register-form" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                name="fullName"
                className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                placeholder="Full Name" 
                value={formData.fullName}
                onChange={handleChange}
              />
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="email" 
                name="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="Email Address" 
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Password" 
                  value={formData.password}
                  onChange={handleChange}
                />
                <div 
                  className="password-toggle-icon" 
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </div>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                placeholder="Repeat Password" 
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
            
            <button type="submit" className="btn-register">Register</button>

            {/* --- PEMBATAS (DIVIDER) --- */}
            <div className="divider">
              <span>OR</span>
            </div>

            {/* --- TOMBOL GOOGLE LOGIN --- */}
            <button type="button" className="btn-google" onClick={handleGoogleLogin}>
              {/* Logo Google SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>

          </form>
          
          <div style={{marginTop: '20px', fontSize: '14px', color: '#666'}}>
            Already have an account? <Link to="/login" className="text-link">Login here</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;