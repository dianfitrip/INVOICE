const User = require('./User');
const Invoice = require('./Invoice');
const InvoiceItem = require('./InvoiceItem');
const Kwitansi = require('./Kwitansi');
const Payment = require('./Payment');

// PENAMBAHAN: Import model ServiceItem
const ServiceItem = require('./ServiceItem'); 

// Relasi Invoice -> User
Invoice.belongsTo(User, { foreignKey: 'id_user' });
User.hasMany(Invoice, { foreignKey: 'id_user' });

// Relasi InvoiceItem -> Invoice
InvoiceItem.belongsTo(Invoice, { foreignKey: 'id_invoice' });
Invoice.hasMany(InvoiceItem, { foreignKey: 'id_invoice', as: 'items' });

// Relasi Kwitansi -> Invoice
Kwitansi.belongsTo(Invoice, { foreignKey: 'id_invoice' });
Invoice.hasOne(Kwitansi, { foreignKey: 'id_invoice' });

// Relasi Payment -> Invoice
Payment.belongsTo(Invoice, { foreignKey: 'id_invoice' });
Invoice.hasMany(Payment, { foreignKey: 'id_invoice' });

module.exports = {
    User,
    Invoice,
    InvoiceItem,
    Kwitansi,
    Payment,
    ServiceItem // PENAMBAHAN: Ekspor ServiceItem agar bisa diakses oleh Controller
};