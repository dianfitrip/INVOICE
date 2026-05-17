import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './adminstyles/ManageUsers.css';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [message, setMessage] = useState('');
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'user'
    });

    const itemsPerPage = 15;
    // Mengambil role pengguna dari localStorage untuk pembatasan akses UI
    const userRole = localStorage.getItem('role'); 

    useEffect(() => {
        if (userRole === 'superadmin') {
            fetchUsersData();
        }
    }, [search, userRole]);

    const fetchUsersData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/users?search=${search}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data);
        } catch (error) {
            console.error("Gagal memuat data pengguna:", error);
        }
    };

    // Proteksi halaman jika pengguna bukan superadmin
    if (userRole !== 'superadmin') {
        return null; 
    }

    // Logika Pagination (Maksimal 15 data per halaman)
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(users.length / itemsPerPage);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1); // Reset ke halaman pertama saat melakukan pencarian
    };

    const openCreateModal = () => {
        setIsEdit(false);
        setFormData({ name: '', email: '', password: '', role: 'user' });
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setIsEdit(true);
        setCurrentUserId(user.id);
        setFormData({ name: user.name, email: user.email, password: '', role: user.role });
        setShowModal(true);
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            if (isEdit) {
                const response = await axios.put(`/api/users/${currentUserId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage(response.data.message);
            } else {
                const response = await axios.post('/api/users', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage(response.data.message);
            }
            setShowModal(false);
            fetchUsersData();
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            alert(error.response?.data?.message || "Terjadi kesalahan sistem");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
            const token = localStorage.getItem('token');
            try {
                const response = await axios.delete(`/api/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMessage(response.data.message);
                fetchUsersData();
                setTimeout(() => setMessage(''), 3000);
            } catch (error) {
                alert(error.response?.data?.message || "Gagal menghapus pengguna");
            }
        }
    };

    return (
        <div className="manage-users-container">
            <div className="manage-users-header">
                <h2>Kelola User</h2>
                <button className="btn-add-user" onClick={openCreateModal}>Tambah User Baru</button>
            </div>

            {message && <div className="alert-success">{message}</div>}

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
                                    <td>{user.name}</td>
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
                                    name="name" 
                                    value={formData.name} 
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