const authLandlord = (req, res, next) => {
  if (req.user.role !== 'landlord') {
    return res.status(403).json({ 
      message: 'Access denied' 
    });
  }
  next();
};

module.exports = authLandlord;