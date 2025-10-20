import { sequelize } from '../config/database.js';
import Auth from './Auth.js';
import User from './User.js';
import Ingredient from './Ingredient.js';
import DailyIngredient from './DailyIngredient.js';
import MealPlan from './MealPlan.js';
import Meal from './Meal.js';

// 🔹 Auth ↔ User (relación 1:1 o 1:N, según tu caso)
// Como la FK es 'email', no 'authId'
Auth.hasMany(User, { foreignKey: 'email' });
User.belongsTo(Auth, { foreignKey: 'email' });

// 🔹 User → Ingredients
User.hasMany(Ingredient, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Ingredient.belongsTo(User, { foreignKey: 'userId' });

// 🔹 User → MealPlans
User.hasMany(MealPlan, { foreignKey: 'userId', onDelete: 'CASCADE' });
MealPlan.belongsTo(User, { foreignKey: 'userId' });

// 🔹 MealPlan → Meals
MealPlan.hasMany(Meal, { foreignKey: 'mealPlanId', onDelete: 'CASCADE' });
Meal.belongsTo(MealPlan, { foreignKey: 'mealPlanId' });

// 🔹 User ↔ DailyIngredient ↔ Ingredient
User.hasMany(DailyIngredient, { foreignKey: 'userId', onDelete: 'CASCADE' });
DailyIngredient.belongsTo(User, { foreignKey: 'userId' });

Ingredient.hasMany(DailyIngredient, {
  foreignKey: 'ingredientId',
  onDelete: 'CASCADE',
});
DailyIngredient.belongsTo(Ingredient, { foreignKey: 'ingredientId' });

Auth.hasMany(User, { foreignKey: 'createdByAuthEmail', onDelete: 'CASCADE' });
User.belongsTo(Auth, { foreignKey: 'createdByAuthEmail' });

export { sequelize, Auth, User, Ingredient, DailyIngredient, MealPlan, Meal };
