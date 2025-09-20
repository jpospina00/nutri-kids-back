import { sequelize } from '../config/database.js';
import Auth from './Auth.js';
import User from './User.js';
import Ingredient from './Ingredient.js';
import DailyIngredient from './DailyIngredient.js';
import MealPlan from './MealPlan.js';
import Meal from './Meal.js';

// Auth → Users
Auth.hasMany(User, { foreignKey: 'authId' });
User.belongsTo(Auth, { foreignKey: 'authId' });

// User → Ingredients
User.hasMany(Ingredient, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});
Ingredient.belongsTo(User, { foreignKey: 'userId' });

// User → MealPlans
User.hasMany(MealPlan, { foreignKey: 'userId', onDelete: 'CASCADE' });
MealPlan.belongsTo(User, { foreignKey: 'userId' });

// MealPlan → Meals
MealPlan.hasMany(Meal, { foreignKey: 'mealPlanId', onDelete: 'CASCADE' });
Meal.belongsTo(MealPlan, { foreignKey: 'mealPlanId' });

// User ↔ DailyIngredient ↔ Ingredient
User.hasMany(DailyIngredient, { foreignKey: 'userId', onDelete: 'CASCADE' });
DailyIngredient.belongsTo(User, { foreignKey: 'userId' });

Ingredient.hasMany(DailyIngredient, {
  foreignKey: 'ingredientId',
  onDelete: 'CASCADE',
});
DailyIngredient.belongsTo(Ingredient, { foreignKey: 'ingredientId' });

export { sequelize, Auth, User, Ingredient, DailyIngredient, MealPlan, Meal };
