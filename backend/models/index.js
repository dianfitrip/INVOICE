const User = require('./User');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');
const Payment = require('./Payment');
const Kwitansi = require('./Kwitansi');


User.hasMany(Invoice, { foreignKey: 'id_user' });
Invoice.belongsTo(User, { foreignKey: 'id_user' });

Invoice.hasMany(InvoiceItem, { foreignKey: 'id_invoice', onDelete: 'CASCADE' });
InvoiceItem.belongsTo(Invoice, { foreignKey: 'id_invoice' });

Invoice.hasMany(Payment, { foreignKey: 'id_invoice', onDelete: 'CASCADE' });
Payment.belongsTo(Invoice, { foreignKey: 'id_invoice' });

Invoice.hasOne(Kwitansi, { foreignKey: 'id_invoice', onDelete: 'CASCADE' });
Kwitansi.belongsTo(Invoice, { foreignKey: 'id_invoice' });

module.exports = {
    User,
    Invoice,
    InvoiceItem,
    Payment,
    Kwitansi
};