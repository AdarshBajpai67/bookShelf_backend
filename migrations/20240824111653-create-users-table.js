"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("usersDB", {
      userID: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userEmail: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      userPassword: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userPhoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      userProfilePicture: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userBio: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      userLocation: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userPaymentMethod: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      userCreatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
    await queryInterface.addIndex("usersDB", ["userID"], { unique: true });
    await queryInterface.addIndex("usersDB", ["userName"], { unique: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex("usersDB", ["userID"]);
    await queryInterface.removeIndex("usersDB", ["userName"]);
    await queryInterface.dropTable("usersDB");
  },
};
