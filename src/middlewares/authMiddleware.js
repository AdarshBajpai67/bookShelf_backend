const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Please authenticate' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Please authenticate' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded: ', decoded);
        req.user = { id: decoded.userID, username: decoded.username };
        console.log('Authenticated user: ', req.user);
        next();
    } catch (err) {
        console.log('Error: ', err);
        return res.status(401).json({ message: 'Please authenticate' });
    }
};

const checkBlacklist = (req, res, next) => {
    res.clearCookie("token"); // Assuming token is stored in a cookie
    return res.status(200).json({ message: "Logged out successfully" });
};


module.exports = {authMiddleware, checkBlacklist};
