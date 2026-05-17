const { ServiceItem } = require('../models');

exports.getItems = async (req, res) => {
    try {
        const items = await ServiceItem.findAll();
        res.json(items);
    } catch (error) {
        res.status(500).json({ msg: "Gagal memuat item." });
    }
};

exports.createItem = async (req, res) => {
    try {
        const { nama_item, harga } = req.body;
        await ServiceItem.create({ nama_item, harga });
        res.status(201).json({ msg: "Item berhasil ditambahkan!" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal menambah item." });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const item = await ServiceItem.findByPk(req.params.id);
        if(!item) return res.status(404).json({ msg: "Item tidak ditemukan." });
        
        await item.update(req.body);
        res.json({ msg: "Item berhasil diupdate!" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal mengupdate item." });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const item = await ServiceItem.findByPk(req.params.id);
        if(!item) return res.status(404).json({ msg: "Item tidak ditemukan." });
        
        await item.destroy();
        res.json({ msg: "Item berhasil dihapus!" });
    } catch (error) {
        res.status(500).json({ msg: "Gagal menghapus item." });
    }
};