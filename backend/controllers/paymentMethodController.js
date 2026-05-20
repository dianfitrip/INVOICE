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
        await PaymentMethod.create(req.body);
        res.status(201).json({ msg: "Rekening berhasil ditambahkan" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal menambahkan rekening" });
    }
};

exports.updatePaymentMethod = async (req, res) => {
    try {
        const method = await PaymentMethod.findByPk(req.params.id);
        if(!method) return res.status(404).json({ msg: "Data tidak ditemukan" });
        await method.update(req.body);
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