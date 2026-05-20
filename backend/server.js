const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import koneksi database untuk sinkronisasi
const db = require('./config/database');
require('./models/index');

const authRoutes = require('./routes/authRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes'); 
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
// PENAMBAHAN: Import route untuk item
const itemRoutes = require('./routes/itemRoutes'); 
// PENAMBAHAN: Import route untuk payment methods
const paymentMethodRoutes = require('./routes/paymentMethodRoutes');

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Daftarkan endpoint
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/items', itemRoutes);
// Daftarkan endpoint payment methods agar API bisa dipanggil
app.use('/api/payment-methods', paymentMethodRoutes);

const PORT = process.env.PORT || 5000;

// Sinkronisasi Database dengan alter: true
// Ini akan secara otomatis menambahkan kolom 'gambar' yang belum ada di tabel payment_methods
db.sync({ alter: true })
    .then(() => {
        console.log("Database tersinkronisasi dengan sukses.");
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Terjadi kesalahan saat sinkronisasi database:", err);
    });