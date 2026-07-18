const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const officer = (req, res, next) => {
  if (req.user && req.user.role === 'officer') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an officer' });
  }
};

const authority = (req, res, next) => {
  if (req.user && req.user.role === 'authority') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as a higher authority' });
  }
};

module.exports = { protect, officer, authority };
