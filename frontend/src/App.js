import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import HomePage from './user/HomePage';
import InvoicePage from './user/InvoicePage';
import DetailInvoicePage from './user/DetailInvoicePage';
import ProfilePage from './user/ProfilePage';
import AdminDashboard from './admin/AdminDashboard';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/invoice" element={<InvoicePage />} />
        <Route path="/invoice/:id" element={<DetailInvoicePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        

        
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'superadmin']}><AdminDashboard /></ProtectedRoute>
} />

        {/* Jika user mengetik alamat aneh, baru lempar ke login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

// Tambahkan komponen ini di App.js
const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" />;
    
    const decoded = JSON.parse(atob(token.split('.')[1]));
    if (!allowedRoles.includes(decoded.role.toLowerCase())) {
        return <Navigate to="/" />;
    }
    return children;
};




export default App;