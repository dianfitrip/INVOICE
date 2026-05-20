import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';
import Navbar from '../components/Navbar';
import './userstyles/DetailInvoicePage.css';

const DetailInvoicePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // State untuk kelola pembayaran
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState('');
    const [fileBukti, setFileBukti] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    
    const documentRef = useRef(null);
    const UPLOADS_URL = 'http://localhost:5000/uploads';

    useEffect(() => { 
        fetchInvoiceDetail(); 
        fetchPaymentMethods();
    }, [id]);

    const fetchInvoiceDetail = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const response = await fetch(`http://localhost:5000/api/invoices/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setInvoice(data);
            else navigate('/invoice');
        } catch (error) { 
            Swal.fire('Error', 'Gagal memuat data', 'error'); 
        } finally { 
            setLoading(false); 
        }
    };

    const fetchPaymentMethods = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const response = await fetch('http://localhost:5000/api/payment-methods', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setPaymentMethods(data);
        } catch (error) {
            console.error('Gagal memuat metode pembayaran');
        }
    };

    const handleUploadBukti = async (e) => {
        e.preventDefault();
        if (!selectedMethod) {
            return Swal.fire('Perhatian', 'Pilih metode pembayaran terlebih dahulu.', 'warning');
        }
        
        const formData = new FormData();
        formData.append('bukti', fileBukti);
        setIsUploading(true);
        
        try {
            const response = await fetch(`http://localhost:5000/api/invoices/${id}/upload-bukti`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
                body: formData 
            });
            if (response.ok) { 
                Swal.fire('Berhasil!', 'Bukti terunggah.', 'success'); 
                fetchInvoiceDetail(); 
            } else {
                Swal.fire('Error', 'Gagal mengunggah bukti', 'error');
            }
        } catch (error) { 
            Swal.fire('Error', 'Kesalahan jaringan', 'error'); 
        } finally { 
            setIsUploading(false); 
        }
    };

    const handleDownloadPDF = () => {
        html2pdf().set({
            margin: 10, filename: `Invoice-${invoice.nomor_invoice}.pdf`,
            html2canvas: { scale: 2 }, jsPDF: { format: 'a4', orientation: 'portrait' }
        }).from(documentRef.current).save();
    };

    if (loading) return <div>Memuat...</div>;

    // Mendapatkan objek detail dari metode pembayaran yang dipilih
    const activeMethodDetails = paymentMethods.find(m => m.id_rekening.toString() === selectedMethod);
    
    return (
        <div className="dip-background">
            <Navbar />
            <div className="dip-main-container">
                <div className="dip-toolbar">
                    <button className="dip-btn-back" onClick={() => navigate('/invoice')}>&larr; Kembali</button>
                    <button className="dip-btn-primary" onClick={handleDownloadPDF}>Unduh PDF</button>
                </div>

                {invoice.status === 'Belum Dibayar' && (
                    <div className="dip-bukti-box" style={{ padding: '24px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.125rem' }}>Instruksi Pembayaran</h3>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Pilih Metode Pembayaran</label>
                            <select 
                                className="dip-select-input" 
                                value={selectedMethod} 
                                onChange={(e) => setSelectedMethod(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0' }}
                            >
                                <option value="">-- Pilih Rekening / E-Wallet --</option>
                                {paymentMethods.map(method => (
                                    <option key={method.id_rekening} value={method.id_rekening}>
                                        {method.nama_bank}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {activeMethodDetails && (
                            <div style={{ padding: '16px', backgroundColor: '#f7fafc', borderRadius: '8px', marginBottom: '20px' }}>
                                <p style={{ margin: '0 0 8px 0' }}><strong>Bank / Layanan:</strong> {activeMethodDetails.nama_bank}</p>
                                <p style={{ margin: '0 0 8px 0' }}><strong>Nomor Rekening:</strong> {activeMethodDetails.nomor_rekening}</p>
                                <p style={{ margin: '0 0 16px 0' }}><strong>Atas Nama:</strong> {activeMethodDetails.atas_nama}</p>
                                
                                {activeMethodDetails.gambar && (
                                    <div style={{ marginTop: '12px' }}>
                                        <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>Scan QRIS / Foto Info:</p>
                                        <img src={`${UPLOADS_URL}/${activeMethodDetails.gambar}`} alt="QRIS" style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedMethod && (
                            <form onSubmit={handleUploadBukti} className="dip-form-bukti">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Unggah Bukti Transfer</label>
                                <input type="file" required onChange={(e) => setFileBukti(e.target.files[0])} style={{ marginBottom: '12px' }} />
                                <button type="submit" disabled={isUploading} className="dip-btn-primary">
                                    {isUploading ? 'Mengunggah...' : 'Kirim Bukti'}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                <div className="dip-document-paper" ref={documentRef}>
                    <div className="dip-info-grid">
                        <div className="dip-info-item"><p>NO INVOICE</p><strong>{invoice.nomor_invoice}</strong></div>
                        <div className="dip-info-item"><p>STATUS</p><strong>{invoice.status}</strong></div>
                    </div>

                    {invoice.catatan && (
                        <div className="dip-catatan-box">
                            <strong className="dip-catatan-label">CATATAN TAMBAHAN:</strong>
                            <p className="dip-catatan-text">{invoice.catatan}</p>
                        </div>
                    )}
                    
                    {/* Render tabel item seperti biasa di sini */}
                </div>
            </div>
        </div>
    );
};
export default DetailInvoicePage;