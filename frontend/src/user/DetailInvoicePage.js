import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './userstyles/DetailInvoicePage.css'; // Kita buat file CSS khusus ini

const DetailInvoicePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    
    // State untuk Form Upload
    const [tanggalBayar, setTanggalBayar] = useState('');
    const [fileBukti, setFileBukti] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const fetchDetailInvoice = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const response = await fetch(`http://localhost:5000/api/invoices/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if(response.ok) {
                setInvoice(data);
            } else {
                alert("Invoice tidak ditemukan!");
                navigate('/invoice');
            }
        } catch (error) {
            console.error(error);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchDetailInvoice();
    }, [fetchDetailInvoice]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(file) {
            setFileBukti(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if(!fileBukti || !tanggalBayar) return alert("Lengkapi data pembayaran!");

        const token = localStorage.getItem('accessToken');
        const formData = new FormData();
        formData.append('id_invoice', id);
        formData.append('tanggal_bayar', tanggalBayar);
        formData.append('bukti_pembayaran', fileBukti);

        try {
            const response = await fetch('http://localhost:5000/api/payments', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if(response.ok) {
                alert("Bukti Pembayaran Berhasil Diupload!");
                fetchDetailInvoice();
            } else {
                alert("Gagal upload.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

    if(!invoice) return <div className="loading-state">Loading data invoice...</div>;

    return (
        <div className="invoice-page-bg">
            <Navbar />
            <div className="main-content-container">
                
                {/* Tombol Kembali */}
                <button onClick={() => navigate('/invoice')} className="btn-back">
                    &larr; Kembali
                </button>

                <div className="detail-layout">
                    
                    {/* BAGIAN KIRI: DETAIL INVOICE */}
                    <div className="detail-card left-panel">
                        <div className="invoice-header">
                            <h2 className="invoice-title">Invoice #{invoice.nomor_invoice}</h2>
                            <span className={`status-badge ${invoice.status.toLowerCase().replace(' ', '-')}`}>
                                {invoice.status}
                            </span>
                        </div>
                        
                        <table className="invoice-table">
                            <thead>
                                <tr>
                                    <th>Deskripsi</th>
                                    <th>Qty</th>
                                    <th>Harga</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>{item.deskripsi}</td>
                                        <td>{item.qty}</td>
                                        <td>{formatRupiah(item.harga)}</td>
                                        <td className="fw-bold">{formatRupiah(item.subtotal)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="text-right fw-bold pt-20">TOTAL TAGIHAN</td>
                                    <td className="total-amount">{formatRupiah(invoice.total)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* BAGIAN KANAN: FORM UPLOAD */}
                    <div className="detail-card right-panel">
                        <h3 className="panel-title">Konfirmasi Pembayaran</h3>
                        
                        {invoice.status === 'Belum Dibayar' ? (
                            <form onSubmit={handleUpload}>
                                <div className="form-group mb-15">
                                    <label className="input-label">Tanggal Bayar</label>
                                    <input 
                                        type="date" 
                                        className="form-input full-width"
                                        value={tanggalBayar} 
                                        onChange={(e) => setTanggalBayar(e.target.value)}
                                        required 
                                    />
                                </div>

                                <div className="form-group mb-20">
                                    <label className="input-label">Bukti Transfer</label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        required
                                        className="full-width"
                                    />
                                    {previewUrl && (
                                        <div className="preview-box">
                                            <img src={previewUrl} alt="Preview" />
                                        </div>
                                    )}
                                </div>

                                <button type="submit" className="btn-submit-payment">
                                    Kirim Bukti Pembayaran
                                </button>
                            </form>
                        ) : (
                            <div className="payment-status-message">
                                {invoice.status === 'Menunggu Verifikasi' && (
                                    <>
                                        <div className="status-icon">⏳</div>
                                        <p>Bukti pembayaran sedang diverifikasi oleh admin.</p>
                                    </>
                                )}
                                {invoice.status === 'Dibayar' && (
                                    <>
                                        <div className="status-icon">✅</div>
                                        <p>Pembayaran Lunas. Terima kasih!</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default DetailInvoicePage;