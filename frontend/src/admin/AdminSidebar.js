import React from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './adminstyles/AdminSidebar.css'; // Import CSS Eksternal

const AdminSidebar = ({ user }) => {
    const navigate = useNavigate();

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
                    <span className="badge-role">{user.role}</span>
                </div>
            </div>
            
            <nav className="sidebar-nav">
                <div className="nav-link active">Dashboard</div>
                <div className="nav-link">Kelola User</div>
                
                {user.role === 'superadmin' && (
                    <div className="nav-link">Kelola Admin</div>
                )}

                <div className="nav-link">Kelola Invoice</div>
                <div className="nav-link">Laporan</div>
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