import fetch from 'node-fetch';
import axios from 'axios';
import { config } from '../config/index.js';

export const generateFoods = async (req, res) => {
  // Lógica para generar alimentos
  const { idUser } = req.params;
  console.log('Generando alimentos para usuario:', idUser);
  const edad = 21;
  const alergias = ['maní', 'leche', 'huevo'];
  const gustos = ['frutas', 'verduras', 'arroz'];
  const noGusta = ['pan'];
  const actividad = 'muy alta';
  const prompt = `
Eres un nutricionista especializado en niños pero igual recomiendas también a jovenes, adolecentes y adultos.
Genera un plan de comidas (desayuno, almuerzo y cena) para una persona según estos datos:
Responde siempre en español de Colombia, sin inventar palabras.
Usa solo ingredientes reales y comunes en Colombia.

Edad: ${edad} años
Alergias: ${alergias.join(', ') || 'ninguna'}
Le gusta: ${gustos.join(', ') || 'ninguno'}
No le gusta: ${noGusta.join(', ') || 'ninguno'}
Nivel de actividad física: ${actividad}
Pais: colombia

Requisitos:
- Usa nombres de ingredientes concretos y comunes en Colombia (ej. pechuga de pollo, arroz blanco, yuca, plátano, fríjoles).
- Usa ingredientes comunes en Colombia, evita recetas exóticas o inventadas.
- Incluye proteína (pollo, pescado, huevo o legumbres).
- Escribe los ingredientes en español claro y simple (ejemplo: “pechuga de pollo a la plancha”, “arroz blanco”, “banano”).
- Nunca inventes ni traduzcas mal ingredientes.
- No uses bebidas alcohólicas ni nombres extraños.
- Usa máximo 5 a 7 ingredientes simples.
- Balancea el plato para un niño entre 400–600 kcal.
- No uses lo que aparece en "alergias" o "no le gusta" ni derivados.
- Hazlo sencillo de preparar en casa.

Dame la respuesta en JSON con este formato:
{desayuno: {...}, almuerzo: {...}, cena: {...}}
Cada comida debe tener este formato:
{
  "plato": "nombre del plato",
  "descripcion": "breve descripción",
  "ingredientes": ["lista", "de", "ingredientes"],
  "nutricion": {
    "calorias": number,
    "carbohidratos": number,
    "proteinas": number,
    "grasas": number
  }
}
  Ejemplo de salida válida:
{
  "desayuno": {
    "plato": "Huevos revueltos con tomate y arepa",
    "descripcion": "Huevos revueltos con tomate fresco acompañados de una arepa.",
    "ingredientes": ["2 huevos", "1 tomate", "1 arepa", "1 cucharadita de aceite"],
    "nutricion": {
      "calorias": 350,
      "carbohidratos": 30,
      "proteinas": 20,
      "grasas": 15
    }
  },
  "almuerzo": {
    "plato": "Pechuga de pollo a la plancha con arroz y ensalada",
    "descripcion": "Pechuga de pollo a la plancha acompañada de arroz blanco y ensalada fresca.",
    "ingredientes": ["150g pechuga de pollo", "1 taza de arroz blanco", "1 taza de ensalada (lechuga, tomate)", "1 cucharadita de aceite"],
    "nutricion": {
      "calorias": 600,
      "carbohidratos": 70,
      "proteinas": 40,
      "grasas": 10
    }
  },
  "cena": {
    "plato": "Sopa de verduras con tostadas",
    "descripcion": "Sopa ligera de verduras acompañada de tostadas integrales.",
    "ingredientes": ["1 taza de sopa de verduras", "2 tostadas integrales", "1 cucharadita de aceite"],
    "nutricion": {
      "calorias": 400,
      "carbohidratos": 50,
      "proteinas": 15,
      "grasas": 10
    }
  }
}

    `;
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3',
      prompt: prompt,
      stream: false,
    }),
  });

  const data = await response.json();

  // 🔹 2. Limpiar y parsear JSON
  // Limpiar cosas extra
  let texto = data.response
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  // Capturar TODOS los bloques entre llaves
  const matches = texto.match(/\{[\s\S]*\}/g);
  let plan = null;

  if (matches) {
    for (const m of matches) {
      try {
        plan = JSON.parse(m); // intentar parsear
        break; // si funciona, salimos
      } catch (e) {
        continue; // si falla, probamos con el siguiente
      }
    }
  }

  if (!plan) {
    console.error('No se encontró JSON válido');
    console.log('Texto crudo:', texto);
    return;
  }

  // 🔹 3. Agregar imágenes
  for (const key of Object.keys(plan)) {
    const image = await getFoodImage(plan[key].plato);
    plan[key].imagen = image;
  }
  console.log(plan);
  res
    .status(200)
    .json({ message: 'Alimentos generados exitosamente', ok: true, plan });
};

async function getFoodImage(query) {
  try {
    const url = `https://pixabay.com/api/?key=${config.pixabayApiKey}&q=${encodeURIComponent(
      query
    )}&image_type=photo&category=food&per_page=10`;

    const response = await axios.get(url);
    const hits = response.data.hits;

    if (hits && hits.length > 0) {
      const randomIndex = Math.floor(Math.random() * hits.length);
      return hits[randomIndex].webformatURL; // imagen aleatoria
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error buscando imagen:', error.message);
    return null;
  }
}
