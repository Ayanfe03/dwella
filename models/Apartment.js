const { DataTypes } = require ('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Apartment = sequelize.define('Apartment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rentAmount: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  landlordId: {
    type: DataTypes.UUID,
    references: {
      model: User,
      key: 'id'
    },
  },
  imagePath: {
    type: DataTypes.STRING,
    allowNull: false, 
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false,
  },
  apartmentSold: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, 
    allowNull: false,
  }
}, {
  timestamps: true,
});

Apartment.belongsTo(User, { foreignKey: 'landlordId', as: 'landlord' });

module.exports = Apartment;


