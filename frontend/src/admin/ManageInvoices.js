import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './adminstyles/ManageInvoices.css';

const ManageInvoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [usersList, setUsersList] = useState([]); 
    const [predefinedItems, setPredefinedItems] = useState([]); 

    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [currentInvoiceId, setCurrentInvoiceId] = useState(null);
    const [statusData, setStatusData] = useState('Belum Dibayar');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [formData, setFormData] = useState({ id_user_admin: '', tanggal: '' });
    const [items, setItems] = useState([{ tipe: '', deskripsi: '', qty: 1, harga: 0, isCustom: false }]);

    const itemsPerPage = 15;
    const userRole = localStorage.getItem('role'); 
    const API_URL = 'http://localhost:5000/api/invoices'; 
    const USER_API_URL = 'http://localhost:5000/api/users'; 
    const ITEM_API_URL = 'http://localhost:5000/api/items'; 

    useEffect(() => {
        if (userRole === 'admin' || userRole === 'superadmin') {
            fetchInvoicesData();
            fetchUsersList(); 
            fetchCatalogItems(); 
        }
    }, [search, userRole]);

    const fetchInvoicesData = async () => {
        try {
            const token = localStorage.getItem('accessToken'); 
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInvoices(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Gagal memuat data invoice:", error);
        }
    };

    const fetchUsersList = async () => {
        try {
            const token = localStorage.getItem('accessToken'); 
            const response = await axios.get(USER_API_URL, { headers: { Authorization: `Bearer ${token}` }});
            setUsersList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Gagal memuat daftar pengguna");
        }
    };

    const fetchCatalogItems = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get(ITEM_API_URL, { headers: { Authorization: `Bearer ${token}` }});
            const formatted = res.data.map(item => ({
                label: item.nama_item,
                price: item.harga,
                isCustom: false
            }));
            setPredefinedItems([
                { label: "Pilih Item...", price: 0, isCustom: false },
                ...formatted,
                { label: "Lainnya (Custom)", price: 0, isCustom: true }
            ]);
        } catch (error) {
            console.error("Gagal memuat katalog item", error);
        }
    };

    if (userRole !== 'admin' && userRole !== 'superadmin') {
        return <div className="unauthorized-message">Akses Ditolak.</div>; 
    }

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const filteredInvoices = invoices.filter(inv => 
        inv.nomor_invoice?.toLowerCase().includes(search.toLowerCase())
    );
    const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

    const openEditStatusModal = (invoice) => {
        setCurrentInvoiceId(invoice.id_invoice); 
        setStatusData(invoice.status || 'Belum Dibayar');
        setShowStatusModal(true);
    };

    const handleStatusSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        try {
            await axios.put(`${API_URL}/${currentInvoiceId}`, { status: statusData }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Swal.fire('Berhasil!', 'Status invoice diperbarui.', 'success');
            setShowStatusModal(false);
            fetchInvoicesData(); 
        } catch (error) {
            Swal.fire('Gagal!', 'Gagal memperbarui status.', 'error');
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: 'Hapus Invoice?',
            text: "Data tidak dapat dikembalikan.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Ya, Hapus'
        }).then(async (result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('accessToken');
                try {
                    await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` }});
                    Swal.fire('Terhapus!', 'Invoice berhasil dihapus', 'success');
                    fetchInvoicesData(); 
                } catch (error) {
                    Swal.fire('Gagal!', 'Gagal menghapus.', 'error');
                }
            }
        });
    };

    const handleItemSelectChange = (index, selectedLabel) => {
        const selectedObj = predefinedItems.find(item => item.label === selectedLabel);
        const newItems = [...items];
        newItems[index].tipe = selectedLabel;
        newItems[index].isCustom = selectedObj?.isCustom || false;
        
        if (!newItems[index].isCustom) {
            newItems[index].deskripsi = selectedLabel === "Pilih Item..." ? '' : selectedLabel;
            newItems[index].harga = selectedObj?.price || 0;
        } else {
            newItems[index].deskripsi = '';
            newItems[index].harga = 0;
        }
        setItems(newItems);
    };

    const handleItemTextChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        const isInvalid = items.some(item => !item.deskripsi || item.harga <= 0 || item.qty <= 0);
        if (isInvalid || !formData.id_user_admin) {
            return Swal.fire({ icon: 'warning', title: 'Data Tidak Lengkap', text: 'Periksa kembali formulir Anda.'});
        }

        const token = localStorage.getItem('accessToken');
        try {
            await axios.post(API_URL, {
                id_user_admin: formData.id_user_admin,
                tanggal_invoice: formData.tanggal,
                items: items.map(i => ({ deskripsi: i.deskripsi, qty: i.qty, harga: i.harga }))
            }, { headers: { Authorization: `Bearer ${token}` }});

            Swal.fire('Berhasil!', 'Invoice baru berhasil diterbitkan.', 'success');
            setShowCreateModal(false);
            fetchInvoicesData();
            setFormData({ id_user_admin: '', tanggal: '' });
            setItems([{ tipe: '', deskripsi: '', qty: 1, harga: 0, isCustom: false }]);
        } catch (error) {
            Swal.fire('Gagal', 'Terjadi kesalahan sistem', 'error');
        }
    };

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
    
    const getStatusBadgeClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'lunas': return 'mi-badge-success';
            case 'menunggu verifikasi': return 'mi-badge-warning';
            case 'dibatalkan': return 'mi-badge-danger';
            default: return 'mi-badge-secondary'; 
        }
    };

    return (
        <div className="mi-container">
            <div className="mi-header">
                <div className="mi-header-title">
                    <h2>Kelola Invoice</h2>
                    <p>Pantau dan kelola seluruh transaksi dan status tagihan.</p>
                </div>
                <button className="mi-btn-primary" onClick={() => setShowCreateModal(true)}>+ Terbitkan Invoice</button>
            </div>

            <div className="mi-toolbar">
                <div className="mi-search-wrapper">
                    <svg className="mi-search-icon" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    <input 
                        type="text" 
                        placeholder="Cari nomor invoice..." 
                        value={search} 
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} 
                        className="mi-search-input"
                    />
                </div>
            </div>

            <div className="mi-table-container">
                <table className="mi-table">
                    <thead>
                        <tr>
                            <th width="5%">No</th>
                            <th width="20%">No. Invoice</th>
                            <th width="20%">Tujuan User</th>
                            <th width="15%">Tanggal</th>
                            <th width="15%">Total</th>
                            <th width="15%">Status</th>
                            <th width="10%" style={{ textAlign: 'right' }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentInvoices.length > 0 ? (
                            currentInvoices.map((inv, index) => (
                                <tr key={inv.id_invoice}>
                                    <td className="mi-text-muted">{indexOfFirstItem + index + 1}</td>
                                    <td className="mi-text-main" style={{ fontWeight: '600' }}>{inv.nomor_invoice}</td>
                                    <td className="mi-text-muted">{inv.User?.nama || `User ID: ${inv.id_user}`}</td>
                                    <td className="mi-text-muted">{formatDate(inv.tanggal_invoice || inv.created_at)}</td>
                                    <td className="mi-text-main">{formatRupiah(inv.total)}</td>
                                    <td><span className={`mi-badge ${getStatusBadgeClass(inv.status)}`}>{inv.status || 'Belum Dibayar'}</span></td>
                                    <td className="mi-action-cell">
                                        <button className="mi-btn-icon" onClick={() => openEditStatusModal(inv)} title="Update Status">
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                        </button>
                                        {userRole === 'superadmin' && (
                                            <button className="mi-btn-icon mi-btn-danger" onClick={() => handleDelete(inv.id_invoice)} title="Hapus Invoice">
                                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (<tr><td colSpan="7" className="mi-text-center">Tidak ada data invoice.</td></tr>)}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mi-pagination">
                    <button className="mi-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>Sebelumnya</button>
                    <span className="mi-page-info">Halaman {currentPage} dari {totalPages}</span>
                    <button className="mi-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>Selanjutnya</button>
                </div>
            )}
            
            {showCreateModal && (
                <div className="mi-modal-overlay">
                    <div className="mi-modal-box" style={{ maxWidth: '600px' }}>
                        <div className="mi-modal-header">
                            <h3>Terbitkan Invoice Baru</h3>
                            <button className="mi-btn-close" onClick={() => setShowCreateModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleCreateSubmit} className="mi-form">
                            <div className="mi-form-group">
                                <label>Pilih User Tujuan</label>
                                <select value={formData.id_user_admin} onChange={(e) => setFormData({...formData, id_user_admin: e.target.value})} required>
                                    <option value="">Pilih Pengguna...</option>
                                    {usersList.map(u => <option key={u.id_user} value={u.id_user}>{u.nama} ({u.email})</option>)}
                                </select>
                            </div>
                            <div className="mi-form-group">
                                <label>Tanggal Invoice</label>
                                <input type="date" value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} required />
                            </div>

                            <div className="mi-form-group">
                                <label>Daftar Tagihan</label>
                                {items.map((item, index) => (
                                    <div key={index} style={{ padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <select style={{ flex: 1 }} value={item.tipe} onChange={(e) => handleItemSelectChange(index, e.target.value)} required>
                                                {predefinedItems.map((opts, i) => <option key={i} value={opts.label}>{opts.label}</option>)}
                                            </select>
                                            {items.length > 1 && <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))} style={{ padding: '8px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>✖</button>}
                                        </div>
                                        {item.isCustom && <input type="text" placeholder="Deskripsi Item Custom" value={item.deskripsi} onChange={(e) => handleItemTextChange(index, 'deskripsi', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} required />}
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input type="number" placeholder="Qty" min="1" value={item.qty} onChange={(e) => handleItemTextChange(index, 'qty', e.target.value)} required />
                                            <input type="number" placeholder="Harga" min="0" value={item.harga} onChange={(e) => handleItemTextChange(index, 'harga', e.target.value)} disabled={!item.isCustom} required />
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setItems([...items, { tipe: '', deskripsi: '', qty: 1, harga: 0, isCustom: false }])} style={{ padding: '8px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', color: '#0f172a' }}>+ Tambah Item</button>
                            </div>

                            <div className="mi-modal-actions">
                                <button type="button" className="mi-btn-outline" onClick={() => setShowCreateModal(false)}>Batal</button>
                                <button type="submit" className="mi-btn-primary">Terbitkan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showStatusModal && (
                <div className="mi-modal-overlay">
                    <div className="mi-modal-box">
                        <div className="mi-modal-header">
                            <h3>Update Status Invoice</h3>
                            <button className="mi-btn-close" onClick={() => setShowStatusModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleStatusSubmit} className="mi-form">
                            <div className="mi-form-group">
                                <label>Pilih Status Terbaru</label>
                                <select value={statusData} onChange={(e) => setStatusData(e.target.value)}>
                                    <option value="Belum Dibayar">Belum Dibayar</option>
                                    <option value="Menunggu Verifikasi">Menunggu Verifikasi</option>
                                    <option value="Lunas">Lunas</option>
                                    <option value="Dibatalkan">Dibatalkan</option>
                                </select>
                            </div>
                            <div className="mi-modal-actions">
                                <button type="button" className="mi-btn-outline" onClick={() => setShowStatusModal(false)}>Batal</button>
                                <button type="submit" className="mi-btn-primary">Simpan Status</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageInvoices;