const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/userModel");

const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = async (req, res, next) => {
  // const authHeader = req.headers.authorization;
  // if (!authHeader || !authHeader.startsWith('Bearer ')) {
  //     return res.status(401).json({ message: 'Please authenticate' });
  // }
  // console.log('Cookies: ', req.cookies);
  const token = req.cookies.token;

  // const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Please authenticate" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log('Decoded: ', decoded);
    const user = await User.findByPk(decoded.userID);
    // req.user = { id: decoded.userID, username: decoded.username };
    if (!user) {
      return res.status(401).json({ message: "Please authenticate" });
    }
    req.user = user;
    // console.log('Authenticated user: ', req.user);
    next();
  } catch (err) {
    console.log("Error: ", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
