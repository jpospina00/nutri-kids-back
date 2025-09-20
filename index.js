import dotenv from 'dotenv';
import app from './src/app.js';
import { sequelize, ensureDatabaseExists } from './src/config/database.js';
import './src/models/index.js';

dotenv.config();
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Verificar/crear la base de datos
    await ensureDatabaseExists();

    // Autenticar Sequelize
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    // Sincronizar tablas
    await sequelize.sync({ alter: true });
    console.log('✅ Tablas sincronizadas.');
    console.log('📋 Modelos cargados:', Object.keys(sequelize.models));

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
  }
};

startServer();
