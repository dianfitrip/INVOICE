const { DataTypes } = require('sequelize');
const db = require('../config/database');

const Kwitansi = db.define('Kwitansi', {
    id_kwitansi: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_invoice: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nomor_kwitansi: {
        type: DataTypes.STRING(50),
        unique: true
    },
    tanggal_kwitansi: {
        type: DataTypes.DATEONLY
    },
    file_pdf: {
        type: DataTypes.STRING(255)
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'kwitansi',
    timestamps: false
});

module.exports = Kwitansi;