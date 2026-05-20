const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Invoice = db.define('Invoice', {
    id_invoice: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_user: { type: DataTypes.INTEGER, allowNull: false },
    nomor_invoice: { type: DataTypes.STRING(50), unique: true },
    tanggal_invoice: { type: DataTypes.DATEONLY, allowNull: false },
    total: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    status: {
        type: DataTypes.ENUM('Belum Dibayar', 'Menunggu Verifikasi', 'Lunas', 'Dibatalkan'),
        defaultValue: 'Belum Dibayar'
    },
    bukti_pembayaran: { type: DataTypes.STRING, allowNull: true },
    catatan: { type: DataTypes.TEXT, allowNull: true }, // PENAMBAHAN KOLOM CATATAN
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'invoices',
    timestamps: false
});

module.exports = Invoice;