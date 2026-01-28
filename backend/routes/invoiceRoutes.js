const express = require('express');
const { createInvoice, getMyInvoices } = require('../controllers/invoiceController');
const verifyToken = require('../middleware/authUser');

const router = express.Router();

router.post('/', verifyToken, createInvoice);
router.get('/', verifyToken, getMyInvoices);

module.exports = router;