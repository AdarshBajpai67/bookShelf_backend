'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('usersDB', {
      userID: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false
      },
      userEmail: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      userPassword: {
        type: Sequelize.STRING,
        allowNull: false
      },
      userPhoneNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      userProfilePicture: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userBio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      userLocation: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userPaymentMethod: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userCreatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('usersDB');
  }
};
