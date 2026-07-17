import axios from 'axios';
import { config } from '../config/index.js';
import User from '../models/User.js';
import DailyIngredient from '../models/DailyIngredient.js';
import Ingredient from '../models/Ingredient.js';
import { FoodPlan } from '../models/FoodPlan.js';
import { Op } from 'sequelize';

const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// 🧽 Limpieza de texto JSON de la IA
const sanitizeJsonText = (text) => {
  return text
    .replace(/(\d+)\s*(g|mg|kcal|kg|gr|cal)/gi, '$1')
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/\/\/.*|#.*$/gm, '')
    .replace(/[^\x20-\x7E\n\r\t]/g, '')
    .trim();
};

// 🔹 Buscar imagen en Pixabay
async function getFoodImage(query) {
  try {
    const url = `https://pixabay.com/api/?key=${config.pixabayApiKey}&q=${encodeURIComponent(
      query
    )}&image_type=photo&category=food&per_page=10`;

    const response = await axios.get(url);
    const hits = response.data.hits;

    if (hits && hits.length > 0) {
      const randomIndex = Math.floor(Math.random() * hits.length);
      return hits[randomIndex].webformatURL;
    } else {
      return null;
    }
  } catch (error) {
    console.error('⚠️ Error buscando imagen:', error.message);
    return null;
  }
}

export const generateFoods = async (req, res) => {
  try {
    const { idUser } = req.params;
    console.log(`Generando plan de comidas para usuario ${idUser}`);
    // 1️⃣ Buscar usuario
    const user = await User.findByPk(idUser);
    if (!user)
      return res.status(404).json({ message: 'Usuario no encontrado' });

    // 2️⃣ Buscar ingredientes del día
    const currentDate = getCurrentDate();
    const dailyIngredients = await DailyIngredient.findAll({
      where: { userId: idUser, date: { [Op.eq]: currentDate } },
      include: [{ model: Ingredient, attributes: ['name'] }],
    });

    const ingredientList = dailyIngredients
      .map((ing) => ing.Ingredient?.name)
      .filter(Boolean)
      .join(', ');

    // 3️⃣ Prompt mejorado (con cantidades y unidades)
    const prompt = `
Eres un nutricionista experto en planes personalizados.
Genera un plan de comidas en formato JSON ESTRICTO.

Datos del usuario:
- Edad: ${user.age ?? 'No especificada'}
- Peso: ${user.weight ?? 'No especificado'} kg
- Altura: ${user.height ?? 'No especificada'} m
- Nivel de actividad: ${user.activityLevel ?? 'media'}
- Objetivo físico: ${user.goal ?? 'mantener peso'}
- Calorías diarias: ${user.calorieGoal ?? 'No especificadas'} kcal

Ingredientes disponibles hoy: ${ingredientList || 'Ninguno'}

💡 Instrucciones adicionales:
- Cada ingrediente debe incluir su cantidad y unidad (ej: "100g de pollo", "1 taza de arroz", "1/2 aguacate").
- Usa solo ingredientes reales y comunes en Colombia.
- Las cantidades deben ser realistas (entre 50g y 300g por ingrediente).
- NO devuelvas texto fuera del JSON.

📦 Estructura JSON requerida:
{
  "desayuno": {
    "plato": "nombre del plato",
    "descripcion": "breve descripción",
    "ingredientes": ["cantidad + ingrediente", "cantidad + ingrediente"],
    "nutricion": {
      "calorias": number,
      "carbohidratos": number,
      "proteinas": number,
      "grasas": number
    }
  },
  "almuerzo": {...},
  "cena": {...}
}
`;

    // 4️⃣ Llamar a Ollama
    const aiResponse = await axios.post(
      'http://localhost:11434/api/generate',
      { model: 'llama3', prompt, stream: false },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const rawText = aiResponse.data.response || '';
    console.log('🧠 Respuesta cruda IA:', rawText);

    // 5️⃣ Extraer y limpiar JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch)
      return res.status(400).json({
        message: 'No se encontró JSON en la respuesta',
        rawResponse: rawText,
      });

    const cleanedJson = sanitizeJsonText(jsonMatch[0]);
    let planData;
    try {
      planData = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error('⚠️ Error al parsear JSON limpio:', parseError);
      return res.status(400).json({
        message: 'Error al parsear JSON incluso después de limpiarlo',
        cleanedJson,
      });
    }

    // 6️⃣ Agregar imágenes a cada plato
    for (const key of Object.keys(planData)) {
      const image = await getFoodImage(planData[key].plato);
      planData[key].imagen = image;
    }

    // 7️⃣ Guardar plan
    const savedPlan = await FoodPlan.create({
      userId: idUser,
      date: currentDate,
      content: planData,
    });

    console.log('💾 Plan de comidas guardado:', planData);

    // 8️⃣ Responder
    return res.status(200).json({
      message: '✅ Plan de comidas generado exitosamente',
      plan: planData,
      savedPlanId: savedPlan.id,
      ok: true,
    });
  } catch (error) {
    console.error('❌ Error generando plan de comidas:', error);
    return res.status(500).json({
      message: 'Error generando el plan de comidas',
      error: error.message,
      ok: false,
    });
  }
};

// ✅ Endpoint: obtener plan de comidas ya generado
export const getDailyFoodPlan = async (req, res) => {
  try {
    const { idUser } = req.params;
    const currentDate = getCurrentDate();

    // Buscar el plan de hoy del usuario
    const existingPlan = await FoodPlan.findOne({
      where: {
        userId: idUser,
        date: { [Op.eq]: currentDate },
      },
    });

    if (!existingPlan) {
      return res.status(404).json({
        ok: false,
        message:
          'No hay un plan generado para hoy. Por favor, genera uno nuevo.',
      });
    }

    // Asegurarse de devolver el contenido como objeto
    let planContent = existingPlan.content;
    if (typeof planContent === 'string') {
      try {
        planContent = JSON.parse(planContent);
      } catch (err) {
        console.warn('⚠️ No se pudo parsear el contenido JSON del plan:', err);
      }
    }

    return res.status(200).json({
      ok: true,
      message: '✅ Plan de comidas encontrado',
      plan: planContent,
      savedPlanId: existingPlan.id,
      date: existingPlan.date,
    });
  } catch (error) {
    console.error('❌ Error al obtener el plan de comidas:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener el plan de comidas',
      error: error.message,
    });
  }
};

const extractJSON = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
};

export const generateRecommendations = async (req, res) => {
  try {
    const { idUser } = req.params;

    // 1️⃣ Buscar usuario
    const user = await User.findByPk(idUser);
    if (!user)
      return res.status(404).json({ message: 'Usuario no encontrado' });

    // 2️⃣ Crear prompt dinámico con los datos del usuario
    const prompt = `
Eres un nutricionista experto en planificación alimentaria personalizada.

Con base en los siguientes datos del usuario, genera **3 posibles configuraciones nutricionales diarias** (en JSON ESTRICTO, sin texto adicional):

Datos del usuario:
- Edad: ${user.age ?? 'No especificada'}
- Peso: ${user.weight ?? 'No especificado'} kg
- Altura: ${user.height ?? 'No especificada'} m
- Nivel de actividad: ${user.activityLevel ?? 'No especificado'}
- Objetivo físico: ${user.goal ?? 'No especificado'}

Cada configuración debe incluir:
- calorias_diarias (en kcal)
- proteinas_totales (en gramos)
- carbohidratos_totales (en gramos)
- grasas_totales (en gramos)
- descripcion (una breve frase del tipo "Déficit calórico moderado para bajar de peso")
- recomendacion (una breve observación sobre hábitos o ajustes alimentarios)

📦 Formato JSON requerido:
{
  "opcion_1": {
    "calorias_diarias": 2000,
    "proteinas_totales": 120,
    "carbohidratos_totales": 250,
    "grasas_totales": 70,
    "descripcion": "Déficit calórico moderado para bajar peso",
    "recomendacion": "Incluye más vegetales y proteínas magras."
  },
  "opcion_2": {...},
  "opcion_3": {...}
}
`;

    // 3️⃣ Llamar al modelo de IA local (Ollama)
    const aiResponse = await axios.post(
      'http://localhost:11434/api/generate',
      { model: 'llama3', prompt, stream: false },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const rawText = aiResponse.data.response || '';
    console.log('🧠 Respuesta cruda IA (recomendaciones):', rawText);

    // 4️⃣ Extraer JSON limpio
    const jsonResponse = extractJSON(rawText);
    if (!jsonResponse)
      return res.status(400).json({
        message: 'No se encontró JSON en la respuesta de la IA',
        rawResponse: rawText,
      });

    const cleanedJson = sanitizeJsonText(jsonResponse);

    let recommendationsData;
    try {
      recommendationsData = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error(
        '⚠️ Error al parsear JSON limpio de recomendaciones:',
        parseError
      );
      return res.status(400).json({
        message: 'Error al parsear JSON incluso después de limpiarlo',
        cleanedJson,
      });
    }

    // 5️⃣ Devolver respuesta al cliente
    return res.status(200).json({
      ok: true,
      message: '✅ Recomendaciones generadas exitosamente',
      recommendations: Object.values(recommendationsData),
    });
  } catch (error) {
    console.error('❌ Error generando recomendaciones:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error generando recomendaciones',
      error: error.message,
    });
  }
};

export const getFoodHistory = async (req, res) => {
  try {
    const { idUser } = req.params;
    const { startDate, endDate } = req.query; // opcional: permite filtrar por fechas

    // 1️⃣ Validar usuario
    const user = await User.findByPk(idUser);
    if (!user)
      return res
        .status(404)
        .json({ ok: false, message: 'Usuario no encontrado' });

    // 2️⃣ Construir condiciones dinámicas
    const where = { userId: idUser };

    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }

    // 3️⃣ Buscar todos los planes del usuario (ordenados por fecha)
    const history = await FoodPlan.findAll({
      where,
      order: [['date', 'DESC']],
    });

    if (!history || history.length === 0) {
      return res.status(404).json({
        ok: false,
        message: 'No se encontraron planes de comidas para este usuario',
      });
    }

    // 4️⃣ Parsear contenido JSON si es necesario
    const formattedHistory = history.map((plan) => {
      let content = plan.content;
      if (typeof content === 'string') {
        try {
          content = JSON.parse(content);
        } catch (err) {
          console.warn(
            `⚠️ No se pudo parsear el contenido del plan ${plan.id}`
          );
        }
      }
      return {
        id: plan.id,
        date: plan.date,
        plan: content,
      };
    });

    // 5️⃣ Devolver respuesta
    return res.status(200).json({
      ok: true,
      message: '✅ Historial de comidas obtenido exitosamente',
      count: formattedHistory.length,
      history: formattedHistory,
    });
  } catch (error) {
    console.error('❌ Error obteniendo historial de comidas:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al obtener el historial de comidas',
      error: error.message,
    });
  }
};
