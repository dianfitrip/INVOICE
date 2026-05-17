import React, { useEffect, useState } from 'react';
import './adminstyles/AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ totalUser: 0, totalAdmin: 0, totalInvoice: 0, pendingInvoice: 0 });
    const userRole = localStorage.getItem('role') || '';

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) fetchDataStats(token);
    }, []);

    const fetchDataStats = async (token) => {
        try {
            const response = await fetch('http://localhost:5000/api/invoices', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setStats({
                    totalUser: 120,
                    totalAdmin: 5,
                    totalInvoice: data.length || 0,
                    pendingInvoice: Array.isArray(data) ? data.filter(i => i.status === 'Belum Dibayar').length : 0
                });
            }
        } catch (error) {
            console.error("Error stats", error);
        }
    };

    const cards = [
        {
            key: 'user',
            color: 'blue',
            icon: '👤',
            value: stats.totalUser,
            label: 'Total User Aktif',
            show: true,
        },
        {
            key: 'admin',
            color: 'purple',
            icon: '🛡️',
            value: stats.totalAdmin,
            label: 'Total Admin',
            show: userRole === 'superadmin',
        },
        {
            key: 'invoice',
            color: 'orange',
            icon: '📄',
            value: stats.totalInvoice,
            label: 'Total Invoice',
            show: true,
        },
        {
            key: 'pending',
            color: 'red',
            icon: '⏳',
            value: stats.pendingInvoice,
            label: 'Perlu Verifikasi',
            show: true,
        },
    ];

    return (
        <div>
            <div className="stats-grid">
                {cards.filter(c => c.show).map(card => (
                    <div className={`stat-card ${card.color}`} key={card.key}>
                        <div className="stat-card-icon">{card.icon}</div>
                        <h3>{card.value}</h3>
                        <p>{card.label}</p>
                    </div>
                ))}
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