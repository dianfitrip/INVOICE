const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize'); 

// READ & SEARCH
exports.getUsers = async (req, res) => {
    try {
        const search = req.query.search || '';
        const users = await User.findAll({
            where: {
                nama: { [Op.like]: `%${search}%` } // PERBAIKAN: name -> nama
            },
            attributes: { exclude: ['password'] } 
        });
        res.json(users);
    } catch (error) {
        console.error("Error getUsers:", error);
        res.status(500).json({ message: error.message });
    }
};

// CREATE
exports.createUser = async (req, res) => {
    try {
        const { nama, email, password, role } = req.body; // PERBAIKAN: name -> nama
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ nama, email, password: hashedPassword, role });
        res.status(201).json({ message: "User berhasil dibuat!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE (Dengan Validasi Role)
exports.updateUser = async (req, res) => {
    try {
        const { nama, email, role, password } = req.body; // PERBAIKAN: name -> nama
        const user = await User.findByPk(req.params.id);

        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        if (role && role !== user.role) {
            // Karena ini dipanggil dari route biasa tanpa cek superadmin yang ketat, 
            // pastikan pembatasan ini tetap berjalan jika req.user tersedia
            if (req.user && req.user.role !== 'superadmin') {
                return res.status(403).json({ message: 'Akses ditolak: Hanya Superadmin yang dapat mengubah role user.' });
            }
        }

        const updates = { nama, email, role }; // PERBAIKAN: name -> nama
        if (password) {
            updates.password = await bcrypt.hash(password, 10);
        }

        await user.update(updates);
        res.json({ message: "User berhasil diupdate!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// DELETE
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
        
        await user.destroy();
        res.json({ message: 'User berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};