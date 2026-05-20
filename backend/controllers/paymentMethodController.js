const { PaymentMethod } = require('../models');

exports.getPaymentMethods = async (req, res) => {
    try {
        const methods = await PaymentMethod.findAll();
        res.json(methods);
    } catch (error) {
        console.error("Error getPaymentMethods:", error);
        res.status(500).json({ msg: "Gagal memuat metode pembayaran" });
    }
};

exports.createPaymentMethod = async (req, res) => {
    try {
        const { nama_bank, nomor_rekening, atas_nama } = req.body;
        let gambar = null;
        
        // Jika ada file gambar yang diunggah
        if (req.file) {
            gambar = req.file.filename;
        }

        await PaymentMethod.create({ 
            nama_bank, 
            nomor_rekening, 
            atas_nama, 
            gambar 
        });
        
        res.status(201).json({ msg: "Metode pembayaran berhasil ditambahkan" });
    } catch (error) {
        console.error("Error createPaymentMethod:", error);
        res.status(500).json({ msg: "Gagal menambahkan metode pembayaran", error: error.message });
    }
};

exports.updatePaymentMethod = async (req, res) => {
    try {
        const method = await PaymentMethod.findByPk(req.params.id);
        if(!method) return res.status(404).json({ msg: "Data tidak ditemukan" });

        const { nama_bank, nomor_rekening, atas_nama } = req.body;
        let updateData = { nama_bank, nomor_rekening, atas_nama };

        // Jika mengunggah file baru saat edit
        if (req.file) {
            updateData.gambar = req.file.filename;
        }

        await method.update(updateData);
        res.json({ msg: "Metode pembayaran berhasil diperbarui" });
    } catch (error) {
        console.error("Error updatePaymentMethod:", error);
        res.status(500).json({ msg: "Gagal memperbarui metode pembayaran" });
    }
};

exports.deletePaymentMethod = async (req, res) => {
    try {
        const method = await PaymentMethod.findByPk(req.params.id);
        if(!method) return res.status(404).json({ msg: "Data tidak ditemukan" });
        
        await method.destroy();
        res.json({ msg: "Metode pembayaran berhasil dihapus" });
    } catch (error) {
        console.error("Error deletePaymentMethod:", error);
        res.status(500).json({ msg: "Gagal menghapus metode pembayaran" });
    }
};