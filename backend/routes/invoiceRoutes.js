const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authUser');
const { 
    createInvoice, 
    getMyInvoices, 
    getInvoiceById,
    getAllInvoices,
    updateInvoiceStatus,
    deleteInvoice
} = require('../controllers/invoiceController');

// ==========================================
// ROUTE UNTUK ADMIN & SUPERADMIN
// ==========================================

// Mengambil SEMUA invoice yang ada di database (Digunakan oleh ManageInvoices.js)
router.get('/', verifyToken, getAllInvoices);

// Membuat invoice baru
router.post('/', verifyToken, createInvoice); 

// Mengupdate status invoice (Lunas, Dibatalkan, dll)
router.put('/:id', verifyToken, updateInvoiceStatus);

// Menghapus invoice
router.delete('/:id', verifyToken, deleteInvoice);


// ==========================================
// ROUTE UNTUK USER KLIEN / PENGGUNA BIASA
// ==========================================

// Mengambil invoice milik user yang sedang login (Digunakan oleh InvoicePage.js)
router.get('/my-invoices', verifyToken, getMyInvoices);

// Mengambil detail 1 invoice spesifik berdasarkan ID
router.get('/:id', verifyToken, getInvoiceById);


module.exports = router;