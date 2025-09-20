import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Meal = sequelize.define('Meal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM('desayuno', 'almuerzo', 'cena'),
    allowNull: false,
  },
  dish: DataTypes.STRING,
  description: DataTypes.TEXT,
  ingredients: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  nutrition: {
    type: DataTypes.JSONB, // {calorias, carbos, proteinas, grasas}
    allowNull: false,
  },
  image: DataTypes.STRING,
});

export default Meal;
