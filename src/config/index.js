import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  db: {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
  },
  jwtSecret: process.env.JWT_SECRET || 'changeme',
  pixabayApiKey: process.env.PIXABAY_API_KEY || 'your_pixabay_api_key',
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
};
