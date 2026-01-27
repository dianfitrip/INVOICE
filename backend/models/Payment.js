const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Payment = db.define('Payment', {
    id_pembayaran: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_invoice: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    tanggal_bayar: {
        type: DataTypes.DATEONLY
    },
    bukti_pembayaran: {
        type: DataTypes.STRING(255)
    },
    status_verifikasi: {
        type: DataTypes.ENUM('Menunggu', 'Valid', 'Ditolak'),
        defaultValue: 'Menunggu'
    },
    catatan_admin: {
        type: DataTypes.TEXT
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'pembayaran',
    timestamps: false
});

module.exports = Payment;