import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './adminstyles/ManageInvoices.css'; // Kita pinjam CSS yang sudah rapi ini

const ManageItems = () => {
    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentItemId, setCurrentItemId] = useState(null);
    const [formData, setFormData] = useState({ nama_item: '', harga: '' });

    const API_URL = 'http://localhost:5000/api/items';
    const userRole = localStorage.getItem('role');

    useEffect(() => {
        if (userRole === 'admin' || userRole === 'superadmin') {
            fetchItems();
        }
    }, [userRole]);

    const fetchItems = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
            setItems(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setIsEdit(true);
            setCurrentItemId(item.id_item_layanan);
            setFormData({ nama_item: item.nama_item, harga: item.harga });
        } else {
            setIsEdit(false);
            setFormData({ nama_item: '', harga: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        try {
            if (isEdit) {
                await axios.put(`${API_URL}/${currentItemId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
                Swal.fire('Berhasil', 'Item berhasil diperbarui', 'success');
            } else {
                await axios.post(API_URL, formData, { headers: { Authorization: `Bearer ${token}` } });
                Swal.fire('Berhasil', 'Item baru ditambahkan', 'success');
            }
            setShowModal(false);
            fetchItems();
        } catch (error) {
            Swal.fire('Gagal', 'Terjadi kesalahan sistem', 'error');
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Hapus Item?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Hapus'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('accessToken');
                await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                fetchItems();
                Swal.fire('Terhapus', 'Item telah dihapus', 'success');
            }
        });
    };

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

    if (userRole !== 'admin' && userRole !== 'superadmin') return <div>Akses Ditolak</div>;

    return (
        <div className="mi-container">
            <div className="mi-header">
                <div className="mi-header-title">
                    <h2>Kelola Item Layanan</h2>
                    <p>Daftar harga dan layanan yang muncul di form Invoice.</p>
                </div>
                <button className="mi-btn-primary" onClick={() => handleOpenModal()}>+ Tambah Item</button>
            </div>

            <div className="mi-table-container">
                <table className="mi-table">
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Nama Item / Layanan</th>
                            <th>Harga Default</th>
                            <th style={{ textAlign: 'right' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={item.id_item_layanan}>
                                <td>{index + 1}</td>
                                <td className="mi-text-main">{item.nama_item}</td>
                                <td>{formatRupiah(item.harga)}</td>
                                <td className="mi-action-cell">
                                    <button className="mi-btn-icon" onClick={() => handleOpenModal(item)}>Edit</button>
                                    <button className="mi-btn-icon mi-btn-danger" onClick={() => handleDelete(item.id_item_layanan)}>Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="mi-modal-overlay">
                    <div className="mi-modal-box">
                        <div className="mi-modal-header">
                            <h3>{isEdit ? 'Edit Item' : 'Tambah Item Baru'}</h3>
                            <button className="mi-btn-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="mi-form">
                            <div className="mi-form-group">
                                <label>Nama Item Layanan</label>
                                <input type="text" value={formData.nama_item} onChange={(e) => setFormData({...formData, nama_item: e.target.value})} required />
                            </div>
                            <div className="mi-form-group">
                                <label>Harga Default (Rp)</label>
                                <input type="number" value={formData.harga} onChange={(e) => setFormData({...formData, harga: e.target.value})} required />
                            </div>
                            <div className="mi-modal-actions">
                                <button type="button" className="mi-btn-outline" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="mi-btn-primary">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageItems;