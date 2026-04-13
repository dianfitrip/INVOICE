import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ nama: '', role: '' });
    
    // State Statistik
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

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            
            {/* Panggil Komponen Sidebar Baru */}
            <AdminSidebar user={user} />

            {/* MAIN CONTENT */}
            <main className="ml-[260px] flex-1 py-8 px-10">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800 m-0">Dashboard Overview</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">Halo, <b className="text-gray-800">{user.nama}</b></span>
                        <div className="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center font-bold text-lg">
                            {user.nama.charAt(0)}
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 relative overflow-hidden">
                        <h3 className="text-3xl font-bold text-gray-800 m-0">{stats.totalUser}</h3>
                        <p className="text-gray-500 text-sm mt-2">Total User Aktif</p>
                    </div>
                    
                    {user.role === 'superadmin' && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 relative overflow-hidden">
                            <h3 className="text-3xl font-bold text-gray-800 m-0">{stats.totalAdmin}</h3>
                            <p className="text-gray-500 text-sm mt-2">Total Admin</p>
                        </div>
                    )}

                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 relative overflow-hidden">
                        <h3 className="text-3xl font-bold text-gray-800 m-0">{stats.totalInvoice}</h3>
                        <p className="text-gray-500 text-sm mt-2">Total Invoice</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 relative overflow-hidden">
                        <h3 className="text-3xl font-bold text-gray-800 m-0">{stats.pendingInvoice}</h3>
                        <p className="text-gray-500 text-sm mt-2">Perlu Verifikasi</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Aktivitas Terbaru</h3>
                    <div className="bg-white p-10 rounded-xl text-center text-gray-400 border border-dashed border-gray-300">
                        <p>Belum ada aktivitas terbaru.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;