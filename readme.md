# NutriKids — Backend

API REST del proyecto **NutriKids**, una plataforma de nutrición infantil
asistida por IA. Este repositorio contiene el backend; la app móvil (Flutter)
vive en [nutri-kids-movil](https://github.com/jpospina00/nutri-kids-movil).

## Descripción

Gestiona usuarios, preferencias alimenticias, generación de planes de comida
y recomendaciones nutricionales personalizadas para niños, con autenticación
basada en JWT.

## Stack técnico

- **Node.js** + **Express 5**
- **PostgreSQL** con **Sequelize** (ORM)
- **JWT** para autenticación
- **Ollama (llama3)** — agente de IA local, corriendo en Docker, para generación de planes de comida y recomendaciones nutricionales
- **Pixabay API** — obtención de imágenes representativas de cada plato generado
- **Jest** + **Supertest** para testing
- **ESLint** + **Prettier** + **Husky** (lint-staged en pre-commit)

## Cómo funciona la generación de planes

1. El backend construye un prompt con los datos del usuario (edad, peso, altura,
   nivel de actividad, objetivo, ingredientes disponibles del día)
2. Envía el prompt a un modelo **llama3** corriendo localmente vía **Ollama**
   (`http://localhost:11434/api/generate`), desplegado en un contenedor Docker
3. Parsea y sanitiza la respuesta del modelo (limpieza de unidades, comas
   colgantes, texto fuera del JSON) para obtener un plan estructurado
4. Por cada plato generado, busca una imagen representativa en **Pixabay**
5. Guarda el plan en PostgreSQL y lo devuelve al cliente

## Modelo de datos

Entidades principales y sus relaciones:

- `User` — perfil del niño/cuidador
- `Auth` — credenciales, vinculado a `User` por email
- `Ingredient` — preferencias de ingredientes por usuario
- `MealPlan` → `Meal` — planes de comida generados y sus comidas individuales
- `DailyIngredient`, `FoodPlan` — seguimiento diario de consumo

## Endpoints principales

| Método  | Ruta                                      | Descripción                             | Auth |
| ------- | ----------------------------------------- | --------------------------------------- | ---- |
| `GET`   | `/api/health`                             | Health check                            | No   |
| `POST`  | `/api/auth/register`                      | Registro de usuario                     | No   |
| `POST`  | `/api/auth/login`                         | Login                                   | No   |
| `POST`  | `/api/auth/forgot-password`               | Solicitar recuperación de contraseña    | No   |
| `POST`  | `/api/auth/verify-pin`                    | Verificar PIN de recuperación           | No   |
| `POST`  | `/api/auth/reset-password`                | Restablecer contraseña                  | No   |
| `POST`  | `/api/user`                               | Crear usuario                           | Sí   |
| `GET`   | `/api/user/users-by-user`                 | Obtener usuario autenticado             | Sí   |
| `PUT`   | `/api/user/update/:idUser`                | Actualizar usuario                      | Sí   |
| `PUT`   | `/api/user/goalCalories/:idUser`          | Actualizar meta calórica                | Sí   |
| `PATCH` | `/api/user/:idUser/ingredient-preference` | Actualizar preferencias de ingredientes | Sí   |
| `POST`  | `/api/food/generate/:idUser`              | Generar plan de comidas                 | Sí   |
| `GET`   | `/api/food/plan/:idUser`                  | Obtener plan de comidas del día         | Sí   |
| `GET`   | `/api/food/recommendations/:idUser`       | Recomendaciones nutricionales           | Sí   |
| `GET`   | `/api/food/history/:idUser`               | Historial de alimentación               | Sí   |

Las rutas marcadas con auth requieren header `Authorization: Bearer <token>`.

## Variables de entorno

Crea un archivo `.env` en la raíz con:

```
PORT=3000
DB_NAME=nutrikids
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_jwt_secret
PIXABAY_API_KEY=your_pixabay_api_key
```

## Cómo ejecutar

Requisitos: Node.js, PostgreSQL, y Ollama corriendo (localmente o vía Docker)
con el modelo `llama3` disponible en `localhost:11434`.

```bash
# Levanta el modelo de IA (si usas Docker)
docker run -d -p 11434:11434 --name ollama ollama/ollama
docker exec -it ollama ollama pull llama3

# Instala dependencias y corre el backend
npm install
npm start
```

El servidor detecta y crea automáticamente la base de datos si no existe
(ver `src/config/database.js`) antes de conectar vía Sequelize.

## Tests

```bash
npm test
```

## Calidad de código

```bash
npm run lint        # Revisa el código con ESLint
npm run lint:fix     # Corrige automáticamente lo posible
npm run format       # Formatea con Prettier
```

Los hooks de Husky ejecutan lint y tests relacionados automáticamente antes
de cada commit.
