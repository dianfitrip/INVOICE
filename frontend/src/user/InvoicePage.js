import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; // Import SweetAlert2
import './userstyles/InvoicePage.css';

const InvoicePage = () => {
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    
    // State untuk Form Tambah Invoice
    const [tanggal, setTanggal] = useState('');
    const [items, setItems] = useState([
        { deskripsi: '', qty: 1, harga: 0 }
    ]);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        const token = localStorage.getItem('accessToken');
        if(!token) return navigate('/login');

        try {
            const response = await fetch('http://localhost:5000/api/invoices', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if(response.ok) {
                setInvoices(data);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal memuat data invoice', 'error');
        }
    };

    const handleAddItem = () => {
        setItems([...items, { deskripsi: '', qty: 1, harga: 0 }]);
    };

    const handleItemChange = (index, field, value) => {
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

        // --- 1. VALIDASI INPUT (Cek Harga & Qty) ---
        const isInvalidItem = items.some(item => item.harga <= 0 || item.qty <= 0);
        if (isInvalidItem) {
            return Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: 'Pastikan Harga dan Qty lebih dari 0.',
                confirmButtonColor: '#F7941E'
            });
        }

        // --- 2. KONFIRMASI SIMPAN ---
        const result = await Swal.fire({
            title: 'Buat Invoice Baru?',
            text: "Pastikan data tanggal dan item sudah benar.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#F7941E',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Simpan',
            cancelButtonText: 'Batal'
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
                    items: items
                })
            });

            if(response.ok) {
                // --- 3. ALERT SUKSES ---
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Invoice berhasil dibuat.',
                    timer: 1500,
                    showConfirmButton: false
                });

                setShowModal(false);
                fetchInvoices();
                // Reset Form
                setTanggal('');
                setItems([{ deskripsi: '', qty: 1, harga: 0 }]);
            } else {
                // --- 4. ALERT GAGAL ---
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: 'Terjadi kesalahan saat menyimpan invoice.',
                    confirmButtonColor: '#d33'
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal terhubung ke server', 'error');
        }
    };

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
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
                                            <span className={`status-badge ${inv.status.toLowerCase().replace(' ', '-')}`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-small-outline"
                                                onClick={() => navigate(`/invoice/${inv.id_invoice}`)}
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    {/* Style dipindahkan ke CSS .empty-data-row */}
                                    <td colSpan="5" className="empty-data-row">
                                        Belum ada invoice. Silakan buat baru.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL BUAT INVOICE */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Buat Invoice Baru</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Tanggal Invoice</label>
                                <input 
                                    type="date" 
                                    className="form-input" 
                                    value={tanggal}
                                    onChange={(e) => setTanggal(e.target.value)}
                                    required 
                                />
                            </div>

                            <div className="items-section">
                                {/* Style dipindahkan ke CSS .label-block */}
                                <label className="label-block">Item Tagihan</label>
                                
                                {items.map((item, index) => (
                                    <div key={index} className="item-row">
                                        <input 
                                            type="text" 
                                            placeholder="Deskripsi"
                                            // Style flex dipindahkan ke CSS .input-desc
                                            className="form-input input-desc"
                                            value={item.deskripsi}
                                            onChange={(e) => handleItemChange(index, 'deskripsi', e.target.value)}
                                            required
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Qty"
                                            // Style flex dipindahkan ke CSS .input-qty
                                            className="form-input input-qty"
                                            min="1"
                                            value={item.qty}
                                            onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                                            required
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Harga"
                                            // Style flex dipindahkan ke CSS .input-price
                                            className="form-input input-price"
                                            min="0"
                                            value={item.harga}
                                            onChange={(e) => handleItemChange(index, 'harga', e.target.value)}
                                            required
                                        />
                                        {items.length > 1 && (
                                            <button type="button" className="btn-remove" onClick={() => handleRemoveItem(index)} title="Hapus Item">×</button>
                                        )}
                                    </div>
                                ))}
                                <button type="button" className="btn-add-item" onClick={handleAddItem}>+ Tambah Item</button>
                            </div>

                            <button type="submit" className="btn-submit-modal">Simpan Invoice</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoicePage;