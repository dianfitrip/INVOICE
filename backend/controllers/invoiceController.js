const { Invoice, InvoiceItem, Kwitansi, User } = require('../models');

// CREATE INVOICE
exports.createInvoice = async (req, res) => {
    try {
        const { tanggal_invoice, items, id_user_admin } = req.body;
        const id_user = id_user_admin || req.userId; 

        if (!id_user) return res.status(400).json({ msg: "User ID tidak ditemukan" });

        let total = 0;
        items.forEach(item => {
            total += (item.qty * item.harga);
        });

        const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const nomor_invoice = `INV-${dateStr}-${randomNum}`;

        const newInvoice = await Invoice.create({
            id_user: id_user,
            nomor_invoice: nomor_invoice,
            tanggal_invoice: tanggal_invoice,
            total: total,
            status: 'Belum Dibayar'
        });

        const invoiceItems = items.map(item => ({
            id_invoice: newInvoice.id_invoice,
            deskripsi: item.deskripsi,
            qty: item.qty,
            harga: item.harga,
            subtotal: item.qty * item.harga
        }));

        await InvoiceItem.bulkCreate(invoiceItems);
        res.status(201).json({ msg: "Invoice Berhasil Dibuat", data: newInvoice });

    } catch (error) {
        console.error("Error createInvoice:", error);
        res.status(500).json({ msg: "Gagal membuat invoice" });
    }
};

// READ: MY INVOICES (UNTUK SISI USER KLIEN)
exports.getMyInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll({
            where: { id_user: req.userId },
            include: [{ model: InvoiceItem, as: 'items' }],
            order: [['created_at', 'DESC']]
        });
        res.json(invoices);
    } catch (error) {
        console.error("Error getMyInvoices:", error);
        res.status(500).json({ msg: "Gagal mengambil data invoice" });
    }
};

// READ: ALL INVOICES (UNTUK SISI ADMIN / SUPERADMIN)
exports.getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll({
            include: [
                { model: InvoiceItem, as: 'items' },
                { model: User, attributes: ['nama', 'email'] } // Perbaikan: Menghilangkan alias 'as' jika memicu bentrokan relasi
            ],
            order: [['created_at', 'DESC']]
        });
        res.json(invoices);
    } catch (error) {
        console.error("Error getAllInvoices:", error);
        res.status(500).json({ msg: "Gagal mengambil seluruh data invoice" });
    }
};

// UPDATE STATUS INVOICE & AUTO KWITANSI
exports.updateInvoiceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const invoice = await Invoice.findByPk(req.params.id);

        if (!invoice) return res.status(404).json({ msg: "Invoice tidak ditemukan" });

        await invoice.update({ status });

        if (status === 'Lunas') {
            const existingKwitansi = await Kwitansi.findOne({ where: { id_invoice: invoice.id_invoice } });
            
            if (!existingKwitansi) {
                const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
                const randomNum = Math.floor(100 + Math.random() * 900);
                const nomor_kwitansi = `KWT-${dateStr}-${randomNum}`;

                await Kwitansi.create({
                    id_invoice: invoice.id_invoice,
                    nomor_kwitansi: nomor_kwitansi,
                    tanggal_kwitansi: new Date()
                });
            }
        }

        res.json({ message: "Status invoice berhasil diperbarui." });
    } catch (error) {
        console.error("Error updateInvoiceStatus:", error);
        res.status(500).json({ msg: "Gagal memperbarui status." });
    }
};

// DELETE INVOICE
exports.deleteInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findByPk(req.params.id);
        if (!invoice) return res.status(404).json({ msg: "Invoice tidak ditemukan" });

        await invoice.destroy();
        res.json({ message: "Invoice berhasil dihapus." });
    } catch (error) {
        console.error("Error deleteInvoice:", error);
        res.status(500).json({ msg: "Gagal menghapus invoice." });
    }
};