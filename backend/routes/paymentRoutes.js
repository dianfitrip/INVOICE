const express = require('express');
const { uploadPayment } = require('../controllers/paymentController');
const verifyToken = require('../middleware/authUser');
const upload = require('../middleware/upload');

const router = express.Router();

// Endpoint POST: /api/payments
router.post('/', verifyToken, upload.single('bukti_pembayaran'), uploadPayment);

module.exports = router;