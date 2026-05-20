const { DataTypes } = require('sequelize');
const db = require('../config/database');

const PaymentMethod = db.define('PaymentMethod', {
    id_rekening: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama_bank: { type: DataTypes.STRING(100), allowNull: false },
    nomor_rekening: { type: DataTypes.STRING(100), allowNull: false },
    atas_nama: { type: DataTypes.STRING(150), allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'payment_methods',
    timestamps: false
});

module.exports = PaymentMethod;