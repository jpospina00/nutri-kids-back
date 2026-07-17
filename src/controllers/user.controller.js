import User from '../models/User.js';

export const getUserById = async (req, res) => {
  try {
    // 🔹 id y email vienen del token
    const { id, email } = req.user;
    console.log(`Buscando usuario con id: ${id} y email: ${email}`);
    // 🔹 Buscar el perfil principal del usuario autenticado
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
      console.log('Usuario no encontrado');
      return res
        .status(404)
        .json({ message: 'Usuario no encontrado', ok: false });
    }

    // 🔹 Buscar usuarios creados por él
    const usersCreated = await User.findAll({
      where: { createdByAuthEmail: email },
    });

    const totalUsers = [user, ...usersCreated];
    console.log(`Usuarios encontrados para ${email}:`, totalUsers.length);
    res.json({ users: totalUsers, ok: true });
  } catch (error) {
    console.error('Error al obtener usuario por token:', error);
    res.status(500).json({ message: 'Error al obtener usuario', ok: false });
  }
};

export const updateIngredientPreference = async (req, res) => {
  try {
    const { idUser } = req.params;
    const { ingredients, action } = req.body;
    console.log(
      `Actualizando preferencia de ingredientes para usuario ${idUser}:`,
      {
        ingredients,
        action,
      }
    );
    if (
      !Array.isArray(ingredients) ||
      ingredients.length === 0 ||
      !['like', 'dislike'].includes(action)
    ) {
      return res.status(400).json({
        ok: false,
        message:
          'Debes enviar un array de ingredientes y una acción: like o dislike',
      });
    }

    // 🔍 Buscar usuario
    const user = await User.findByPk(idUser);
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }

    let likes = user.likes || [];
    let dislikes = user.dislikes || [];

    const cleanIngredients = ingredients.map((item) => {
      // Quita números al inicio (con o sin "de"), y espacios extra
      return item.replace(/^\s*\d+\s*(de\s*)?/i, '').trim();
    });

    console.log('🧪 Ingredientes normalizados:', cleanIngredients);

    // ✅ Acción: LIKE
    if (action === 'like') {
      // 🧹 Quitar ingredientes de dislikes
      dislikes = dislikes.filter((item) => !cleanIngredients.includes(item));

      // ➕ Agregar a likes sin duplicar
      for (const ing of cleanIngredients) {
        if (!likes.includes(ing)) likes.push(ing);
      }
    }

    if (action === 'dislike') {
      // 🧹 Quitar ingredientes de likes
      likes = likes.filter((item) => !cleanIngredients.includes(item));

      // ➕ Agregar a dislikes sin duplicar
      for (const ing of cleanIngredients) {
        if (!dislikes.includes(ing)) dislikes.push(ing);
      }
    }

    // 💾 Actualizar usuario
    console.log('Preferencias actualizadas:', { likes, dislikes });
    user.set({
      likes: [...likes],
      dislikes: [...dislikes],
    });

    // 🔥 Forzar marca de cambios
    user.changed('likes', true);
    user.changed('dislikes', true);

    await user.save({ fields: ['likes', 'dislikes'] });

    // 🧪 Verificar persistencia
    const refreshedUser = await User.findByPk(idUser);
    console.log('🔥 Guardado en DB ->', {
      likes: refreshedUser.likes,
      dislikes: refreshedUser.dislikes,
    });

    return res.status(200).json({
      ok: true,
      message: `Preferencia actualizada: ${action} a ${ingredients.join(', ')}`,
      likes,
      dislikes,
    });
  } catch (error) {
    console.error('❌ Error al actualizar preferencia de ingrediente:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
      error: error.message,
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { email } = req.user;
    const {
      name,
      lastName,
      age,
      weight,
      height,
      activityLevel,
      goal,
      allergies,
      likes,
      dislikes,
    } = req.body;
    console.log(`Creando nuevo usuario para ${email}:`, req.body);
    const newUser = await User.create({
      name,
      lastName,
      age,
      weight,
      height,
      activityLevel,
      goal,
      allergies,
      likes,
      dislikes,
      createdByAuthEmail: email,
    });
    console.log('Usuario creado con éxito:', newUser.id);
    return res.status(201).json({
      ok: true,
      message: 'Usuario creado con éxito',
      user: newUser,
      userId: newUser.id,
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al crear usuario',
      error: error.message,
    });
  }
};

export const updateGoalCalories = async (req, res) => {
  try {
    const { idUser } = req.params;
    const { goalCalories } = req.body;
    console.log(`Actualizando calorías objetivo para usuario ${idUser}:`, {
      goalCalories,
    });
    const user = await User.findByPk(idUser);
    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }
    console.log(`Calorías objetivo actuales: ${user.calorieGoal}`);
    console.log(`Nuevas calorías objetivo: ${goalCalories}`);
    user.calorieGoal = goalCalories;
    await user.save();
    return res.status(200).json({
      ok: true,
      message: 'Calorías objetivo actualizadas',
      userId: user.id,
      goalCalories: user.calorieGoal,
    });
  } catch (error) {
    console.error('❌ Error al actualizar calorías objetivo:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al actualizar calorías objetivo',
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { idUser } = req.params;
    const {
      age,
      weight,
      height,
      activityLevel,
      goal,
      allergies,
      likes,
      dislikes,
    } = req.body;

    console.log(`🛠 Actualizando usuario ${idUser}`, req.body);

    // 🔎 Buscar usuario
    const user = await User.findByPk(idUser);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }

    // ----------------------------
    // 🧼 Normalizar arrays
    // ----------------------------
    const cleanArray = (arr) => {
      if (!arr || !Array.isArray(arr)) return [];
      return arr.map((x) => x.trim()).filter((x) => x.length > 0);
    };

    const cleanAllergies = cleanArray(allergies);
    const cleanLikes = cleanArray(likes);
    const cleanDislikes = cleanArray(dislikes);

    // ----------------------------
    // 💾 Actualizar campos
    // ----------------------------
    user.age = age;
    user.weight = weight;
    user.height = height;
    user.activityLevel = activityLevel;
    user.goal = goal;
    user.allergies = cleanAllergies;
    user.likes = cleanLikes;
    user.dislikes = cleanDislikes;

    // 🔥 Forzar marca de cambios para arrays
    user.changed('allergies', true);
    user.changed('likes', true);
    user.changed('dislikes', true);

    await user.save({
      fields: [
        'age',
        'weight',
        'height',
        'activityLevel',
        'goal',
        'allergies',
        'likes',
        'dislikes',
      ],
    });

    console.log('✔ Usuario actualizado con éxito:', user.id);

    return res.status(200).json({
      ok: true,
      message: 'Usuario actualizado correctamente',
      userId: user.id,
      user,
    });
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error al actualizar usuario',
      error: error.message,
    });
  }
};
