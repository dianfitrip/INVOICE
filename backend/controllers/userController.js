const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize'); // Sesuaikan jika menggunakan Mongoose, kode ini untuk Sequelize

// READ & SEARCH
exports.getUsers = async (req, res) => {
    try {
        const search = req.query.search || '';
        const users = await User.findAll({
            where: {
                name: { [Op.like]: `%${search}%` } // Search berdasarkan nama
            },
            attributes: { exclude: ['password'] } // Jangan kirim password ke frontend
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// CREATE
exports.createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, role });
        res.status(201).json({ message: "User berhasil dibuat!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// UPDATE (Dengan Validasi Role)
exports.updateUser = async (req, res) => {
    try {
        const { name, email, role, password } = req.body;
        const user = await User.findByPk(req.params.id);

        if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

        // LOGIKA PEMBATASAN ROLE:
        // Jika role diubah, dan yang login BUKAN superadmin, tolak permintaan
        if (role && role !== user.role) {
            if (req.user.role !== 'superadmin') {
                return res.status(403).json({ message: 'Akses ditolak: Hanya Superadmin yang dapat mengubah role user.' });
            }
        }

        const updates = { name, email, role };
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