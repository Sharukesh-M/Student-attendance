const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const attendance_events = sequelize.define(
    'attendance_events',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },

timestamp: {
        type: DataTypes.DATE,

      },

status: {
        type: DataTypes.ENUM,

        values: [

"present",

"absent",

"late"

        ],

      },

method: {
        type: DataTypes.ENUM,

        values: [

"face_recognition",

"manual_override"

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

  attendance_events.associate = (db) => {

    db.attendance_events.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.attendance_events.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return attendance_events;
};

