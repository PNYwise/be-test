const jwt = require('jsonwebtoken');
const db = require('../models');
const config = require('../config/auth')
const User = db.User;

// JWT Authentication Middleware for WebSocket
const wsAuthMiddleware = async (ws, req, next) => {
    try {
        const token = req.headers['sec-websocket-protocol'];
        if (!token) {
            ws.close(4001, 'No token provided');
            return;
        }

        const decoded = jwt.verify(token, config.secret);

        const user = await User.findOne({ where: { id: decoded.sub } });
        if (!user) {
            ws.close(4001, 'User not found');
            return;
        }

        req.user = user;
        next();
    } catch (err) {
        ws.close(4001, 'Invalid token');
    }
};

module.exports = {
    wsAuthMiddleware,
};
