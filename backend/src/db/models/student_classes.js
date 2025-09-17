const config = require('../../config');
const providers = config.providers;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const moment = require('moment');

module.exports = function(sequelize, DataTypes) {
  const student_classes = sequelize.define(
    'student_classes',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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

  student_classes.associate = (db) => {

    db.student_classes.belongsTo(db.users, {
      as: 'createdBy',
    });

    db.student_classes.belongsTo(db.users, {
      as: 'updatedBy',
    });
  };

  return student_classes;
};

