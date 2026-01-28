const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// const db = require('./config/database'); // Opsional jika sudah dipanggil di models/index.js
require('./models/index'); // Load relasi database

const authRoutes = require('./routes/authRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes'); // Tambah ini

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes); // Tambah endpoint ini

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});