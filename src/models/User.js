import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

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
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'Auths', // nombre de la tabla (plural por convención)
      key: 'email',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  age: DataTypes.INTEGER,
  height: {
    type: DataTypes.FLOAT, // o DECIMAL(5,2) si prefieres más precisión
    allowNull: true,
    comment: 'Altura en metros o centímetros según el sistema elegido',
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Peso en kilogramos',
  },
  allergies: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  likes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  dislikes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },

  activityLevel: {
    type: DataTypes.ENUM('baja', 'media', 'alta', 'muy alta'),
    allowNull: false,
    defaultValue: 'media',
  },
  createdByAuthEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'Auths',
      key: 'email',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
});

export default User;
