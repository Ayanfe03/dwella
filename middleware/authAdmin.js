
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const config = require('../config/config');

const adminValidateToken = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({
        message: 'Authorization header is required',
      });
    }
    const token = req.headers.authorization.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Invalid Token',
      });
    }

    const payload = jwt.verify(token, config.jwtSecret);
    if (!payload) {
      return res.status(401).json({
        message: 'Invalid Token',
      });
    }

    const admin = await Admin.findByPk(payload.id);
    if (!admin) {
      return res.status(401).json({
        message: 'Error fetching user',
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = adminValidateToken;