const { PaymentMethod } = require('../models');

exports.getPaymentMethods = async (req, res) => {
    try {
        const methods = await PaymentMethod.findAll();
        res.json(methods);
    } catch (error) {
        res.status(500).json({ msg: "Gagal memuat metode pembayaran" });
    }
};

exports.createPaymentMethod = async (req, res) => {
    try {
        const { nama_bank, nomor_rekening, atas_nama } = req.body;
        let gambar = null;
        
        if (req.file) {
            gambar = req.file.filename;
        }

        await PaymentMethod.create({ nama_bank, nomor_rekening, atas_nama, gambar });
        res.status(201).json({ msg: "Rekening berhasil ditambahkan" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal menambahkan rekening" });
    }
};

exports.updatePaymentMethod = async (req, res) => {
    try {
        const method = await PaymentMethod.findByPk(req.params.id);
        if(!method) return res.status(404).json({ msg: "Data tidak ditemukan" });

        const { nama_bank, nomor_rekening, atas_nama } = req.body;
        let updateData = { nama_bank, nomor_rekening, atas_nama };

        if (req.file) {
            updateData.gambar = req.file.filename;
        }

        await method.update(updateData);
        res.json({ msg: "Rekening berhasil diperbarui" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal memperbarui rekening" });
    }
};

exports.deletePaymentMethod = async (req, res) => {
    try {
        const method = await PaymentMethod.findByPk(req.params.id);
        if(!method) return res.status(404).json({ msg: "Data tidak ditemukan" });
        await method.destroy();
        res.json({ msg: "Rekening berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal menghapus rekening" });
    }
};