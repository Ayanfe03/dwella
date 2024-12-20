const adminCheck = (req, res, next) => {
  if (req.admin.role !== 'firstAdmin' || req.admin.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied' 
    });
  }
  next();
};

module.exports = adminCheck;