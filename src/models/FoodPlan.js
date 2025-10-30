import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const FoodPlan = sequelize.define('FoodPlan', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  content: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
});
