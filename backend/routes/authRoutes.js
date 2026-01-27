const express = require('express');
const { registerUser, loginUser, getMe } = require('../controllers/authController');
// Nanti kita butuh middleware verifyToken untuk getMe, tapi sementara kita kosongkan dulu logic-nya
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
// router.get('/me', verifyToken, getMe); // Akan kita aktifkan setelah buat middleware

module.exports = router;