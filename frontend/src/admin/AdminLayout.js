import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import './adminstyles/AdminDashboard.css';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            navigate('/login');
            return;
        }
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role !== 'admin' && payload.role !== 'superadmin') {
                navigate('/');
                return;
            }
            setUser({ nama: payload.nama, role: payload.role });
        } catch (e) {
            localStorage.removeItem('accessToken');
            navigate('/login');
        }
    }, [navigate]);

    if (!user) return null;

    return (
        <div className="admin-layout">
            <AdminSidebar user={user} />
            <main className="admin-content">
                <header className="admin-header">
                    <h1>Admin Panel</h1>
                    <div className="header-profile">
                        <span>Halo, <b>{user.nama}</b></span>
                        <div className="avatar-circle" onClick={() => navigate('/profile')}>
                            {user.nama ? user.nama.charAt(0).toUpperCase() : 'A'}
                        </div>
                    </div>
                </header>
                <div className="page-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;