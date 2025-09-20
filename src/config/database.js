import { Sequelize } from 'sequelize';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT } = process.env;

// Paso 1: Crear conexión temporal solo al servidor (sin especificar DB_NAME)
const ensureDatabaseExists = async () => {
  const client = new pg.Client({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    port: DB_PORT,
    database: 'postgres', // siempre existe
  });

  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`
    );

    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`✅ Base de datos ${DB_NAME} creada.`);
    } else {
      console.log(`ℹ️ Base de datos ${DB_NAME} ya existe.`);
    }
  } catch (error) {
    console.error('❌ Error verificando/creando la base de datos:', error);
  } finally {
    await client.end();
  }
};

// Paso 2: conexión normal con Sequelize (ya usando la BD correcta)
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: false,
});

export { sequelize, ensureDatabaseExists };
