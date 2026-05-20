import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './adminstyles/ManageInvoices.css'; 

const ManagePaymentMethods = () => {
    const [methods, setMethods] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentId, setCurrentId] = useState(null);
    const [formData, setFormData] = useState({ nama_bank: '', nomor_rekening: '', atas_nama: '' });

    const API_URL = 'http://localhost:5000/api/payment-methods';
    const userRole = localStorage.getItem('role');

    useEffect(() => {
        if (userRole === 'admin' || userRole === 'superadmin') fetchMethods();
    }, [userRole]);

    const fetchMethods = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
            setMethods(res.data);
        } catch (error) { console.error(error); }
    };

    const handleOpenModal = (method = null) => {
        if (method) {
            setIsEdit(true); setCurrentId(method.id_rekening);
            setFormData({ nama_bank: method.nama_bank, nomor_rekening: method.nomor_rekening, atas_nama: method.atas_nama });
        } else {
            setIsEdit(false); setFormData({ nama_bank: '', nomor_rekening: '', atas_nama: '' });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('accessToken');
        try {
            if (isEdit) {
                await axios.put(`${API_URL}/${currentId}`, formData, { headers: { Authorization: `Bearer ${token}` } });
                Swal.fire('Berhasil', 'Rekening diperbarui', 'success');
            } else {
                await axios.post(API_URL, formData, { headers: { Authorization: `Bearer ${token}` } });
                Swal.fire('Berhasil', 'Rekening ditambahkan', 'success');
            }
            setShowModal(false); fetchMethods();
        } catch (error) { Swal.fire('Gagal', 'Terjadi kesalahan', 'error'); }
    };

    const handleDelete = async (id) => {
        Swal.fire({ title: 'Hapus Rekening?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Hapus' })
        .then(async (result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('accessToken');
                await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                fetchMethods(); Swal.fire('Terhapus', 'Rekening dihapus', 'success');
            }
        });
    };

    if (userRole !== 'admin' && userRole !== 'superadmin') return <div>Akses Ditolak</div>;

    return (
        <div className="mi-container">
            <div className="mi-header">
                <div className="mi-header-title"><h2>Kelola Rekening & Pembayaran</h2><p>Atur metode pembayaran yang akan tampil untuk user.</p></div>
                <button className="mi-btn-primary" onClick={() => handleOpenModal()}>+ Tambah Rekening</button>
            </div>

            <div className="mi-table-container">
                <table className="mi-table">
                    <thead>
                        <tr><th width="5%">No</th><th width="25%">Bank / E-Wallet</th><th width="30%">Nomor Rekening / HP</th><th width="30%">Atas Nama</th><th width="10%">Aksi</th></tr>
                    </thead>
                    <tbody>
                        {methods.length > 0 ? methods.map((m, index) => (
                            <tr key={m.id_rekening}>
                                <td className="mi-text-muted">{index + 1}</td>
                                <td className="mi-text-main" style={{fontWeight: 'bold'}}>{m.nama_bank}</td>
                                <td>{m.nomor_rekening}</td><td>{m.atas_nama}</td>
                                <td className="mi-action-cell">
                                    <button className="mi-btn-icon" onClick={() => handleOpenModal(m)}>Edit</button>
                                    <button className="mi-btn-icon mi-btn-danger" onClick={() => handleDelete(m.id_rekening)}>Hapus</button>
                                </td>
                            </tr>
                        )) : <tr><td colSpan="5" className="mi-text-center">Belum ada metode pembayaran.</td></tr>}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="mi-modal-overlay">
                    <div className="mi-modal-box">
                        <div className="mi-modal-header"><h3>{isEdit ? 'Edit Rekening' : 'Tambah Rekening'}</h3><button className="mi-btn-close" onClick={() => setShowModal(false)}>&times;</button></div>
                        <form onSubmit={handleSubmit} className="mi-form">
                            <div className="mi-form-group"><label>Bank / E-Wallet (Contoh: BCA / GoPay)</label><input type="text" value={formData.nama_bank} onChange={(e) => setFormData({...formData, nama_bank: e.target.value})} required /></div>
                            <div className="mi-form-group"><label>Nomor Rekening / No. HP</label><input type="text" value={formData.nomor_rekening} onChange={(e) => setFormData({...formData, nomor_rekening: e.target.value})} required /></div>
                            <div className="mi-form-group"><label>Atas Nama (Pemilik Rekening)</label><input type="text" value={formData.atas_nama} onChange={(e) => setFormData({...formData, atas_nama: e.target.value})} required /></div>
                            <div className="mi-modal-actions"><button type="button" className="mi-btn-outline" onClick={() => setShowModal(false)}>Batal</button><button type="submit" className="mi-btn-primary">Simpan</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default ManagePaymentMethods;