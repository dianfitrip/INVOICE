import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './userstyles/LoginPage.css';

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
    const emailLower = email.toLowerCase(); 
    
    if (!email) {
      tempErrors.email = "Email is required";
      isValid = false;
    } else if (!emailRegex.test(emailLower)) {
      tempErrors.email = "Invalid email address format";
      isValid = false;
    } else if (
      emailLower.endsWith('@gmil.com') ||     
      emailLower.endsWith('@gmal.com') ||     
      emailLower.endsWith('@gmial.com') ||    
      emailLower.endsWith('@gmaill.com') ||   
      emailLower.endsWith('@gmai.com') ||     
      emailLower.endsWith('@gmail.co') ||     
      emailLower.endsWith('@mail.com') ||     
      emailLower.endsWith('@gmail.comm')      
    ) {
      tempErrors.email = "Did you mean @gmail.com?";
      isValid = false;
    } else if (
      emailLower.endsWith('@yahoo.co') || 
      emailLower.endsWith('@hotmail.co')
    ) {
      tempErrors.email = "Did you mean .com?";
      isValid = false;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    if (!password) {
      tempErrors.password = "Password is required";
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      tempErrors.password = "Must be at least 6 chars with letters & numbers";
      isValid = false;
    }

    setErrors(tempErrors);
    return isValid;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setApiError('');

    if (validate()) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: email,
            password: password
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('accessToken', data.accessToken);
          navigate('/'); 
        } else {
          setApiError(data.msg || "Login Gagal");
        }

      } catch (error) {
        console.error(error);
        setApiError("Gagal terhubung ke server");
      }
    }
  };

  const handleGoogleLogin = () => {
    alert("Fitur Google Login akan diaktifkan nanti!");
  };

  return (
    <>
      <div className="login-container">
        <div className="login-card">
          
          <div style={{marginBottom: '20px'}}>
             <img src="/logorji.png" alt="Logo" style={{height: '50px'}} />
          </div>

          <h2 className="login-title">Login</h2>
          
          <p className="login-desc">
            Document Management System for RJI Guarantee Letter Policy.
          </p>

          {apiError && <p style={{color: '#dc2626', fontSize: '14px', marginBottom: '10px'}}>{apiError}</p>}

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

            <button type="submit" className="btn-login">Login</button>

            <div className="divider">
              <span>OR</span>
            </div>

            <button type="button" className="btn-google" onClick={handleGoogleLogin}>
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Login with Google
            </button>
          </form>

          <div style={{marginTop: '25px', fontSize: '14px', color: '#666'}}>
            Don't have an account? <Link to="/register" className="text-link">Create your account</Link>
          </div>

        </div>
      </div>
    </>
  );
};

export default LoginPage;