const { DataTypes } = require('sequelize');
const db = require('../config/database');

const InvoiceItem = db.define('InvoiceItem', {
    id_item: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    id_invoice: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    deskripsi: {
        type: DataTypes.STRING(255)
    },
    qty: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    harga: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    },
    subtotal: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false
    }
}, {
    tableName: 'invoice_items',
    timestamps: false
});

module.exports = InvoiceItem;