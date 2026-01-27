import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Tambah Navigate

import LoginPage from './user/LoginPage';
import RegisterPage from './user/RegisterPage';

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Tambahkan baris ini: Kalau buka root (/), alihkan ke /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </Router>
  );
}

export default App;