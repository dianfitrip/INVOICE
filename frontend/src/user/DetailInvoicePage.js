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
    const [fileBukti, setFileBukti] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const documentRef = useRef(null);

    useEffect(() => { fetchInvoiceDetail(); }, [id]);

    const fetchInvoiceDetail = async () => {
        const token = localStorage.getItem('accessToken');
        try {
            const response = await fetch(`http://localhost:5000/api/invoices/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setInvoice(data);
            else navigate('/invoice');
        } catch (error) { Swal.fire('Error', 'Gagal memuat data', 'error'); }
        finally { setLoading(false); }
    };

    const handleUploadBukti = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('bukti', fileBukti);
        setIsUploading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/invoices/${id}/upload-bukti`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
                body: formData 
            });
            if (response.ok) { Swal.fire('Berhasil!', 'Bukti terunggah.', 'success'); fetchInvoiceDetail(); }
        } catch (error) { Swal.fire('Error', 'Gagal upload', 'error'); }
        finally { setIsUploading(false); }
    };

    const handleDownloadPDF = () => {
        html2pdf().set({
            margin: 10, filename: `Invoice-${invoice.nomor_invoice}.pdf`,
            html2canvas: { scale: 2 }, jsPDF: { format: 'a4', orientation: 'portrait' }
        }).from(documentRef.current).save();
    };

    if (loading) return <div>Memuat...</div>;
    
    return (
        <div className="dip-background">
            <Navbar />
            <div className="dip-main-container">
                <div className="dip-toolbar">
                    <button className="dip-btn-back" onClick={() => navigate('/invoice')}>&larr; Kembali</button>
                    <button className="dip-btn-primary" onClick={handleDownloadPDF}>Unduh PDF</button>
                </div>

                {invoice.status === 'Belum Dibayar' && (
                    <div className="dip-bukti-box">
                        <form onSubmit={handleUploadBukti} className="dip-form-bukti">
                            <input type="file" onChange={(e) => setFileBukti(e.target.files[0])} />
                            <button type="submit" disabled={isUploading}>Kirim Bukti</button>
                        </form>
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
                    
                    {/* ... (tabel item tetap sama) ... */}
                </div>
            </div>
        </div>
    );
};
export default DetailInvoicePage;