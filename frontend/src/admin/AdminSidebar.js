import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import './adminstyles/AdminSidebar.css'; // Import CSS Eksternal

const AdminSidebar = ({ user }) => {
    const navigate = useNavigate();
    const location = useLocation(); // Digunakan untuk mendeteksi URL saat ini (untuk state 'active')

    const handleLogout = () => {
        Swal.fire({
            title: 'Keluar?',
            text: "Anda akan kembali ke halaman login",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Ya, Keluar'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('accessToken');
                navigate('/login');
            }
        });
    };

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-logo-container">
                <img src="/logorji.png" alt="RJI Logo" className="sidebar-logo"/>
                <div>
                    {/* Menggunakan optional chaining (?.) untuk menghindari error jika user belum termuat */}
                    <span className="badge-role">{user?.role}</span> 
                </div>
            </div>
            
            <nav className="sidebar-nav">
                <Link 
                    to="/admin" 
                    className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                    style={{ textDecoration: 'none' }}
                >
                    Dashboard
                </Link>
                
                <Link 
                    to="/admin/users" 
                    className={`nav-link ${location.pathname === '/admin/users' ? 'active' : ''}`}
                    style={{ textDecoration: 'none' }}
                >
                    Kelola User
                </Link>

                <Link 
                    to="/admin/invoices" 
                    className={`nav-link ${location.pathname === '/admin/invoices' ? 'active' : ''}`}
                    style={{ textDecoration: 'none' }}
                >
                    Kelola Invoice
                </Link>

                <Link 
                    to="/admin/reports" 
                    className={`nav-link ${location.pathname === '/admin/reports' ? 'active' : ''}`}
                    style={{ textDecoration: 'none' }}
                >
                    Laporan
                </Link>
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="btn-logout">
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;