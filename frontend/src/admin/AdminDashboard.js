import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './adminstyles/AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ nama: '', role: '' });
    
    // State Statistik Dummy (Nanti dihubungkan ke API)
    const [stats, setStats] = useState({
        totalUser: 0,
        totalAdmin: 0,
        totalInvoice: 0,
        pendingInvoice: 0
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return navigate('/login');

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // SECURITY CHECK: Kalau bukan admin, tendang keluar
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
        // Disini nanti fetch ke API Dashboard
        // Untuk sekarang kita pakai dummy data user + real data invoice
        try {
            const response = await fetch('http://localhost:5000/api/invoices', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if(response.ok) {
                setStats({
                    totalUser: 120, // Dummy
                    totalAdmin: 5,  // Dummy
                    totalInvoice: data.length,
                    pendingInvoice: data.filter(i => i.status === 'Belum Dibayar').length
                });
            }
        } catch (error) {
            console.error("Error fetching stats", error);
        }
    };

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
        <div className="admin-layout">
            {/* SIDEBAR */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <img src="/logorji.png" alt="RJI Logo" className="sidebar-logo"/>
                    <span className="badge-role">{user.role}</span>
                </div>
                
                <nav className="sidebar-nav">
                    <div className="nav-item active">
                        <span>📊</span> Dashboard
                    </div>
                    <div className="nav-item">
                        <span>👥</span> Kelola User
                    </div>
                    
                    {/* Menu Khusus Superadmin */}
                    {user.role === 'superadmin' && (
                        <div className="nav-item">
                            <span>🛡️</span> Kelola Admin
                        </div>
                    )}

                    <div className="nav-item">
                        <span>🧾</span> Kelola Invoice
                    </div>
                    <div className="nav-item">
                        <span>📈</span> Laporan
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="btn-logout-sidebar">
                        🚪 Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="admin-content">
                <header className="admin-header">
                    <h1>Dashboard Overview</h1>
                    <div className="user-profile">
                        <span>Halo, <b>{user.nama}</b></span>
                        <div className="avatar-admin">{user.nama.charAt(0)}</div>
                    </div>
                </header>

                <div className="stats-container">
                    <div className="stat-card blue">
                        <h3>{stats.totalUser}</h3>
                        <p>Total User Aktif</p>
                        <div className="icon-bg">👥</div>
                    </div>
                    
                    {user.role === 'superadmin' && (
                        <div className="stat-card purple">
                            <h3>{stats.totalAdmin}</h3>
                            <p>Total Admin</p>
                            <div className="icon-bg">🛡️</div>
                        </div>
                    )}

                    <div className="stat-card orange">
                        <h3>{stats.totalInvoice}</h3>
                        <p>Total Invoice</p>
                        <div className="icon-bg">📄</div>
                    </div>

                    <div className="stat-card red">
                        <h3>{stats.pendingInvoice}</h3>
                        <p>Perlu Verifikasi</p>
                        <div className="icon-bg">⏳</div>
                    </div>
                </div>

                <div className="recent-section">
                    <h3>Aktivitas Terbaru</h3>
                    <div className="empty-state-box">
                        <p>Belum ada aktivitas terbaru.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;