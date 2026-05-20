const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authUser');
const upload = require('../middleware/upload'); 
const { getPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } = require('../controllers/paymentMethodController');

router.get('/', verifyToken, getPaymentMethods);
router.post('/', verifyToken, upload.single('gambar'), createPaymentMethod);
router.put('/:id', verifyToken, upload.single('gambar'), updatePaymentMethod);
router.delete('/:id', verifyToken, deletePaymentMethod);

module.exports = router;