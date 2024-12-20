const config = require('../../config/config.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Apartment = require('../../models/Apartment');
const Admin = require('../../models/Admin');
const User = require('../../models/User');


const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// @desc POST Create First Admin
// @route POST /v1/admin/first
// @access Private
const createFirstAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const firstAdmin = await Admin.findOne({ 
      where: { 
        role: 'firstAdmin', 
      } 
    });

    if (firstAdmin) {
      return res.status(400).json({ 
        message: 'First admin already created.', 
      });
    } 

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the first admin user
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: 'firstAdmin',
    });

    res.status(201).json({
      message: 'First admin created successfully',
      admin: admin,
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message, 
    });
  }
};

// @desc POST Creates Admin
// @route POST /v1/admin
// @access Private
const createAdminHandler = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }
  
    if (typeof email !== 'string') {
      return res.status(400).json({
        message: 'Email must be a string',
      });
    }
  
    if (typeof password !== 'string') {
      return res.status(400).json({
        message: 'Password must be a string',
      });
    }
      
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }
  
    const existingAdmin = await Admin.findOne({
      where: {
        email,
      }
    });
  
    if (existingAdmin) {
      return res.status(400).json({
        message: 'Admin already exists with this email.',
      });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
  
    const admin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    });
  
    return res.status(201).json({
      message: 'Admin successfully created',
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      }
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

// @desc POST Login Admin
// @route POST /v1/admin/login
// @access Public
const loginAdminHandler = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      message: 'Email and password are required',
    })
  }
  
  const admin = await Admin.findOne({ 
    where: { 
      email 
    } 
  });

  if (!admin) {
    return res.status(401).json({
      message: 'Invalid email or password',
    });
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      message: 'Invalid password',
    });
  }

  const payload = {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  };

  const adminToken = jwt.sign(payload, config.jwtSecret, { expiresIn: '1d' });
  
  res.status(200).json({
    message: "Login Successful",
    adminToken,
  });
};

// @desc GET View Apartment Listing By Admin
// @route GET /v1/admin/pending-listings
// @access Private
const viewPendingListings = async (req, res) => {
  try {
    const pendingListings = await Apartment.findAll({
      where: {
        status: 'pending'
      }
    });

    return res.status(200).json({
      message: 'Pending Listings retrieved successfully',
      pendingListings
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

// @desc PUT Approve pending listen Listing By Admin
// @route PUT /v1/admin/approve-listings/:id
// @access Private
const approvePendingListing = async (req, res) => {
  try {
    const { id } = req.params;
    const apartment = await Apartment.findByPk(id);
    if (!apartment) {
      return res.status(404).json({ 
        message: 'Apartment not found' 
      });
    }

    await apartment.update({ status: 'approved' });

    return res.status(200).json({ 
      message: 'Apartment approved successfully', 
      apartment 
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
}

// @desc PUT Reject pending listen Listing By Admin
// @route PUT /v1/admin/reject-listings/:id
// @access Private
const rejectPendingListing = async (req, res) => {
  try {
    const { id } = req.params;
    const apartment = await Apartment.findByPk(id);
    if (!apartment) {
      return res.status(404).json({ 
        message: 'Apartment not found' 
      });
    }

    await apartment.update({ 
      status: 'rejected' 
    });

    res.status(200).json({ 
      message: 'Apartment rejected successfully', 
      apartment 
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};

// @desc PUT Update sold status to true By Admin
// @route PUT /v1/admin/sold/:id
// @access Private
const markListingAsSold = async (req, res) => {
  try {
    const { id } = req.params;

    const apartment = await Apartment.findByPk(id);

    if (!apartment) {
      return res.status(404).json({ 
        message: 'Apartment not found' 
      });
    } 

    if (apartment.status !== 'approved') {
      return res.status(400).json({ 
        message: 'Only approved apartments can be marked as sold' 
      });
    }

    await apartment.update({ 
      apartmentSold: true 
    });

    res.status(200).json({ 
      message: 'Apartment marked as sold', 
      apartment 
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};

// @desc DELETE Delete A User Account
// @route PUT /v1/admin/delete/:id
// @access Private
const deleteUserAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    await user.destroy();

    return res.status(200).json({ 
      message: 'User account deleted successfully' 
    });
  } catch (error) {
    res.status(500).json({
      message: error.message 
    });
  }
};

module.exports = {
  createFirstAdmin,
  createAdminHandler,
  loginAdminHandler,
  viewPendingListings,
  approvePendingListing,
  rejectPendingListing,
  markListingAsSold,
  deleteUserAccount
}