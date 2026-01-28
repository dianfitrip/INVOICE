const { Invoice, InvoiceItem } = require('../models');

exports.createInvoice = async (req, res) => {
    try {
        const { tanggal_invoice, items } = req.body;
        const id_user = req.userId; 

        // Hitung Total Otomatis
        let total = 0;
        items.forEach(item => {
            total += (item.qty * item.harga);
        });

        // Generate Nomor Invoice (Contoh: INV-20231027-1234)
        const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const nomor_invoice = `INV-${dateStr}-${randomNum}`;

        // Simpan Header Invoice
        const newInvoice = await Invoice.create({
            id_user: id_user,
            nomor_invoice: nomor_invoice,
            tanggal_invoice: tanggal_invoice,
            total: total,
            status: 'Belum Dibayar'
        });

        // Simpan Item Invoice
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
        console.error(error);
        res.status(500).json({ msg: "Gagal membuat invoice" });
    }
};

exports.getMyInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.findAll({
            where: { id_user: req.userId },
            include: [{ model: InvoiceItem, as: 'items' }],
            order: [['created_at', 'DESC']]
        });
        res.json(invoices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Gagal mengambil data invoice" });
    }
};

exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findOne({
            where: { 
                id_invoice: req.params.id,
                id_user: req.userId // Pastikan user cuma bisa lihat invoicenya sendiri
            },
            include: [{ model: InvoiceItem, as: 'items' }]
        });

        if(!invoice) return res.status(404).json({msg: "Invoice tidak ditemukan"});
        
        res.json(invoice);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server Error" });
    }
};