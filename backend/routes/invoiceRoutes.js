const express = require('express');
const { createInvoice, getMyInvoices, getInvoiceById } = require('../controllers/invoiceController');
const verifyToken = require('../middleware/authUser');

const router = express.Router();

router.post('/', verifyToken, createInvoice);
router.get('/', verifyToken, getMyInvoices);

router.get('/:id', verifyToken, getInvoiceById);

module.exports = router;