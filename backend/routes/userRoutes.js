const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser } = require('../controllers/userController');
const { verifyUser } = require('../middleware/authUser'); // Gunakan middleware auth milikmu

router.get('/', verifyUser, getUsers);
router.post('/', verifyUser, createUser);
router.put('/:id', verifyUser, updateUser);
router.delete('/:id', verifyUser, deleteUser);

module.exports = router;