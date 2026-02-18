const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    // Tangkap 'role' dari body request
    const { nama, email, password, confPassword, role } = req.body; // <--- PERUBAHAN 1

    if (password !== confPassword) {
        return res.status(400).json({ msg: "Password dan Confirm Password tidak cocok" });
    }

    try {
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            return res.status(400).json({ msg: "Email sudah terdaftar" });
        }

        await User.create({
            nama: nama,
            email: email,
            password: password, 
            // Gunakan role dari input Postman. Jika kosong, default ke 'user'
            role: role || 'user'  // <--- PERUBAHAN 2
        });

        res.status(201).json({ msg: "Register Berhasil! Silakan Login." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
};

// 2. LOGIN (Gunakan matchPassword dari Model)
exports.loginUser = async (req, res) => {
    try {
        const user = await User.findOne({ 
            where: { email: req.body.email } 
        });

        if (!user) return res.status(404).json({ msg: "Email tidak ditemukan" });

        // Memanggil helper yang ada di models/User.js
        const isMatch = await user.matchPassword(req.body.password);
        
        if (!isMatch) return res.status(400).json({ msg: "Password salah" });

        const { id_user: userId, nama, email, role } = user;

        const accessToken = jwt.sign(
            { userId, nama, email, role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({ accessToken });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Terjadi kesalahan server" });
    }
};

// 3. GET ME (Tetap sama)
exports.getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId, {
            attributes: ['id_user', 'nama', 'email', 'role']
        });
        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Server Error" });
    }
};

// 4. UPDATE PROFILE (Tetap sama, pastikan hash password jika diganti)
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.userId);
        if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

        const { nama, email, password } = req.body;

        user.nama = nama || user.nama;
        user.email = email || user.email;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();

        res.json({ 
            msg: "Profil berhasil diperbarui!", 
            user: { id_user: user.id_user, nama: user.nama, email: user.email }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Gagal update profil" });
    }
};