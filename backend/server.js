const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
require('./models/index');

const authRoutes = require('./routes/authRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes'); 
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');


const app = express();

app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/api/users', userRoutes);
dotenv.config();

app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});