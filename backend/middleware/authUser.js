const jwt = require('jsonwebtoken');
const User = require('../models/User'); // PERBAIKAN: Impor model User untuk validasi role nantinya

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if(token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if(err) return res.sendStatus(403);
        
        try {
            // PERBAIKAN: Mengambil data lengkap user agar properti .role dapat diakses di controller
            const user = await User.findByPk(decoded.userId);
            if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });

            req.userId = decoded.userId; 
            req.user = user; // Menyimpan objek user ke dalam request
            next();
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    });
};

module.exports = verifyToken;