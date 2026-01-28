const db = require('../config/database');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');
const User = require('./User');
const Payment = require('./Payment');
const Kwitansi = require('./Kwitansi');

User.hasMany(Invoice, { foreignKey: 'id_user' });
Invoice.belongsTo(User, { foreignKey: 'id_user' });

Invoice.hasMany(InvoiceItem, { foreignKey: 'id_invoice', as: 'items' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'id_invoice' });

Invoice.hasMany(Payment, { foreignKey: 'id_invoice' });
Payment.belongsTo(Invoice, { foreignKey: 'id_invoice' });

Invoice.hasOne(Kwitansi, { foreignKey: 'id_invoice' });
Kwitansi.belongsTo(Invoice, { foreignKey: 'id_invoice' });

module.exports = {
    db,
    User,
    Invoice,
    InvoiceItem,
    Payment,
    Kwitansi
};