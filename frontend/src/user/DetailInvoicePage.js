import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Swal from 'sweetalert2'; // Import SweetAlert2
import './userstyles/DetailInvoicePage.css'; 

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
                Swal.fire('Tidak Ditemukan', 'Data invoice tidak ditemukan', 'error')
                    .then(() => navigate('/invoice'));
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal memuat data invoice', 'error');
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchDetailInvoice();
    }, [fetchDetailInvoice]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if(file) {
            // Validasi Ukuran File (Misal maks 2MB)
            if (file.size > 2 * 1024 * 1024) {
                return Swal.fire('File Terlalu Besar', 'Maksimal ukuran file adalah 2MB', 'warning');
            }
            setFileBukti(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleRemoveFile = () => {
        setFileBukti(null);
        setPreviewUrl('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        // --- 1. VALIDASI INPUT ---
        if(!fileBukti || !tanggalBayar) {
            return Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: 'Mohon isi Tanggal Bayar dan upload Bukti Transfer.',
                confirmButtonColor: '#F7941E'
            });
        }

        // --- 2. KONFIRMASI UPLOAD ---
        const result = await Swal.fire({
            title: 'Kirim Bukti Pembayaran?',
            text: "Pastikan foto bukti transfer terlihat jelas.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#F7941E',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Ya, Kirim',
            cancelButtonText: 'Batal'
        });

        if (!result.isConfirmed) return;

        const token = localStorage.getItem('accessToken');
        const formData = new FormData();
        formData.append('id_invoice', id);
        formData.append('tanggal_bayar', tanggalBayar);
        formData.append('bukti_pembayaran', fileBukti);

        // Loading State
        Swal.fire({
            title: 'Sedang Mengirim...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await fetch('http://localhost:5000/api/payments', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if(response.ok) {
                // --- 3. ALERT SUKSES ---
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Bukti pembayaran telah dikirim.',
                    timer: 1500,
                    showConfirmButton: false
                });
                
                // Refresh data untuk melihat status terbaru
                fetchDetailInvoice();
                
                // Reset Form (Opsional, karena status invoice berubah form akan hilang)
                setTanggalBayar('');
                handleRemoveFile();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal',
                    text: 'Terjadi kesalahan saat upload bukti.',
                    confirmButtonColor: '#d33'
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Gagal terhubung ke server', 'error');
        }
    };

    const formatRupiah = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

    if(!invoice) return <div className="loading-state">Loading data invoice...</div>;

    return (
        <div className="invoice-page-bg">
            <Navbar />
            <div className="main-content-container">
                
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
                                    
                                    <p className="input-helper">
                                        Silakan upload <b>screenshot m-banking</b> atau <b>foto struk</b> bukti pembayaran Anda. (Format: JPG/PNG, Maks 2MB)
                                    </p>

                                    {!fileBukti ? (
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            required
                                            className="full-width"
                                        />
                                    ) : (
                                        <div className="preview-wrapper">
                                            <div className="preview-box">
                                                <img src={previewUrl} alt="Preview" />
                                            </div>
                                            <button 
                                                type="button" 
                                                className="btn-remove-file"
                                                onClick={handleRemoveFile}
                                            >
                                                Hapus Foto &times;
                                            </button>
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