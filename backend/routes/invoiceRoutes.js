const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authUser');
const upload = require('../middleware/upload'); // IMPORT MIDDLEWARE MULTER

const { 
    createInvoice, 
    getMyInvoices, 
    getInvoiceById,
    getAllInvoices,
    updateInvoiceStatus,
    deleteInvoice,
    uploadBuktiPembayaran // IMPORT FUNGSI BARU
} = require('../controllers/invoiceController');

// ... (Rute Admin tetap sama seperti sebelumnya)
router.get('/', verifyToken, getAllInvoices);
router.post('/', verifyToken, createInvoice); 
router.put('/:id', verifyToken, updateInvoiceStatus);
router.delete('/:id', verifyToken, deleteInvoice);

// ... (Rute User)
router.get('/my-invoices', verifyToken, getMyInvoices);
router.get('/:id', verifyToken, getInvoiceById);

// ROUTE BARU: Unggah bukti pembayaran (gunakan upload.single('bukti'))
router.post('/:id/upload-bukti', verifyToken, upload.single('bukti'), uploadBuktiPembayaran);

module.exports = router;