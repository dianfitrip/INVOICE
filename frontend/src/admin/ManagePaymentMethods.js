import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './adminstyles/ManagePaymentMethods.css'; 

const ManagePaymentMethods = () => {
    const [methods, setMethods] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    
    const [formData, setFormData] = useState({ 
        nama_bank: '', 
        nomor_rekening: '', 
        atas_nama: '', 
        gambar: null 
    });

    const API_URL = 'http://localhost:5000/api/payment-methods';
    const UPLOADS_URL = 'http://localhost:5000/uploads';
    const userRole = localStorage.getItem('role');

    useEffect(() => {
        if (userRole === 'admin' || userRole === 'superadmin') {
            fetchMethods();
        }
    }, [userRole]);

    const fetchMethods = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get(API_URL, { 
                headers: { Authorization: `Bearer ${token}` } 
            });
            setMethods(res.data);
        } catch (error) { 
            console.error("Gagal memuat data", error); 
        }
    };

    const handleOpenModal = (method = null) => {
        if (method) {
            setIsEdit(true); 
            setCurrentId(method.id_rekening);
            setFormData({ 
                nama_bank: method.nama_bank, 
                nomor_rekening: method.nomor_rekening, 
                atas_nama: method.atas_nama,
                gambar: null 
            });
        } else {
            setIsEdit(false); 
            setFormData({ 
                nama_bank: '', 
                nomor_rekening: '', 
                atas_nama: '', 
                gambar: null 
            });
        }
        setShowModal(true);
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, gambar: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        
        // WAJIB gunakan FormData untuk mengirim file gambar
        const submitData = new FormData();
        submitData.append('nama_bank', formData.nama_bank);
        submitData.append('nomor_rekening', formData.nomor_rekening);
        submitData.append('atas_nama', formData.atas_nama);
        
        if (formData.gambar) {
            submitData.append('gambar', formData.gambar);
        }

        try {
            // Konfigurasi Header untuk file upload
            const config = {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' 
                }
            };

            if (isEdit) {
                await axios.put(`${API_URL}/${currentId}`, submitData, config);
                Swal.fire('Berhasil', 'Metode pembayaran diperbarui', 'success');
            } else {
                await axios.post(API_URL, submitData, config);
                Swal.fire('Berhasil', 'Metode pembayaran ditambahkan', 'success');
            }
            setShowModal(false); 
            fetchMethods();
        } catch (error) { 
            console.error("Error Submit:", error);
            const pesanError = error.response?.data?.msg || 'Gagal menyimpan data';
            Swal.fire('Gagal', pesanError, 'error'); 
        }
    };

    const handleDelete = async (id) => {
        Swal.fire({ 
            title: 'Hapus Metode?', 
            icon: 'warning', 
            showCancelButton: true, 
            confirmButtonText: 'Ya, Hapus' 
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const token = localStorage.getItem('accessToken');
                    await axios.delete(`${API_URL}/${id}`, { 
                        headers: { Authorization: `Bearer ${token}` } 
                    });
                    fetchMethods(); 
                    Swal.fire('Terhapus', 'Data berhasil dihapus', 'success');
                } catch (error) {
                    Swal.fire('Gagal', 'Gagal menghapus data', 'error');
                }
            }
        });
    };

    if (userRole !== 'admin' && userRole !== 'superadmin') return <div>Akses Ditolak</div>;

    return (
        <div className="mi-container">
            <div className="mi-header">
                <div className="mi-header-title">
                    <h2>Kelola Metode Pembayaran</h2>
                    <p>Atur rekening atau QRIS yang akan tampil untuk user.</p>
                </div>
                <button className="mi-btn-primary" onClick={() => handleOpenModal()}>+ Tambah Metode</button>
            </div>

            <div className="mi-table-container">
                <table className="mi-table">
                    <thead>
                        <tr>
                            <th width="5%">No</th>
                            <th width="20%">Bank / E-Wallet</th>
                            <th width="25%">Nomor Rekening / HP</th>
                            <th width="20%">Atas Nama</th>
                            <th width="15%">Gambar/QRIS</th>
                            <th width="15%">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {methods.length > 0 ? methods.map((m, index) => (
                            <tr key={m.id_rekening}>
                                <td className="mi-text-muted">{index + 1}</td>
                                <td className="mi-text-main fw-bold">{m.nama_bank}</td>
                                <td>{m.nomor_rekening}</td>
                                <td>{m.atas_nama}</td>
                                <td>
                                    {m.gambar ? (
                                        <img 
                                            src={`${UPLOADS_URL}/${m.gambar}`} 
                                            alt="QRIS" 
                                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} 
                                        />
                                    ) : (
                                        <span className="mi-text-muted">-</span>
                                    )}
                                </td>
                                <td className="mi-action-cell">
                                    <button className="mi-btn-icon" onClick={() => handleOpenModal(m)}>Edit</button>
                                    <button className="mi-btn-icon mi-btn-danger" onClick={() => handleDelete(m.id_rekening)}>Hapus</button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="6" className="mi-text-center">Belum ada metode pembayaran.</td></tr>}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="mi-modal-overlay">
                    <div className="mi-modal-box">
                        <div className="mi-modal-header">
                            <h3>{isEdit ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}</h3>
                            <button className="mi-btn-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="mi-form">
                            <div className="mi-form-group">
                                <label>Bank / E-Wallet (Contoh: BCA / GoPay / QRIS)</label>
                                <input 
                                    type="text" 
                                    value={formData.nama_bank} 
                                    onChange={(e) => setFormData({...formData, nama_bank: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="mi-form-group">
                                <label>Nomor Rekening / No. HP (Isi '-' jika hanya QRIS)</label>
                                <input 
                                    type="text" 
                                    value={formData.nomor_rekening} 
                                    onChange={(e) => setFormData({...formData, nomor_rekening: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="mi-form-group">
                                <label>Atas Nama (Pemilik Rekening)</label>
                                <input 
                                    type="text" 
                                    value={formData.atas_nama} 
                                    onChange={(e) => setFormData({...formData, atas_nama: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="mi-form-group">
                                <label>Unggah Foto / QRIS (Opsional)</label>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                    style={{ width: '100%', padding: '8px' }}
                                />
                            </div>
                            <div className="mi-modal-actions">
                                <button type="button" className="mi-btn-outline" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="mi-btn-primary">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagePaymentMethods;