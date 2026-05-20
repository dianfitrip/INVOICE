const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authUser');
const { getPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod } = require('../controllers/paymentMethodController');

router.get('/', verifyToken, getPaymentMethods);
router.post('/', verifyToken, createPaymentMethod);
router.put('/:id', verifyToken, updatePaymentMethod);
router.delete('/:id', verifyToken, deletePaymentMethod);

module.exports = router;