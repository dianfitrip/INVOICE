import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import HomePage from './user/HomePage';
import InvoicePage from './user/InvoicePage';
import DetailInvoicePage from './user/DetailInvoicePage';
import ProfilePage from './user/ProfilePage';

import AdminLayout from './admin/AdminLayout'; 
import AdminDashboard from './admin/AdminDashboard';
import ManageUsers from './admin/ManageUsers';
import ManageInvoices from './admin/ManageInvoices';
import ManageItems from './admin/ManageItems'; 
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publik & User */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/invoice" element={<InvoicePage />} />
        <Route path="/invoice/:id" element={<DetailInvoicePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        
        {/* Rute Admin Dashboard */}
        <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AdminLayout>
                    <AdminDashboard />
                </AdminLayout>
            </ProtectedRoute>
        } />

        {/* Rute Kelola User (Hanya Superadmin) */}
        <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
                <AdminLayout>
                    <ManageUsers />
                </AdminLayout>
            </ProtectedRoute>
        } />

        {/* Rute Kelola Invoice (Admin & Superadmin) */}
        <Route path="/admin/invoices" element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AdminLayout>
                    <ManageInvoices />
                </AdminLayout>
            </ProtectedRoute>
        } />

        {/* Rute Kelola Katalog Item Layanan (Admin & Superadmin) */}
        <Route path="/admin/items" element={
            <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                <AdminLayout>
                    <ManageItems />
                </AdminLayout>
            </ProtectedRoute>
        } />

        {/* Rute Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('accessToken'); 
    
    if (!token) return <Navigate to="/login" />;
    
    try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        if (!allowedRoles.includes(decoded.role.toLowerCase())) {
            return <Navigate to="/" />;
        }
    } catch (error) {
        return <Navigate to="/login" />;
    }
    
    return children;
};

export default App;