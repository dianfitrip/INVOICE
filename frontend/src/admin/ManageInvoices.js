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
    // PENAMBAHAN STATE CATATAN UNTUK FORM
    const [formData, setFormData] = useState({ id_user_admin: '', tanggal: '', catatan: '' });
    const [items, setItems] = useState([{ tipe: '', deskripsi: '', qty: 1, harga: 0, isCustom: false }]);

    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

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
            const response = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
            setInvoices(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                Swal.fire('Sesi Habis', 'Silakan login kembali', 'error');
            }
        }
    };

    const fetchUsersList = async () => {
        try {
            const token = localStorage.getItem('accessToken'); 
            const response = await axios.get(USER_API_URL, { headers: { Authorization: `Bearer ${token}` }});
            setUsersList(Array.isArray(response.data) ? response.data : []);
        } catch (error) {}
    };

    const fetchCatalogItems = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get(ITEM_API_URL, { headers: { Authorization: `Bearer ${token}` }});
            const formatted = res.data.map(item => ({ label: item.nama_item, price: item.harga, isCustom: false }));
            setPredefinedItems([{ label: "Pilih Item...", price: 0, isCustom: false }, ...formatted, { label: "Lainnya (Custom)", price: 0, isCustom: true }]);
        } catch (error) {}
    };

    if (userRole !== 'admin' && userRole !== 'superadmin') return <div className="unauthorized-message">Akses Ditolak.</div>; 

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const filteredInvoices = invoices.filter(inv => inv.nomor_invoice?.toLowerCase().includes(search.toLowerCase()));
    const currentInvoices = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

    const openDetailModal = (invoice) => { setSelectedInvoice(invoice); setShowDetailModal(true); };
    const openEditStatusModal = (invoice) => { setCurrentInvoiceId(invoice.id_invoice); setStatusData(invoice.status || 'Belum Dibayar'); setShowStatusModal(true); };

    const handleStatusSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        try {
            await axios.put(`${API_URL}/${currentInvoiceId}`, { status: statusData }, { headers: { Authorization: `Bearer ${token}` } });
            Swal.fire('Berhasil!', 'Status diperbarui.', 'success');
            setShowStatusModal(false);
            fetchInvoicesData(); 
        } catch (error) { Swal.fire('Gagal!', 'Gagal memperbarui status.', 'error'); }
    };

    const handleDelete = async (id) => {
        Swal.fire({ title: 'Hapus Invoice?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Ya, Hapus' })
        .then(async (result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('accessToken');
                try {
                    await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` }});
                    Swal.fire('Terhapus!', 'Invoice dihapus', 'success');
                    fetchInvoicesData(); 
                } catch (error) { Swal.fire('Gagal!', 'Gagal menghapus.', 'error'); }
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
        if (isInvalid || !formData.id_user_admin) return Swal.fire({ icon: 'warning', title: 'Data Tidak Lengkap', text: 'Periksa kembali formulir Anda.'});

        const token = localStorage.getItem('accessToken');
        try {
            await axios.post(API_URL, {
                id_user_admin: formData.id_user_admin,
                tanggal_invoice: formData.tanggal,
                catatan: formData.catatan, // KIRIM CATATAN
                items: items.map(i => ({ deskripsi: i.deskripsi, qty: i.qty, harga: i.harga }))
            }, { headers: { Authorization: `Bearer ${token}` }});

            Swal.fire('Berhasil!', 'Invoice diterbitkan.', 'success');
            setShowCreateModal(false);
            fetchInvoicesData();
            setFormData({ id_user_admin: '', tanggal: '', catatan: '' }); // RESET CATATAN
            setItems([{ tipe: '', deskripsi: '', qty: 1, harga: 0, isCustom: false }]);
        } catch (error) { Swal.fire('Gagal', 'Terjadi kesalahan sistem', 'error'); }
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
                <div className="mi-header-title"><h2>Kelola Invoice</h2><p>Pantau transaksi dan tagihan.</p></div>
                <button className="mi-btn-primary" onClick={() => setShowCreateModal(true)}>+ Terbitkan Invoice</button>
            </div>

            <div className="mi-toolbar">
                <div className="mi-search-wrapper">
                    <input type="text" placeholder="Cari nomor invoice..." value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="mi-search-input" />
                </div>
            </div>

            <div className="mi-table-container">
                <table className="mi-table">
                    <thead>
                        <tr>
                            <th width="5%">No</th><th width="20%">No. Invoice</th><th width="20%">Tujuan User</th>
                            <th width="15%">Tanggal</th><th width="15%">Total</th><th width="15%">Status</th><th width="10%" style={{ textAlign: 'right' }}>Aksi</th>
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
                                        <button className="mi-btn-icon" onClick={() => openDetailModal(inv)} title="Lihat Detail">Tampil</button>
                                        <button className="mi-btn-icon" onClick={() => openEditStatusModal(inv)} title="Update Status">Edit</button>
                                        {userRole === 'superadmin' && <button className="mi-btn-icon mi-btn-danger" onClick={() => handleDelete(inv.id_invoice)} title="Hapus">Hapus</button>}
                                    </td>
                                </tr>
                            ))
                        ) : (<tr><td colSpan="7" className="mi-text-center">Tidak ada data invoice.</td></tr>)}
                    </tbody>
                </table>
            </div>

            {/* MODAL LIHAT DETAIL INVOICE */}
            {showDetailModal && selectedInvoice && (
                <div className="mi-modal-overlay">
                    <div className="mi-modal-box" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="mi-modal-header" style={{ position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
                            <h3>Rincian Lengkap Invoice</h3><button className="mi-btn-close" onClick={() => setShowDetailModal(false)}>&times;</button>
                        </div>
                        <div style={{ padding: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px' }}>
                                <div><p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>NOMOR INVOICE</p><p style={{ margin: 0, fontWeight: '600', color: '#0f172a' }}>{selectedInvoice.nomor_invoice}</p></div>
                                <div><p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>STATUS</p><span className={`mi-badge ${getStatusBadgeClass(selectedInvoice.status)}`}>{selectedInvoice.status || 'Belum Dibayar'}</span></div>
                                <div><p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>NAMA PENGGUNA</p><p style={{ margin: 0, color: '#334155' }}>{selectedInvoice.User?.nama || '-'}</p></div>
                                <div><p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b', fontWeight: '600' }}>TANGGAL TERBIT</p><p style={{ margin: 0, color: '#334155' }}>{formatDate(selectedInvoice.tanggal_invoice || selectedInvoice.created_at)}</p></div>
                            </div>

                            {/* TAMPILKAN CATATAN DI SINI */}
                            {selectedInvoice.catatan && (
                                <div style={{ marginBottom: '24px', padding: '12px 16px', backgroundColor: '#fef3c7', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                                    <strong style={{ fontSize: '13px', color: '#b45309' }}>Catatan Tambahan:</strong>
                                    <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#92400e', whiteSpace: 'pre-wrap' }}>{selectedInvoice.catatan}</p>
                                </div>
                            )}

                            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0f172a' }}>Daftar Item Tagihan</h4>
                            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '24px' }}>
                                <table width="100%" style={{ borderCollapse: 'collapse', fontSize: '14px' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                            <th style={{ padding: '12px', color: '#64748b' }}>Deskripsi</th><th style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>Qty</th>
                                            <th style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>Harga Satuan</th><th style={{ padding: '12px', textAlign: 'right', color: '#64748b' }}>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                                            selectedInvoice.items.map((item, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                    <td style={{ padding: '12px' }}>{item.deskripsi}</td><td style={{ padding: '12px', textAlign: 'center' }}>{item.qty}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right' }}>{formatRupiah(item.harga)}</td><td style={{ padding: '12px', textAlign: 'right', fontWeight: '500' }}>{formatRupiah(item.subtotal)}</td>
                                                </tr>
                                            ))
                                        ) : (<tr><td colSpan="4" style={{ padding: '12px', textAlign: 'center' }}>Kosong</td></tr>)}
                                        <tr style={{ backgroundColor: '#f8fafc', fontWeight: '700' }}><td colSpan="3" style={{ padding: '12px', textAlign: 'right' }}>TOTAL AKHIR:</td><td style={{ padding: '12px', textAlign: 'right', color: '#2563eb' }}>{formatRupiah(selectedInvoice.total)}</td></tr>
                                    </tbody>
                                </table>
                            </div>

                            {selectedInvoice.bukti_pembayaran ? (
                                <div>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0f172a' }}>Bukti Pembayaran</h4>
                                    <div style={{ border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', backgroundColor: '#f8fafc', textAlign: 'center' }}>
                                        <a href={`http://localhost:5000/uploads/${selectedInvoice.bukti_pembayaran}`} target="_blank" rel="noreferrer">
                                            <img src={`http://localhost:5000/uploads/${selectedInvoice.bukti_pembayaran}`} alt="Bukti" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '4px', objectFit: 'contain' }} />
                                        </a>
                                    </div>
                                </div>
                            ) : (<div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '13px', textAlign: 'center' }}>Belum ada bukti pembayaran.</div>)}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL TAMBAH INVOICE */}
            {showCreateModal && (
                <div className="mi-modal-overlay">
                    <div className="mi-modal-box" style={{ maxWidth: '600px' }}>
                        <div className="mi-modal-header"><h3>Terbitkan Invoice Baru</h3><button className="mi-btn-close" onClick={() => setShowCreateModal(false)}>&times;</button></div>
                        <form onSubmit={handleCreateSubmit} className="mi-form">
                            <div className="mi-form-group">
                                <label>Pilih User Tujuan</label>
                                <select value={formData.id_user_admin} onChange={(e) => setFormData({...formData, id_user_admin: e.target.value})} required>
                                    <option value="">Pilih Pengguna...</option>{usersList.map(u => <option key={u.id_user} value={u.id_user}>{u.nama} ({u.email})</option>)}
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
                                            {items.length > 1 && <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))} style={{ padding: '8px', color: '#ef4444', border: 'none', background: 'none' }}>✖</button>}
                                        </div>
                                        {item.isCustom && <input type="text" placeholder="Deskripsi Custom" value={item.deskripsi} onChange={(e) => handleItemTextChange(index, 'deskripsi', e.target.value)} style={{ width: '100%', marginBottom: '8px' }} required />}
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input type="number" placeholder="Qty" min="1" value={item.qty} onChange={(e) => handleItemTextChange(index, 'qty', e.target.value)} required />
                                            <input type="number" placeholder="Harga" min="0" value={item.harga} onChange={(e) => handleItemTextChange(index, 'harga', e.target.value)} disabled={!item.isCustom} required />
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setItems([...items, { tipe: '', deskripsi: '', qty: 1, harga: 0, isCustom: false }])} style={{ padding: '8px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>+ Tambah Item</button>
                            </div>

                            {/* TEXTAREA CATATAN BARU */}
                            <div className="mi-form-group">
                                <label>Catatan (Opsional)</label>
                                <textarea 
                                    value={formData.catatan} 
                                    onChange={(e) => setFormData({...formData, catatan: e.target.value})} 
                                    rows="3" 
                                    style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                                    placeholder="Tambahkan catatan khusus untuk invoice ini..."
                                ></textarea>
                            </div>

                            <div className="mi-modal-actions">
                                <button type="button" className="mi-btn-outline" onClick={() => setShowCreateModal(false)}>Batal</button>
                                <button type="submit" className="mi-btn-primary">Terbitkan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Update Status ... (Tetap sama, saya persingkat agar muat) */}
            {showStatusModal && (
                <div className="mi-modal-overlay">
                    <div className="mi-modal-box">
                        <div className="mi-modal-header"><h3>Update Status</h3><button className="mi-btn-close" onClick={() => setShowStatusModal(false)}>&times;</button></div>
                        <form onSubmit={handleStatusSubmit} className="mi-form">
                            <div className="mi-form-group">
                                <label>Pilih Status Terbaru</label>
                                <select value={statusData} onChange={(e) => setStatusData(e.target.value)}>
                                    <option value="Belum Dibayar">Belum Dibayar</option><option value="Menunggu Verifikasi">Menunggu Verifikasi</option><option value="Lunas">Lunas</option><option value="Dibatalkan">Dibatalkan</option>
                                </select>
                            </div>
                            <div className="mi-modal-actions"><button type="button" className="mi-btn-outline" onClick={() => setShowStatusModal(false)}>Batal</button><button type="submit" className="mi-btn-primary">Simpan</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default ManageInvoices;