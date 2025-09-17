const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const leave_requests = sequelize.define(
    'leave_requests',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

date: {
        type: DataTypes.DATE,

      },

reason: {
        type: DataTypes.TEXT,

      },

status: {
        type: DataTypes.ENUM,

        values: [

"pending",

"approved",

"rejected"

        ],

      },

      importHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
      },
    },
    {
      timestamps: true,
      paranoid: true,
      freezeTableName: true,
    },
  );

  leave_requests.associate = (db) => {

    db.leave_requests.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.leave_requests.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return leave_requests;
};

