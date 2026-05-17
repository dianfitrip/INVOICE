const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authUser');
const { getItems, createItem, updateItem, deleteItem } = require('../controllers/itemController');

// getItems bisa diakses siapa saja (untuk dropdown form user)
router.get('/', verifyToken, getItems); 

// Sisanya butuh proteksi (bisa ditambahkan proteksi superadmin jika perlu)
router.post('/', verifyToken, createItem);
router.put('/:id', verifyToken, updateItem);
router.delete('/:id', verifyToken, deleteItem);

module.exports = router;