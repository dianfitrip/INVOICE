const express = require('express');
const { registerUser, loginUser, getMe, updateProfile } = require('../controllers/authController');
// Nanti kita butuh middleware verifyToken untuk getMe, tapi sementara kita kosongkan dulu logic-nya
const router = express.Router();
const verifyToken = require('../middleware/authUser');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/me', verifyToken, getMe);
router.put('/me', verifyToken, updateProfile);

module.exports = router;