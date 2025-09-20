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
  age: DataTypes.INTEGER,
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
});

export default User;
