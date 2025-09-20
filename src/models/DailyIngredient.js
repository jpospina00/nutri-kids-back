import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const DailyIngredient = sequelize.define('DailyIngredient', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  date: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW,
  },
});

export default DailyIngredient;
