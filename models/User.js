const { DataTypes } = require ('sequelize');
const sequelize = require('../db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  occupation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  businessName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('tenant', 'landlord'),
    defaultValue: 'tenant',
    allowNull: false,
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passwordResetTokenExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  timestamps: true,
});

User.associate = (models) => {
  User.hasMany(models.Apartment, {foreignKey: 'landlordId', as: 'apartments', onDelete: 'CASCADE'});
};

module.exports = User;


