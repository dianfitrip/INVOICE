import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './adminstyles/ManageInvoices.css'; 

const ManageItems = () => {
    const [items, setItems] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentItemId, setCurrentItemId] = useState(null);
    const [formData, setFormData] = useState({ nama_item: '', harga: '' });

    // MODIFIKASI: State untuk Detail Item Katalog
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

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

    // MODIFIKASI: Fungsi membuka detail item
    const openDetailModal = (item) => {
        setSelectedItem(item);
        setShowDetailModal(true);
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

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
    const formatFullDateTime = (dateStr) => dateStr ? new Date(dateStr).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

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
                            <th width="10%">No</th>
                            <th width="50%">Nama Item / Layanan</th>
                            <th width="25%">Harga Default</th>
                            <th width="15%" style={{ textAlign: 'right' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length > 0 ? (
                            items.map((item, index) => (
                                <tr key={item.id_item_layanan}>
                                    <td className="mi-text-muted">{index + 1}</td>
                                    <td className="mi-text-main">{item.nama_item}</td>
                                    <td>{formatRupiah(item.harga)}</td>
                                    <td className="mi-action-cell">
                                        {/* MODIFIKASI: Tombol Detail (Mata) */}
                                        <button className="mi-btn-icon" onClick={() => openDetailModal(item)} title="Lihat Detail">
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        </button>
                                        <button className="mi-btn-icon" onClick={() => handleOpenModal(item)} title="Edit">
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                        </button>
                                        <button className="mi-btn-icon mi-btn-danger" onClick={() => handleDelete(item.id_item_layanan)} title="Hapus">
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="4" className="mi-text-center">Katalog master item masih kosong.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODIFIKASI: Modal Detail Item */}
            {showDetailModal && selectedItem && (
                <div className="mi-modal-overlay">
                    <div className="mi-modal-box" style={{ maxWidth: '440px' }}>
                        <div className="mi-modal-header">
                            <h3>Rincian Item Katalog</h3>
                            <button className="mi-btn-close" onClick={() => setShowDetailModal(false)}>&times;</button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>ID LAYANAN</label>
                                <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>#{selectedItem.id_item_layanan}</span>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>NAMA LAYANAN / ITEM</label>
                                <span style={{ fontSize: '15px', color: '#0f172a', fontWeight: '600' }}>{selectedItem.nama_item}</span>
                            </div>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '600', display: 'block', marginBottom: '4px' }}>HARGA ACUAN DEFAULT</label>
                                <span style={{ fontSize: '16px', color: '#2563eb', fontWeight: '700' }}>{formatRupiah(selectedItem.harga)}</span>
                            </div>
                            <div style={{ marginBottom: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', display: 'block', marginBottom: '2px' }}>DIBUAT PADA</label>
                                <span style={{ fontSize: '13px', color: '#475569' }}>{formatFullDateTime(selectedItem.created_at || selectedItem.createdAt)}</span>
                            </div>
                            <div>
                                <label style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', display: 'block', marginBottom: '2px' }}>PERUBAHAN TERAKHIR</label>
                                <span style={{ fontSize: '13px', color: '#475569' }}>{formatFullDateTime(selectedItem.updated_at || selectedItem.updatedAt)}</span>
                            </div>
                            <div className="mi-modal-actions" style={{ marginTop: '24px' }}>
                                <button type="button" className="mi-btn-primary" onClick={() => setShowDetailModal(false)}>Tutup</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Tambah/Edit Form ... */}
        </div>
    );
};

export default ManageItems;