import jwt from 'jsonwebtoken';
import User from "../models/User.js";


export const protect = (req, res, next) => {
  const token = req.headers['x-auth-token'] || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};



export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ msg: 'Not authenticated' });

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access forbidden: insufficient rights' });
    }

    next();
  };
};
