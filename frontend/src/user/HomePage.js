import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import Swal from 'sweetalert2'; 
import jsPDF from 'jspdf'; // Import PDF Generator
import autoTable from 'jspdf-autotable'; // Import AutoTable untuk Tabel PDF
import './userstyles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({ nama: '', role: '' });
  
  // State untuk statistik
  const [stats, setStats] = useState({
    total: 0,
    lunas: 0,
    pending: 0,
    kwitansi: 0
  });

  const parseJwt = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      navigate('/login');
    } else {
      const decoded = parseJwt(token);
      if (decoded) {
        setUser({
          nama: decoded.nama,
          role: decoded.role
        });
        fetchStats(token); 
      } else {
        localStorage.removeItem('accessToken');
        navigate('/login');
      }
    }
  }, [navigate]);

  const fetchStats = async (token) => {
    try {
        const response = await fetch('http://localhost:5000/api/invoices', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if(response.ok && Array.isArray(data)) {
            setStats({
                total: data.length,
                lunas: data.filter(i => i.status === 'Dibayar').length,
                pending: data.filter(i => i.status === 'Belum Dibayar').length,
                kwitansi: data.filter(i => i.status === 'Dibayar').length 
            });
        }
    } catch (error) {
        console.error("Gagal load stats", error);
    }
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
  };

  // --- FUNGSI DOWNLOAD PDF ---
  const handleDownloadReport = async () => {
    const token = localStorage.getItem('accessToken');
    
    Swal.fire({
        title: 'Menyiapkan PDF...',
        text: 'Mohon tunggu sebentar',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const response = await fetch('http://localhost:5000/api/invoices', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
            const doc = new jsPDF();

            // HEADER
            doc.setFontSize(18);
            doc.setTextColor(40);
            doc.text('Laporan Rekapitulasi Invoice', 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(100);
            doc.text(`Dicetak Oleh: ${user.nama}`, 14, 32);
            doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 14, 38);

            doc.setDrawColor(200);
            doc.line(14, 42, 196, 42);

            // TABEL DATA
            const tableColumn = ["No. Invoice", "Tanggal", "Status", "Total Tagihan"];
            const tableRows = [];

            data.forEach(invoice => {
                const invoiceData = [
                    invoice.nomor_invoice,
                    invoice.tanggal_invoice,
                    invoice.status,
                    formatRupiah(invoice.total)
                ];
                tableRows.push(invoiceData);
            });

            autoTable(doc, {
                startY: 45,
                head: [tableColumn],
                body: tableRows,
                theme: 'grid',
                headStyles: { 
                    fillColor: [247, 148, 30], // Warna Orange RJI
                    textColor: 255, 
                    fontStyle: 'bold'
                },
                styles: { fontSize: 10, cellPadding: 3 },
                alternateRowStyles: { fillColor: [250, 250, 250] }
            });

            // FOOTER TOTAL
            const finalY = doc.lastAutoTable.finalY + 10;
            const totalPendapatan = data.reduce((acc, curr) => acc + parseInt(curr.total), 0);
            
            doc.setFontSize(12);
            doc.setTextColor(40);
            doc.setFont("helvetica", "bold");
            doc.text(`Total Keseluruhan: ${formatRupiah(totalPendapatan)}`, 14, finalY);

            doc.save(`Laporan_Invoice_${new Date().toISOString().slice(0,10)}.pdf`);

            Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Laporan PDF berhasil diunduh.',
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            Swal.fire('Gagal', 'Tidak bisa mengambil data laporan', 'error');
        }
    } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Terjadi kesalahan sistem', 'error');
    }
  };

  return (
    <div className="homepage-bg">
      <Navbar />
      
      <div className="main-content-container">
        
        {/* HEADER SECTION */}
        <div className="welcome-banner">
            <div>
              <h1>Halo, <span className="text-orange">{user.nama}</span>! 👋</h1>
              <p>Selamat datang kembali di Dashboard RJI Invoice.</p>
            </div>
            <div className="date-display">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
        </div>

        {/* STATS CARDS */}
        <div className="stats-grid">
          <div className="card-stat">
            <div className="icon-stat orange-bg">📄</div>
            <div className="info-stat">
              <h3>{stats.total}</h3>
              <p>Total Invoice</p>
            </div>
          </div>
          
          <div className="card-stat">
            <div className="icon-stat green-bg">✅</div>
            <div className="info-stat">
              <h3>{stats.lunas}</h3>
              <p>Lunas</p>
            </div>
          </div>

          <div className="card-stat">
            <div className="icon-stat red-bg">⏳</div>
            <div className="info-stat">
              <h3>{stats.pending}</h3>
              <p>Belum Dibayar</p>
            </div>
          </div>

          <div className="card-stat">
            <div className="icon-stat blue-bg">🧾</div>
            <div className="info-stat">
              <h3>{stats.kwitansi}</h3>
              <p>Kwitansi</p>
            </div>
          </div>
        </div>

        {/* QUICK ACTION MENU */}
        {/* Style inline dihapus, diganti className section-title */}
        <h3 className="section-title">Menu Cepat</h3>
        
        <div className="action-grid">
          
          {/* 1. Ke Halaman Invoice */}
          <button className="btn-action" onClick={() => navigate('/invoice')}>
            <span className="plus-icon">+</span> Buat Invoice Baru
          </button>
          
          {/* 2. Ke Halaman Kwitansi (Riwayat) */}
          <button className="btn-action outline" onClick={() => navigate('/kwitansi')}>
            Lihat Riwayat Transaksi
          </button>
          
          {/* 3. Download PDF */}
          <button className="btn-action outline" onClick={handleDownloadReport}>
            Download Laporan (PDF)
          </button>

        </div>
      </div>
    </div>
  );
};

export default HomePage;