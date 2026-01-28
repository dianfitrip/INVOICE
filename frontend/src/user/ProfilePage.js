import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // 1. Import SweetAlert2
import './userstyles/ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({ nama: '', email: '' }); 
    const [isEditing, setIsEditing] = useState(false);
    
    // State Form Edit
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return navigate('/login');

        try {
            const response = await fetch('http://localhost:5000/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setUser(data);
                setFormData({ nama: data.nama, email: data.email, password: '' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        // --- 2. VALIDASI SIMPAN DENGAN SWEETALERT ---
        Swal.fire({
            title: 'Simpan Perubahan?',
            text: "Pastikan data yang Anda masukkan sudah benar.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#F7941E', // Warna Orange RJI
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Simpan!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Jika user klik Ya, baru jalankan proses simpan
                const token = localStorage.getItem('accessToken');
                try {
                    const response = await fetch('http://localhost:5000/api/auth/me', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(formData)
                    });
                    
                    const resultData = await response.json();
                    if (response.ok) {
                        // Sukses Alert
                        Swal.fire(
                            'Berhasil!',
                            'Profil Anda telah diperbarui.',
                            'success'
                        );
                        setUser(resultData.user);
                        setIsEditing(false);
                    } else {
                        // Gagal Alert
                        Swal.fire(
                            'Gagal!',
                            resultData.msg,
                            'error'
                        );
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        });
    };

    const handleLogout = () => {
        // --- 3. VALIDASI LOGOUT DENGAN SWEETALERT ---
        Swal.fire({
            title: 'Yakin ingin keluar?',
            text: "Anda harus login kembali untuk mengakses akun ini.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33', // Merah untuk bahaya/keluar
            cancelButtonColor: '#3085d6', // Biru standar
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('accessToken');
                
                // Pesan selamat tinggal (opsional, bisa dihapus kalau mau langsung pindah)
                Swal.fire({
                    title: 'Sampai Jumpa!',
                    text: 'Anda telah berhasil logout.',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                }).then(() => {
                    navigate('/login');
                });
            }
        });
    };

    return (
        <div className="profile-page-bg">
            <Navbar />
            <div className="main-content-container">
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="avatar-circle">
                            {user.nama ? user.nama.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <h2>{user.nama}</h2> 
                        <p className="email-text">{user.email}</p>
                    </div>

                    <div className="profile-body">
                        {!isEditing ? (
                            // MODE LIHAT (VIEW MODE)
                            <div className="view-mode">
                                <div className="info-row">
                                    <label>Nama Lengkap</label>
                                    <div className="info-value">{user.nama}</div> 
                                </div>
                                <div className="info-row">
                                    <label>Email</label>
                                    <div className="info-value">{user.email}</div>
                                </div>
                                
                                <div className="action-buttons">
                                    <button className="btn-edit" onClick={() => setIsEditing(true)}>
                                        ✏️ Edit Profil
                                    </button>
                                    
                                    <button className="btn-logout-big" onClick={handleLogout}>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // MODE EDIT (EDIT MODE)
                            <form onSubmit={handleSave} className="edit-form">
                                <div className="form-group">
                                    <label>Nama Lengkap</label>
                                    <input 
                                        type="text" 
                                        className="form-input"
                                        value={formData.nama} 
                                        onChange={(e) => setFormData({...formData, nama: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input 
                                        type="email" 
                                        className="form-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Ganti Password (Opsional)</label>
                                    <input 
                                        type="password" 
                                        className="form-input"
                                        placeholder="Biarkan kosong jika tidak ingin mengganti"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                                
                                <div className="edit-actions">
                                    <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>
                                        Batal
                                    </button>
                                    <button type="submit" className="btn-save">
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;