const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const db = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

db.authenticate()
    .then(() => {
        console.log('✅ Berhasil terhubung ke Database MySQL.');
    })
    .catch(err => {
        console.error('❌ Gagal terhubung ke Database:', err);
    });

module.exports = db;