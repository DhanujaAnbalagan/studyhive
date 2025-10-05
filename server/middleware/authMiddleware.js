const jwt = require('jsonwebtoken');
const User = require('../models/User'); 


const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // userid token
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
