import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import './adminstyles/AdminDashboard.css'; // Pastikan path benar

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ nama: '', role: '' });
    const [stats, setStats] = useState({ totalUser: 0, totalAdmin: 0, totalInvoice: 0, pendingInvoice: 0 });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return navigate('/login');
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role !== 'admin' && payload.role !== 'superadmin') {
                navigate('/'); 
                return;
            }
            setUser({ nama: payload.nama, role: payload.role });
            fetchDataStats(token);
        } catch (e) {
            localStorage.removeItem('accessToken');
            navigate('/login');
        }
    };

    const fetchDataStats = async (token) => {
        try {
            const response = await fetch('http://localhost:5000/api/invoices', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if(response.ok) {
                setStats({
                    totalUser: 120,
                    totalAdmin: 5,
                    totalInvoice: data.length,
                    pendingInvoice: data.filter(i => i.status === 'Belum Dibayar').length
                });
            }
        } catch (error) { console.error("Error stats", error); }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar user={user} />

            <main className="admin-content">
                <header className="admin-header">
                    <h1>Dashboard Overview</h1>
                    <div className="header-profile">
                        <span>Halo, <b>{user.nama}</b></span>
                        <div className="avatar-circle" onClick={() => navigate('/profile')}>
                            {user.nama ? user.nama.charAt(0).toUpperCase() : 'A'}
                        </div>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card blue">
                        <h3>{stats.totalUser}</h3>
                        <p>Total User Aktif</p>
                    </div>
                    
                    {user.role === 'superadmin' && (
                        <div className="stat-card purple">
                            <h3>{stats.totalAdmin}</h3>
                            <p>Total Admin</p>
                        </div>
                    )}

                    <div className="stat-card orange">
                        <h3>{stats.totalInvoice}</h3>
                        <p>Total Invoice</p>
                    </div>

                    <div className="stat-card red">
                        <h3>{stats.pendingInvoice}</h3>
                        <p>Perlu Verifikasi</p>
                    </div>
                </div>

                <div className="recent-section">
                    <h3>Aktivitas Terbaru</h3>
                    <div className="empty-box">
                        <p>Belum ada aktivitas terbaru.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;