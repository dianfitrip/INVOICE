import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
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
                alert("Invoice Berhasil Dibuat!");
                setShowModal(false);
                fetchInvoices();
                // Reset Form
                setTanggal('');
                setItems([{ deskripsi: '', qty: 1, harga: 0 }]);
            } else {
                alert("Gagal membuat invoice");
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Helper format Rupiah
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
                                            <button className="btn-small-outline">Detail</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{textAlign: 'center', padding: '30px'}}>
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
                                <label>Item Tagihan</label>
                                {items.map((item, index) => (
                                    <div key={index} className="item-row">
                                        <input 
                                            type="text" 
                                            placeholder="Deskripsi"
                                            className="form-input"
                                            value={item.deskripsi}
                                            onChange={(e) => handleItemChange(index, 'deskripsi', e.target.value)}
                                            required
                                            style={{flex: 2}}
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Qty"
                                            className="form-input"
                                            value={item.qty}
                                            onChange={(e) => handleItemChange(index, 'qty', e.target.value)}
                                            required
                                            style={{flex: 0.5}}
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Harga"
                                            className="form-input"
                                            value={item.harga}
                                            onChange={(e) => handleItemChange(index, 'harga', e.target.value)}
                                            required
                                            style={{flex: 1}}
                                        />
                                        {items.length > 1 && (
                                            <button type="button" className="btn-remove" onClick={() => handleRemoveItem(index)}>×</button>
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