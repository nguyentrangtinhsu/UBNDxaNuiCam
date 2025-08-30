const pool = require('../db');

exports.getRoles = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM roles ORDER BY id');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};