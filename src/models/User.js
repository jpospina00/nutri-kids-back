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
    references: { model: 'Auths', key: 'email' },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  age: DataTypes.INTEGER,
  height: {
    type: DataTypes.FLOAT,
    comment: 'Altura en metros o centímetros',
  },
  weight: {
    type: DataTypes.FLOAT,
    comment: 'Peso en kilogramos',
  },
  activityLevel: {
    type: DataTypes.ENUM('baja', 'media', 'alta', 'muy alta'),
    allowNull: false,
    defaultValue: 'media',
  },

  // 🔹 Preferencias y restricciones
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

  // 🔹 🔥 NUEVA SECCIÓN: Plan nutricional base
  calorieGoal: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Calorías recomendadas por día',
  },
  goal: {
    type: DataTypes.ENUM('mantener', 'bajar', 'subir'),
    defaultValue: 'mantener',
    allowNull: false,
    comment: 'Objetivo físico del usuario',
  },

  createdByAuthEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    references: { model: 'Auths', key: 'email' },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  },
});

export default User;
