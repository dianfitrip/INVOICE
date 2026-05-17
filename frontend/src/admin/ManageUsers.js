import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './adminstyles/ManageUsers.css';

const SearchIcon = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
);

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

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
        if (userRole === 'superadmin') fetchUsersData();
    }, [search, userRole]);

    const fetchUsersData = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get(`${API_URL}?search=${search}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
            <div className="access-denied">
                <div className="access-denied-icon">🔒</div>
                <h3>Akses Ditolak</h3>
                <p>Halaman ini hanya dapat diakses oleh Superadmin.</p>
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
        setFormData({ nama: '', email: '', password: '', role: 'user' });
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setIsEdit(true);
        setCurrentUserId(user.id_user);
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
            title: 'Hapus user ini?',
            text: "Data yang dihapus tidak bisa dikembalikan.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Ya, Hapus',
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

    // Build visible page numbers
    const getPageNumbers = () => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (currentPage <= 3) return [1, 2, 3, 4, '...', totalPages];
        if (currentPage >= totalPages - 2) return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };

    return (
        <div className="manage-users-container">
            {/* Header */}
            <div className="manage-users-header">
                <div className="manage-users-title">
                    <h2>Kelola User</h2>
                    <p>Manajemen akun dan hak akses pengguna</p>
                </div>
                <button className="btn-add-user" onClick={openCreateModal}>
                    <span>＋</span> Tambah User
                </button>
            </div>

            {/* Toolbar */}
            <div className="toolbar-container">
                <div className="search-bar-wrapper">
                    <span className="search-icon"><SearchIcon /></span>
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama..."
                        value={search}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>
                <span className="result-count">
                    {users.length} user ditemukan
                </span>
            </div>

            {/* Table */}
            <div className="table-card">
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
                                    <tr key={user.id_user}>
                                        <td>{indexOfFirstItem + index + 1}</td>
                                        <td>
                                            <div className="user-name-cell">
                                                <div className="user-initial">
                                                    {user.nama ? user.nama.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <span className="user-name-text">{user.nama}</span>
                                            </div>
                                        </td>
                                        <td><span className="email-text">{user.email}</span></td>
                                        <td>
                                            <span className={`badge-role ${user.role}`}>{user.role}</span>
                                        </td>
                                        <td>
                                            <div className="action-group">
                                                <button className="btn-action edit" onClick={() => openEditModal(user)}>
                                                    ✏️ Edit
                                                </button>
                                                <button className="btn-action delete" onClick={() => handleDelete(user.id_user)}>
                                                    🗑 Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5">
                                        <div className="empty-state">
                                            <div className="empty-state-icon">🔍</div>
                                            <p>Tidak ada data user ditemukan</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination-container">
                        <span className="pagination-info">
                            Menampilkan {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, users.length)} dari {users.length} user
                        </span>
                        <div className="pagination-buttons">
                            <button
                                className="btn-pagination"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                            >
                                ← Prev
                            </button>

                            {getPageNumbers().map((page, i) =>
                                page === '...'
                                    ? <span key={`dot-${i}`} style={{ padding: '0 4px', color: '#94a3b8' }}>…</span>
                                    : (
                                        <button
                                            key={page}
                                            className={`btn-page-number ${currentPage === page ? 'active' : ''}`}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </button>
                                    )
                            )}

                            <button
                                className="btn-pagination"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{isEdit ? 'Edit User' : 'Tambah User Baru'}</h3>
                            <button className="btn-modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Nama Lengkap</label>
                                    <input
                                        type="text"
                                        name="nama"
                                        value={formData.nama}
                                        onChange={handleInputChange}
                                        placeholder="Masukkan nama lengkap"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Alamat Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="contoh@email.com"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>
                                        Password{' '}
                                        {isEdit && <span className="optional">(kosongkan jika tidak diubah)</span>}
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder={isEdit ? '••••••••' : 'Buat password'}
                                        required={!isEdit}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Role / Hak Akses</label>
                                    <select name="role" value={formData.role} onChange={handleInputChange}>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                        <option value="superadmin">Superadmin</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn-submit">
                                    {isEdit ? 'Simpan Perubahan' : 'Tambah User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;