import React, { useEffect, useState } from 'react';
import './adminstyles/AdminDashboard.css'; 

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUser: 0, totalAdmin: 0, totalInvoice: 0, pendingInvoice: 0 });
    const userRole = localStorage.getItem('role') || ''; // Ambil role untuk cek superadmin

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if(token) {
            fetchDataStats(token);
        }
    }, []);

    const fetchDataStats = async (token) => {
        try {
            const response = await fetch('http://localhost:5000/api/invoices', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if(response.ok) {
                setStats({
                    totalUser: 120, // Ini dummy, ganti dengan API asli nanti
                    totalAdmin: 5,  // Ini dummy
                    totalInvoice: data.length || 0,
                    pendingInvoice: Array.isArray(data) ? data.filter(i => i.status === 'Belum Dibayar').length : 0
                });
            }
        } catch (error) { console.error("Error stats", error); }
    };

    return (
        <div>
            <div className="stats-grid">
                <div className="stat-card blue">
                    <h3>{stats.totalUser}</h3>
                    <p>Total User Aktif</p>
                </div>
                
                {userRole === 'superadmin' && (
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
        </div>
    );
};

export default AdminDashboard;