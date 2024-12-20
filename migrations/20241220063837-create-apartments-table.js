'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.createTable('Apartments', {
     id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      rentAmount: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      roomNumber: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      landlordId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id'
        },
      },
      imagePath: {
        type: Sequelize.STRING,
        allowNull: false, 
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false,
      },
      apartmentSold: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, 
        allowNull: false,
      }
   })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Apartments');     
  }
};
