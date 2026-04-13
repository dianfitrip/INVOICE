import React from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

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
        <aside className="w-[260px] bg-white border-r border-gray-200 flex flex-col p-5 fixed h-screen left-0 top-0">
            <div className="text-center mb-10 mt-2">
                <img src="/logorji.png" alt="RJI Logo" className="h-10 mx-auto block mb-3"/>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                    {user.role}
                </span>
            </div>
            
            <nav className="flex-1 flex flex-col gap-2">
                {/* Menu Active (Dashboard) */}
                <div className="px-4 py-3 rounded-lg text-orange-500 bg-orange-50 font-bold cursor-pointer transition flex items-center">
                    Dashboard
                </div>
                
                {/* Menu Inactive */}
                <div className="px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-orange-500 cursor-pointer transition flex items-center font-medium">
                    Kelola User
                </div>
                
                {/* Menu Khusus Superadmin */}
                {user.role === 'superadmin' && (
                    <div className="px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-orange-500 cursor-pointer transition flex items-center font-medium">
                        Kelola Admin
                    </div>
                )}

                <div className="px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-orange-500 cursor-pointer transition flex items-center font-medium">
                    Kelola Invoice
                </div>
                <div className="px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-orange-500 cursor-pointer transition flex items-center font-medium">
                    Laporan
                </div>
            </nav>

            <div className="border-t border-gray-200 pt-5">
                <button 
                    onClick={handleLogout} 
                    className="w-full p-3 border border-red-200 bg-red-50 text-red-600 rounded-lg cursor-pointer font-semibold hover:bg-red-100 transition"
                >
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;