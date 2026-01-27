const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');
const authRoutes = require('./routes/authRoutes'); // Import Route Auth

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Agar bisa baca JSON dari frontend

// Routing
app.use('/api/auth', authRoutes); // Endpoint jadi: http://localhost:5000/api/auth/register

// Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});