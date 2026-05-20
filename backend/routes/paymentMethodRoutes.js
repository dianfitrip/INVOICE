const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authUser');
const upload = require('../middleware/upload'); 
const { 
    getPaymentMethods, 
    createPaymentMethod, 
    updatePaymentMethod, 
    deletePaymentMethod 
} = require('../controllers/paymentMethodController');

router.get('/', verifyToken, getPaymentMethods);
// Menambahkan middleware upload.single('gambar') untuk POST dan PUT
router.post('/', verifyToken, upload.single('gambar'), createPaymentMethod);
router.put('/:id', verifyToken, upload.single('gambar'), updatePaymentMethod);
router.delete('/:id', verifyToken, deletePaymentMethod);

module.exports = router;