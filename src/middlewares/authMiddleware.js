import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ message: 'Token no proporcionado', ok: false });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔹 Guardamos la info del token en req.user
    req.user = decoded; // contiene { email, id }
    console.log('Usuario autenticado:', req.user);
    next();
  } catch (error) {
    console.error('Error al verificar token:', error);
    return res
      .status(401)
      .json({ message: 'Token inválido o expirado', ok: false });
  }
};
