import User from '../models/User.js';

export const getUserById = async (req, res) => {
  try {
    // 🔹 id y email vienen del token
    const { id, email } = req.user;

    console.log('ID del usuario autenticado:', id);
    console.log('Email del usuario autenticado:', email);

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
    console.log('Total users:', totalUsers);
    res.json({ users: totalUsers, ok: true });
  } catch (error) {
    console.error('Error al obtener usuario por token:', error);
    res.status(500).json({ message: 'Error al obtener usuario', ok: false });
  }
};
