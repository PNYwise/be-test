const jwt = require('jsonwebtoken');
const db = require('../models');
const config = require("../config/auth");

const User = db.User;

const authMiddleware = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, config.secret);

        const user = await User.findOne({ where: { id: decoded?.sub }, });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = {
    authMiddleware,
};