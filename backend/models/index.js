const db = require('../config/database');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');
const User = require('./User');

User.hasMany(Invoice, { foreignKey: 'id_user' });
Invoice.belongsTo(User, { foreignKey: 'id_user' });

Invoice.hasMany(InvoiceItem, { foreignKey: 'id_invoice', as: 'items' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'id_invoice' });

module.exports = {
    db,
    User,
    Invoice,
    InvoiceItem
};