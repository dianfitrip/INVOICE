import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './adminstyles/AdminSidebar.css';

const icons = {
    dashboard: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
        </svg>
    ),
    users: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
    ),
    invoice: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
    ),
    items: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
    ),
    payment: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
            <line x1="1" y1="10" x2="23" y2="10"></line>
        </svg>
    ),
    report: (
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
        </svg>
    ),
    logout: (
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
    )
};

const AdminSidebar = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        Swal.fire({
            title: 'Keluar dari sistem?',
            text: "Anda akan diarahkan ke halaman login",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal',
            borderRadius: '12px',
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('role');
                navigate('/login');
            }
        });
    };

    const isActive = (path) => location.pathname === path;

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-logo-container">
                <img src="/logorji.png" alt="RJI Logo" className="sidebar-logo" />
                <div className="sidebar-brand">
                    <span className="sidebar-brand-name">Admin Panel</span>
                    <span className="badge-role">{user?.role}</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <span className="nav-section-label">Menu Utama</span>

                <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                    <span className="nav-icon">{icons.dashboard}</span>
                    Dashboard
                </Link>

                {user?.role === 'superadmin' && (
                    <Link to="/admin/users" className={`nav-link ${isActive('/admin/users') ? 'active' : ''}`}>
                        <span className="nav-icon">{icons.users}</span>
                        Kelola User
                    </Link>
                )}

                <Link to="/admin/invoices" className={`nav-link ${isActive('/admin/invoices') ? 'active' : ''}`}>
                    <span className="nav-icon">{icons.invoice}</span>
                    Kelola Invoice
                </Link>

                <Link to="/admin/items" className={`nav-link ${isActive('/admin/items') ? 'active' : ''}`}>
                    <span className="nav-icon">{icons.items}</span>
                    Kelola Item
                </Link>

                <Link to="/admin/payments" className={`nav-link ${isActive('/admin/payments') ? 'active' : ''}`}>
                    <span className="nav-icon">{icons.payment}</span>
                    Kelola Payment
                </Link>

                <span className="nav-section-label">Analitik</span>

                <Link to="/admin/reports" className={`nav-link ${isActive('/admin/reports') ? 'active' : ''}`}>
                    <span className="nav-icon">{icons.report}</span>
                    Laporan
                </Link>
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user-info">
                    <div className="sidebar-user-avatar">
                        {user?.nama ? user.nama.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <span className="sidebar-user-name">{user?.nama || 'Admin'}</span>
                </div>
                <button onClick={handleLogout} className="btn-logout">
                    {icons.logout}
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;