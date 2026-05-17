import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './adminstyles/ManageUsers.css';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    
    // PERBAIKAN: State 'name' diubah jadi 'nama'
    const [formData, setFormData] = useState({
        nama: '', 
        email: '',
        password: '',
        role: 'user'
    });

    const itemsPerPage = 15;
    const userRole = localStorage.getItem('role'); 
    const API_URL = 'http://localhost:5000/api/users'; 

    useEffect(() => {
        if (userRole === 'superadmin') {
            fetchUsersData();
        }
    }, [search, userRole]);

    const fetchUsersData = async () => {
        try {
            const token = localStorage.getItem('accessToken'); 
            const response = await axios.get(`${API_URL}?search=${search}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Memastikan data yang disimpan adalah array, jika gagal akan menjadi array kosong
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Gagal memuat data pengguna:", error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                Swal.fire('Sesi Habis', 'Silakan login kembali', 'error');
            }
        }
    };

    if (userRole !== 'superadmin') {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: 'red', fontWeight: 'bold' }}>
                Akses Ditolak: Halaman ini hanya untuk Superadmin.
            </div>
        ); 
    }

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(users.length / itemsPerPage);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1); 
    };

    const openCreateModal = () => {
        setIsEdit(false);
        setFormData({ nama: '', email: '', password: '', role: 'user' }); // PERBAIKAN: nama
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setIsEdit(true);
        setCurrentUserId(user.id);
        // PERBAIKAN: user.nama
        setFormData({ nama: user.nama, email: user.email, password: '', role: user.role });
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        
        try {
            if (isEdit) {
                const response = await axios.put(`${API_URL}/${currentUserId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('Berhasil!', response.data.message, 'success');
            } else {
                const response = await axios.post(API_URL, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('Berhasil!', response.data.message, 'success');
            }
            setShowModal(false);
            fetchUsersData(); 
        } catch (error) {
            Swal.fire('Gagal!', error.response?.data?.message || "Terjadi kesalahan sistem", 'error');
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Apakah Anda yakin?',
            text: "Data user yang dihapus tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('accessToken');
                try {
                    const response = await axios.delete(`${API_URL}/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    Swal.fire('Terhapus!', response.data.message, 'success');
                    fetchUsersData(); 
                } catch (error) {
                    Swal.fire('Gagal!', error.response?.data?.message || "Gagal menghapus pengguna", 'error');
                }
            }
        });
    };

    return (
        <div className="manage-users-container">
            <div className="manage-users-header">
                <h2>Kelola User</h2>
                <button className="btn-add-user" onClick={openCreateModal}>Tambah User Baru</button>
            </div>

            <div className="search-bar-container">
                <input 
                    type="text" 
                    placeholder="Cari user berdasarkan nama..." 
                    value={search} 
                    onChange={handleSearchChange} 
                    className="search-input"
                />
            </div>

            <div className="table-responsive">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.length > 0 ? (
                            currentUsers.map((user, index) => (
                                <tr key={user.id}>
                                    <td>{indexOfFirstItem + index + 1}</td>
                                    <td>{user.nama}</td> {/* PERBAIKAN: user.nama */}
                                    <td>{user.email}</td>
                                    <td><span className={`badge-role ${user.role}`}>{user.role}</span></td>
                                    <td>
                                        <button className="btn-action edit" onClick={() => openEditModal(user)}>Edit</button>
                                        <button className="btn-action delete" onClick={() => handleDelete(user.id)}>Hapus</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">Tidak ada data user ditemukan</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination-container">
                    <button 
                        className="btn-pagination" 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                        Sebelumnya
                    </button>
                    <span className="pagination-info">
                        Halaman {currentPage} dari {totalPages}
                    </span>
                    <button 
                        className="btn-pagination" 
                        disabled={currentPage === totalPages} 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                        Selanjutnya
                    </button>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>{isEdit ? 'Edit User' : 'Tambah User Baru'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Nama</label>
                                <input 
                                    type="text" 
                                    name="nama" // PERBAIKAN: name atribut jadi 'nama'
                                    value={formData.nama} 
                                    onChange={handleInputChange} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleInputChange} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Password {isEdit && <span className="optional">(Kosongkan jika tidak diubah)</span>}</label>
                                <input 
                                    type="password" 
                                    name="password" 
                                    value={formData.password} 
                                    onChange={handleInputChange} 
                                    required={!isEdit} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select name="role" value={formData.role} onChange={handleInputChange}>
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                    <option value="superadmin">Superadmin</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="btn-submit">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;