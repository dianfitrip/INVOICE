const { Payment, Invoice } = require('../models');

exports.uploadPayment = async (req, res) => {
    try {
        const { id_invoice, tanggal_bayar } = req.body;
        const bukti_pembayaran = req.file ? req.file.filename : null;

        if (!bukti_pembayaran) {
            return res.status(400).json({ msg: "Wajib upload foto bukti pembayaran!" });
        }

        // 1. Simpan data pembayaran
        await Payment.create({
            id_invoice: id_invoice,
            tanggal_bayar: tanggal_bayar,
            bukti_pembayaran: bukti_pembayaran,
            status_verifikasi: 'Menunggu',
            catatan_admin: '-'
        });

        // 2. Update Status Invoice jadi "Menunggu Verifikasi"
        await Invoice.update(
            { status: 'Menunggu Verifikasi' }, 
            { where: { id_invoice: id_invoice } }
        );

        res.status(201).json({ msg: "Bukti pembayaran berhasil dikirim!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Gagal mengupload bukti pembayaran" });
    }
};