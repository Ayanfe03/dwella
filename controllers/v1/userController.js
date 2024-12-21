const bcrypt = require('bcrypt');
const config = require('../../config/config');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const sendGmail = require('../../utils/email');
const sendpasswordResetEmail = require('../../utils/passwordReset');


const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// @desc POST Creates User: Tenant
// @route POST /v1/users/register/tenant
// @access Public
const createTenantHandler = async (req, res) => {
  try {
    let { name, phoneNumber, occupation, nationality, gender, email, password, role, businessName } = req.body;
    const lowerCaseGender = gender.toLowerCase();

    if (!name || !phoneNumber || !occupation || !nationality || !gender || !email || !password || !role) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }

    if (typeof name !== 'string') {
      return res.status(400).json({
        message: 'Name must be a string',
      });
    }

    if (typeof occupation !== 'string') {
      return res.status(400).json({
        message: 'Occupation must be a string',
      });
    }

    if (typeof gender !== 'string') {
      return res.status(400).json({
        message: 'Gender must be a string',
      });
    } else if (lowerCaseGender !== 'male' && lowerCaseGender !== 'female' ) {
      res.status(400).json({ message: 'Gender must be either male or female' });
      return;
    }

    if (typeof email !== 'string') {
      return res.status(400).json({
        message: 'Email must be a string',
      });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    if (role === 'tenant' && businessName) {
      return res.status(400).json({
        message: 'Tenants cannot set business names',
      })
    }

    if (role === 'tenant' && businessName == '') {
      return res.status(400).json({
        message: 'Tenants cannot set business names',
      })
    }    

    const existingUser = await User.findOne({
      where: {
        email,
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email is already in use'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const emailVerificationToken = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    const user = await User.create({
      name,
      phoneNumber,
      occupation,
      nationality,
      gender,
      email,
      password: hashedPassword,
      role: 'tenant',
      isEmailVerified: false,
      emailVerificationToken
    });

    sendGmail(email, emailVerificationToken);

    return res.status(201).json({
      message: 'Signup succesful, please check your email for verification',
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      occupation: user.occupation,
      nationality: user.nationality,
      gender: user.gender,
      email: user.email,
      role: user.role,
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}


// @desc POST Creates User: Landlord
// @route POST /v1/users/register/landlord
// @access Public
const createLandlordHandler = async (req, res) => {
  try {
    let { name, phoneNumber, occupation, nationality, gender, email, businessName, password, role } = req.body;
    const lowerCaseGender = gender.toLowerCase();

    if (!name || !phoneNumber || !occupation || !nationality || !gender || !email || !password || !role) {
      return res.status(400).json({
        message: 'All fields except Business Name are required',
      });
    }

    if (typeof name !== 'string') {
      return res.status(400).json({
        message: 'Name must be a string',
      });
    }

    if (typeof occupation !== 'string') {
      return res.status(400).json({
        message: 'Occupation must be a string',
      });
    }

    if (typeof gender !== 'string') {
      return res.status(400).json({
        message: 'Gender must be a string',
      });
    } else if (lowerCaseGender !== 'male' && lowerCaseGender !== 'female' ) {
      res.status(400).json({ message: 'Gender must be either male or female' });
      return;
    }

    if (typeof email !== 'string') {
      return res.status(400).json({
        message: 'Email must be a string',
      });
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    if (role === 'landlord' && businessName === undefined) {
      return res.status(400).json({
        message: 'Business names must either be empty or filled. They can not be undefined',
      })
    }

    const existingUser = await User.findOne({
      where: {
        email,
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'Email is already in use'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const emailVerificationToken = jwt.sign({ email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

    const user = await User.create({
      name,
      phoneNumber,
      occupation,
      nationality,
      gender,
      email,
      businessName,
      password: hashedPassword,
      role: 'landlord',
      isEmailVerified: false,
      emailVerificationToken
    });

    sendGmail(email, emailVerificationToken);

    return res.status(201).json({
      message: 'Signup succesful, please check your email for verification',
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      occupation: user.occupation,
      nationality: user.nationality,
      gender: user.gender,
      email: user.email,
      businessName: user.businessName,
      role: user.role,
    })

  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

// @desc GET Verify User Email
// @route GET /v1/users/verify-email
// @access Public
const verifyEmailHandler = async (req, res) => {
  const emailVerificationToken = req.query.emailVerificationToken;

  try {

    const payload = jwt.verify(emailVerificationToken, process.env.JWT_SECRET_KEY);
    const email = payload.email;

    const user = await User.findOne({
      where: {
        email,
        emailVerificationToken,
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found or token is invalid',
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await user.save();

    return res.status(200).json({
      message: "✅ Email verified successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    })
  }
}

// @desc POST Login User
// @route POST /v1/users/login
// @access Public
const loginUserHandler = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      message: 'Email and password are required',
    })
  }
  
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({
      message: 'Invalid email or password',
    });
  }

  if (!user.isEmailVerified) {
    return res.status(401).json({
      message: 'Please verify your email before logging in'
    })
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({
      message: 'Invalid password',
    });
  }

  const payload = {
    id: user.id,
    email: user.email
  };

  const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '3d' });
  
  res.status(200).json({
    message: "Login Successful",
    token,
  });
};

// @desc POST User Password Reset Request
// @route POST /v1/users/password-reset-request
// @access Public 
const passwordResetRequestHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required!'
      })
    }

    const user = await User.findOne({
      where: {
        email,
      }
    });

    if (!user) {
      return res.status(400).json({
        message: 'User not found'
      })
    }

    const passwordResetToken = jwt.sign({ userId: user.id }, config.jwtSecret, { expiresIn: '15m'});

    user.passwordResetToken = passwordResetToken;
    user.passwordResetTokenExpires = new Date(Date.now() + 900000);
    await user.save();

    await sendpasswordResetEmail(user.email, passwordResetToken);

    res.status(200).json({
      message: "Password reset email sent",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

// @desc POST Password Reset for User
// @route POST /v1/users/password-reset
// @access Public 
const passwordResetHandler = async (req, res) => {
  
  try {
    const passwordResetToken = req.query.passwordResetToken
    const { newPassword } = req.body;

    if (!newPassword) {
      res.status(400).json({
        message: 'A new password is required',
      });
    }

    const payload = jwt.verify(passwordResetToken, process.env.JWT_SECRET_KEY);
    const userId = payload.userId;

    const user = await User.findOne({
      where: {
        id: userId,
        passwordResetToken
      }
    })

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (new Date() > user.passwordResetTokenExpires) {
      return res.status(400).json({
        message: 'Password reset token has expired'
      })
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    const compareWithOldPassword = await bcrypt.compare(newPassword, user.password);

    if(compareWithOldPassword) {
      return res.status(400).json({
        message: 'New password cannot be the same as old password',
      })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;
    await user.save();

    res.status(200).json({
      message: "✅ Password Successfully Reset!",
    });
  } catch(error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}



module.exports = {
  createTenantHandler,
  createLandlordHandler,
  verifyEmailHandler,
  loginUserHandler,
  passwordResetRequestHandler,
  passwordResetHandler
}