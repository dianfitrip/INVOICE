import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 
import './userstyles/InvoicePage.css';

const InvoicePage = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [predefinedItems, setPredefinedItems] = useState([]); 
    const [showModal, setShowModal] = useState(false);
    
    const [tanggal, setTanggal] = useState('');
    const [items, setItems] = useState([
        { tipe: '', deskripsi: '', qty: 1, harga: 0, isCustom: false }
    ]);

    useEffect(() => {
        fetchInvoices();
        fetchCatalogItems();
    }, []);

    const fetchInvoices = async () => {
        const token = localStorage.getItem('accessToken');
        if(!token) return navigate('/login');

        try {
            const response = await fetch('http://localhost:5000/api/invoices/my-invoices', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if(response.ok) {
                setInvoices(data);
            }
        } catch (error) {
            Swal.fire('Error', 'Gagal memuat data invoice', 'error');
        }
    };

    const fetchCatalogItems = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5000/api/items', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if(response.ok) {
                const formattedItems = data.map(item => ({
                    label: item.nama_item,
                    price: item.harga,
                    isCustom: false
                }));
                
                setPredefinedItems([
                    { label: "Pilih Item...", price: 0, isCustom: false },
                    ...formattedItems,
                    { label: "Lainnya (Custom)", price: 0, isCustom: true }
                ]);
            }
        } catch (error) {
            console.error("Gagal memuat katalog", error);
        }
    };

    const handleAddItem = () => {
        setItems([...items, { tipe: '', deskripsi: '', qty: 1, harga: 0, isCustom: false }]);
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

    const handleRemoveItem = (index) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isInvalidItem = items.some(item => !item.deskripsi || item.harga <= 0 || item.qty <= 0);
        if (isInvalidItem) {
            return Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: 'Pastikan item telah dipilih/diisi beserta harga dan kuantitasnya.',
                confirmButtonColor: '#0f172a'
            });
        }

        const result = await Swal.fire({
            title: 'Buat Invoice Baru?',
            text: "Pastikan data tagihan sudah benar.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0f172a',
            confirmButtonText: 'Ya, Simpan'
        });

        if (!result.isConfirmed) return;

        const token = localStorage.getItem('accessToken');
        try {
            const response = await fetch('http://localhost:5000/api/invoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    tanggal_invoice: tanggal,
                    items: items.map(i => ({ deskripsi: i.deskripsi, qty: i.qty, harga: i.harga }))
                })
            });

            if(response.ok) {
                Swal.fire('Berhasil!', 'Invoice berhasil dibuat.', 'success');
                setShowModal(false);
                fetchInvoices();
                setTanggal('');
                setItems([{ tipe: '', deskripsi: '', qty: 1, harga: 0, isCustom: false }]);
            } else {
                Swal.fire('Gagal', 'Terjadi kesalahan saat menyimpan invoice.', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Gagal terhubung ke server', 'error');
        }
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number || 0);
    };

    return (
        <div className="invoice-page-bg">
            <Navbar />
            <div className="main-content-container">
                <div className="page-header">
                    <h2>Daftar Invoice</h2>
                    <button className="btn-action-primary" onClick={() => setShowModal(true)}>
                        + Buat Invoice Baru
                    </button>
                </div>

                <div className="invoice-table-container">
                    <table className="invoice-table">
                        <thead>
                            <tr>
                                <th>No. Invoice</th>
                                <th>Tanggal</th>
                                <th>Total Tagihan</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length > 0 ? (
                                invoices.map((inv) => (
                                    <tr key={inv.id_invoice}>
                                        <td className="fw-bold">{inv.nomor_invoice}</td>
                                        <td>{inv.tanggal_invoice}</td>
                                        <td className="text-orange fw-bold">{formatRupiah(inv.total)}</td>
                                        <td>
                                            <span className={`status-badge ${inv.status?.toLowerCase().replace(' ', '-')}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-small-outline" onClick={() => navigate(`/invoice/${inv.id_invoice}`)}>Detail</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="empty-data-row">Belum ada invoice. Silakan buat baru.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3>Buat Invoice Baru</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tanggal Invoice</label>
                                <input type="date" className="form-input" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
                            </div>

                            <div className="items-section">
                                <label className="label-block">Item Tagihan</label>
                                {items.map((item, index) => (
                                    <div key={index} style={{ marginBottom: '16px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <select className="form-input" style={{ flex: 1 }} value={item.tipe} onChange={(e) => handleItemSelectChange(index, e.target.value)} required>
                                                {predefinedItems.map((opts, i) => (
                                                    <option key={i} value={opts.label}>{opts.label}</option>
                                                ))}
                                            </select>
                                            {items.length > 1 && (
                                                <button type="button" className="btn-remove" onClick={() => handleRemoveItem(index)}>×</button>
                                            )}
                                        </div>

                                        {item.isCustom && (
                                            <input type="text" className="form-input" style={{ marginBottom: '8px', width: '100%', boxSizing: 'border-box' }} placeholder="Deskripsi Item Custom" value={item.deskripsi} onChange={(e) => handleItemTextChange(index, 'deskripsi', e.target.value)} required />
                                        )}

                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input type="number" className="form-input input-qty" placeholder="Qty" min="1" value={item.qty} onChange={(e) => handleItemTextChange(index, 'qty', e.target.value)} required />
                                            <input type="number" className="form-input input-price" placeholder="Harga" min="0" value={item.harga} onChange={(e) => handleItemTextChange(index, 'harga', e.target.value)} disabled={!item.isCustom} required />
                                        </div>
                                    </div>
                                ))}
                                <button type="button" className="btn-add-item" onClick={handleAddItem}>+ Tambah Item</button>
                            </div>
                            <button type="submit" className="btn-submit-modal" style={{ marginTop: '20px', width: '100%' }}>Simpan Invoice</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoicePage;