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
    
    const [fileBukti, setFileBukti] = useState(null); // State untuk file bukti
    const [isUploading, setIsUploading] = useState(false);

    const documentRef = useRef(null);

    useEffect(() => {
        fetchInvoiceDetail();
    }, [id]);

    const fetchInvoiceDetail = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return navigate('/login');

        try {
            const response = await fetch(`http://localhost:5000/api/invoices/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (response.ok) {
                setInvoice(data);
            } else {
                Swal.fire('Error', 'Invoice tidak ditemukan', 'error');
                navigate('/invoice');
            }
        } catch (error) {
            Swal.fire('Error', 'Gagal memuat detail invoice', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Fungsi Submit Bukti Pembayaran
    const handleUploadBukti = async (e) => {
        e.preventDefault();
        if (!fileBukti) return Swal.fire('Peringatan', 'Silakan pilih file gambar bukti transfer terlebih dahulu.', 'warning');

        const formData = new FormData();
        formData.append('bukti', fileBukti);

        const token = localStorage.getItem('accessToken');
        setIsUploading(true);

        try {
            const response = await fetch(`http://localhost:5000/api/invoices/${id}/upload-bukti`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData // Jangan set Content-Type, biarkan browser yang atur boundary multipartnya otomatis
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire('Berhasil!', 'Bukti pembayaran berhasil diunggah. Menunggu verifikasi admin.', 'success');
                fetchInvoiceDetail(); // Refresh data untuk mengubah UI ke 'Menunggu Verifikasi'
            } else {
                Swal.fire('Gagal', data.msg || 'Gagal mengunggah bukti', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Koneksi server terputus', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownloadPDF = () => {
        const element = documentRef.current;
        const filename = invoice?.status === 'Lunas' || invoice?.status === 'Dibayar'
            ? `Kwitansi-${invoice.Kwitansi?.nomor_kwitansi || invoice.nomor_invoice}.pdf`
            : `Invoice-${invoice.nomor_invoice}.pdf`;

        const options = {
            margin: [10, 10, 10, 10], filename: filename, image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(options).from(element).save();
    };

    const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number || 0);
    const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'lunas': 
            case 'dibayar': return '#059669'; 
            case 'menunggu verifikasi': return '#d97706'; 
            case 'dibatalkan': return '#dc2626'; 
            default: return '#475569'; 
        }
    };

    if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Memuat Dokumen...</div>;
    if (!invoice) return null;

    const isLunas = invoice.status === 'Lunas' || invoice.status === 'Dibayar';
    const isMenunggu = invoice.status === 'Menunggu Verifikasi';

    return (
        <div className="dip-background">
            <Navbar />

            <div className="dip-main-container">
                <div className="dip-toolbar">
                    <button className="dip-btn-back" onClick={() => navigate('/invoice')}>&larr; Kembali</button>
                    <div className="dip-toolbar-actions">
                        {isLunas && (
                            <button className="dip-btn-success" onClick={handleDownloadPDF}>
                                Unduh Kwitansi (PDF)
                            </button>
                        )}
                        {!isLunas && (
                            <button className="dip-btn-primary" onClick={handleDownloadPDF}>
                                Unduh Tagihan (PDF)
                            </button>
                        )}
                    </div>
                </div>

                {/* FORM UNGGAH BUKTI (HANYA MUNCUL JIKA BELUM DIBAYAR) */}
                {invoice.status === 'Belum Dibayar' && (
                    <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Konfirmasi Pembayaran</h3>
                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>
                            Silakan lakukan pembayaran sebesar <strong>{formatRupiah(invoice.total)}</strong>. Setelah transfer, unggah bukti struk Anda di bawah ini agar admin dapat memverifikasinya.
                        </p>
                        <form onSubmit={handleUploadBukti} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <input 
                                type="file" 
                                accept="image/png, image/jpeg, image/jpg" 
                                onChange={(e) => setFileBukti(e.target.files[0])}
                                style={{ flex: 1, padding: '10px', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
                            />
                            <button 
                                type="submit" 
                                className="dip-btn-success" 
                                disabled={isUploading}
                                style={{ opacity: isUploading ? 0.7 : 1 }}
                            >
                                {isUploading ? 'Mengunggah...' : 'Kirim Bukti Pembayaran'}
                            </button>
                        </form>
                    </div>
                )}

                {/* PESAN MENUNGGU VERIFIKASI */}
                {isMenunggu && (
                    <div style={{ backgroundColor: '#fffbeb', color: '#b45309', padding: '16px 24px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #fcd34d', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <div>
                            <strong style={{ display: 'block', fontSize: '15px' }}>Bukti Pembayaran Terkirim</strong>
                            <span style={{ fontSize: '13px' }}>Harap tunggu, tim kami sedang memverifikasi pembayaran Anda. Kwitansi akan diterbitkan setelah diverifikasi.</span>
                        </div>
                    </div>
                )}

                {/* KERTAS DOKUMEN YANG AKAN DI-DOWNLOAD */}
                <div className="dip-document-paper" ref={documentRef}>
                   {/* ... (Isi kertas dokumen INVOICE persis sama dengan kodingan sebelumnya) ... */}
                    <div className="dip-doc-header">
                        <div className="dip-doc-brand">
                            <img src="/logorji.png" alt="Logo RJI" className="dip-brand-logo" />
                            <div>
                                <h2>Relawan Jurnal Indonesia</h2>
                                <p>Surat Jaminan & Layanan Keanggotaan</p>
                            </div>
                        </div>
                        <div className="dip-doc-title">
                            <h1>{isLunas ? 'KWITANSI PEMBAYARAN' : 'INVOICE TAGIHAN'}</h1>
                            <div className="dip-status-tag" style={{ backgroundColor: getStatusColor(invoice.status), color: '#fff' }}>
                                {invoice.status}
                            </div>
                        </div>
                    </div>

                    <div className="dip-divider"></div>

                    <div className="dip-doc-info-row">
                        <div className="dip-info-block">
                            <span className="dip-info-label">DITAGIHKAN KEPADA:</span>
                            <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block', marginBottom: '4px' }}>
                                {invoice.User?.nama || '-'}
                            </strong>
                            <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>{invoice.User?.email || '-'}</p>
                        </div>
                        <div className="dip-info-block dip-text-right">
                            <table className="dip-info-table" style={{ marginLeft: 'auto' }}>
                                <tbody>
                                    <tr>
                                        <td className="dip-info-label" style={{ padding: '2px 8px', textAlign: 'right', color: '#64748b', fontSize: '13px' }}>No. Invoice:</td>
                                        <td className="dip-info-value" style={{ padding: '2px 8px', textAlign: 'right', fontWeight: '600', color: '#0f172a', fontSize: '13px' }}>{invoice.nomor_invoice}</td>
                                    </tr>
                                    <tr>
                                        <td className="dip-info-label" style={{ padding: '2px 8px', textAlign: 'right', color: '#64748b', fontSize: '13px' }}>Tanggal Terbit:</td>
                                        <td className="dip-info-value" style={{ padding: '2px 8px', textAlign: 'right', fontWeight: '600', color: '#0f172a', fontSize: '13px' }}>{formatDate(invoice.tanggal_invoice || invoice.created_at)}</td>
                                    </tr>
                                    {isLunas && invoice.Kwitansi && (
                                        <>
                                            <tr>
                                                <td className="dip-info-label" style={{ padding: '2px 8px', textAlign: 'right', color: '#64748b', fontSize: '13px' }}>No. Kwitansi:</td>
                                                <td className="dip-info-value" style={{ padding: '2px 8px', textAlign: 'right', fontWeight: '600', color: '#059669', fontSize: '13px' }}>{invoice.Kwitansi.nomor_kwitansi}</td>
                                            </tr>
                                            <tr>
                                                <td className="dip-info-label" style={{ padding: '2px 8px', textAlign: 'right', color: '#64748b', fontSize: '13px' }}>Tanggal Lunas:</td>
                                                <td className="dip-info-value" style={{ padding: '2px 8px', textAlign: 'right', fontWeight: '600', color: '#0f172a', fontSize: '13px' }}>{formatDate(invoice.Kwitansi.tanggal_kwitansi)}</td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <table className="dip-items-table">
                        <thead>
                            <tr>
                                <th style={{ padding: '10px 12px', backgroundColor: '#f8fafc', color: '#475569', fontSize: '12px', textTransform: 'uppercase', borderBottom: '2px solid #cbd5e1' }}>Deskripsi Layanan</th>
                                <th style={{ padding: '10px 12px', backgroundColor: '#f8fafc', color: '#475569', fontSize: '12px', textTransform: 'uppercase', borderBottom: '2px solid #cbd5e1', textAlign: 'center' }}>Qty</th>
                                <th style={{ padding: '10px 12px', backgroundColor: '#f8fafc', color: '#475569', fontSize: '12px', textTransform: 'uppercase', borderBottom: '2px solid #cbd5e1', textAlign: 'right' }}>Harga Satuan</th>
                                <th style={{ padding: '10px 12px', backgroundColor: '#f8fafc', color: '#475569', fontSize: '12px', textTransform: 'uppercase', borderBottom: '2px solid #cbd5e1', textAlign: 'right' }}>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items && invoice.items.length > 0 ? (
                                invoice.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155' }}>{item.deskripsi}</td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155', textAlign: 'center' }}>{item.qty}</td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#334155', textAlign: 'right' }}>{formatRupiah(item.harga)}</td>
                                        <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', fontSize: '14px', color: '#0f172a', fontWeight: '500', textAlign: 'right' }}>{formatRupiah(item.subtotal)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>Tidak ada rincian.</td></tr>
                            )}
                        </tbody>
                    </table>

                    <div className="dip-doc-footer">
                        <div className="dip-notes" style={{ maxWidth: '55%', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                            {isLunas ? (
                                <p><strong>Catatan:</strong> Terima kasih, dokumen ini diterbitkan sebagai bukti transaksi resmi pembayaran sah Relawan Jurnal Indonesia.</p>
                            ) : (
                                <p><strong>Catatan:</strong> Harap lakukan penyelesaian administrasi sesuai rincian di atas agar hak klaim fasilitas sistem dapat segera diproses.</p>
                            )}
                        </div>
                        <div className="dip-totals-box" style={{ minWidth: '280px', marginLeft: 'auto' }}>
                            <div className="dip-total-row dip-grand-total" style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #e2e8f0', paddingTop: '12px', fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                                <span>TOTAL AKHIR</span>
                                <span style={{ color: '#2563eb' }}>{formatRupiah(invoice.total)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {isLunas && <div className="dip-stamp-paid">LUNAS</div>}
                </div>
            </div>
        </div>
    );
};

export default DetailInvoicePage;