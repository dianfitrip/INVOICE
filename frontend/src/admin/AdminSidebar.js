import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './adminstyles/AdminSidebar.css';

const AdminSidebar = () => {
    // Mengambil informasi lokasi (URL saat ini) untuk menandai menu aktif
    const location = useLocation();
    
    // Mengambil data role dari localStorage
    const userRole = localStorage.getItem('role');

    return (
        <div className="admin-sidebar">
            <div className="sidebar-header">
                <h2>Admin Panel</h2>
            </div>
            
            <ul className="sidebar-menu">
                {/* Menu Dashboard (Bisa diakses oleh admin dan superadmin) */}
                <li className={location.pathname === '/admin/dashboard' ? 'active' : ''}>
                    <Link to="/admin/dashboard" className="sidebar-link">
                        Dashboard
                    </Link>
                </li>

                {/* Tambahkan menu lain di sini jika ada, misalnya menu Invoice, dll */}

                {/* MODIFIKASI: Menu Kelola User HANYA muncul jika role === 'superadmin' */}
                {userRole === 'superadmin' && (
                    <li className={location.pathname === '/admin/manage-users' ? 'active' : ''}>
                        <Link to="/admin/manage-users" className="sidebar-link">
                            Kelola User
                        </Link>
                    </li>
                )}
            </ul>
        </div>
    );
};

export default AdminSidebar;