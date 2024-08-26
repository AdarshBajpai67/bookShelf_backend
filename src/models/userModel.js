const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../database/postgresqlDB');

const User = sequelize.define('User', {
    userID: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    userPassword: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userPhoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    userProfilePicture: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userBio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    userLocation: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userPaymentMethod: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userCreatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
        tableName: 'usersDB',
        timestamps: true
});

module.exports = User;
