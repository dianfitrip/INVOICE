const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Fungsi Register
exports.registerUser = async (req, res) => {
    const { nama, email, password, confPassword } = req.body;

    // 1. Validasi Password Match
    if (password !== confPassword) {
        return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok" });
    }

    try {
        // 2. Cek apakah email sudah ada
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(400).json({ msg: "Email sudah terdaftar" });
        }

        // 3. Buat User Baru (Password otomatis di-hash oleh Model Hooks)
        await User.create({
            nama: nama,
            email: email,
            password: password,
            role: 'user' 
        });

        res.status(201).json({ msg: "Register Berhasil! Silakan Login." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
};

// Fungsi Login
exports.loginUser = async (req, res) => {
    try {
        // 1. Cari User berdasarkan Email
        const user = await User.findOne({ 
            where: { email: req.body.email } 
        });

        // Jika user tidak ketemu
        if (!user) return res.status(404).json({ msg: "Email tidak ditemukan" });

        // 2. Cek Password (menggunakan method yang kita buat di Model User tadi)
        const isMatch = await user.matchPassword(req.body.password);
        
        if (!isMatch) return res.status(400).json({ msg: "Password salah" });

        // 3. Buat Token JWT (Untuk sesi login)
        const userId = user.id_user;
        const nama = user.nama;
        const email = user.email;
        const role = user.role;

        const accessToken = jwt.sign({ userId, nama, email, role }, process.env.JWT_SECRET, {
            expiresIn: '1d' // Token berlaku 1 hari
        });

        res.json({ accessToken });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
};

// Fungsi Cek Profil (Me) - Untuk mengambil data user yang sedang login
exports.getMe = async (req, res) => {
    // Logic ini nanti butuh middleware verifikasi token
    if(!req.userId) return res.status(401).json({msg: "Mohon login akun Anda"});
    
    const user = await User.findOne({
        attributes: ['id_user', 'nama', 'email', 'role'],
        where: {
            id_user: req.userId
        }
    });
    
    if(!user) return res.status(404).json({msg: "User tidak ditemukan"});
    res.json(user);
};