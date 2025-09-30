import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Auth from '../models/Auth.js';
import transporter from '../utils/emails.js';

export const forgotPassword = async (req, res) => {
  // console.log('Received forgotPassword request with body:', req.body);
  const { email } = req.body;
  // Logic to handle forgot password
  try {
    const user = await Auth.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Generar PIN de 6 dígitos
    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 3600000); // 1 hora

    user.resetPasswordToken = pin;
    user.resetPasswordExpires = expires;
    await user.save();

    // Enviar correo
    await transporter.sendMail({
      from: `"NutriKids" <${process.env.MAIL_USER}>`,
      to: email,
      subject: '🔑 Restablece tu contraseña en NutriKids',
      html: `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px; color: #333;">
    <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background: linear-gradient(90deg, #4CAF50, #8BC34A); padding: 20px; text-align: center; color: #fff;">
        <h1 style="margin: 0; font-size: 24px;">NutriKids 🍎</h1>
        <p style="margin: 0; font-size: 14px;">Creciendo saludables juntos</p>
      </div>
      
      <!-- Body -->
      <div style="padding: 30px;">
        <h2 style="color: #4CAF50; margin-bottom: 20px;">Hola 👋</h2>
        <p style="font-size: 16px; line-height: 1.6;">
          Has solicitado restablecer tu contraseña en <strong>NutriKids</strong>.  
          Para continuar, ingresa el siguiente <strong>PIN de 6 dígitos</strong> en la aplicación:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: #FF9800; color: white; padding: 20px 30px; border-radius: 12px; font-weight: bold; font-size: 24px; letter-spacing: 4px;">
            ${pin}
          </div>
        </div>
        
        <p style="font-size: 14px; color: #555;">
          Este PIN expirará en <strong>1 hora</strong>.  
          Si no solicitaste este cambio, puedes ignorar este correo con total seguridad.
        </p>
      </div>
      
      <!-- Footer -->
      <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        © 2025 NutriKids · Alimentando un futuro más saludable 🌱
      </div>
    </div>
  </div>
  `,
    });
    res.json({ message: 'Correo de restablecimiento enviado', ok: true });
  } catch (error) {
    // console.error('Error en forgotPassword:', error);
    res
      .status(500)
      .json({ error: 'Error al procesar la solicitud', ok: false });
  }
};

export const verifyPin = async (req, res) => {
  const { email, pin } = req.body;
  // console.log('Verifying PIN for email:', email, 'with PIN:', pin);
  // Logic to verify the PIN
  const user = await Auth.findOne({ where: { email } });
  if (!user || user.resetPasswordToken !== pin) {
    return res
      .status(400)
      .json({ message: 'PIN inválido o expirado', ok: false });
  }

  return res.json({ message: 'PIN verificado con éxito', ok: true });
};

export const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  // console.log('Resetting password for email:', email);
  // Logic to handle password reset
  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ message: 'Email y nueva contraseña son requeridos', ok: false });
  }
  const user = await Auth.findOne({ where: { email } });
  if (!user) {
    return res
      .status(404)
      .json({ message: 'Usuario no encontrado', ok: false });
  }

  // Hash new password
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto
    .pbkdf2Sync(newPassword, salt, 100000, 64, 'sha512')
    .toString('hex');

  user.passwordHash = passwordHash;
  user.salt = salt;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  res.json({ message: 'Password has been reset successfully', ok: true });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Auth.findOne({ where: { email } });
    // console.log('User found:', user);
    if (!user) {
      return res
        .status(400)
        .json({ message: 'Credenciales inválidas', ok: false });
    }

    const hashVerify = crypto
      .pbkdf2Sync(password, user.salt, 100000, 64, 'sha512')
      .toString('hex');

    if (hashVerify !== user.passwordHash) {
      // console.log('Password hash mismatch');
      return res
        .status(400)
        .json({ message: 'Credenciales inválidas', ok: false });
    }

    const token = jwt.sign(
      { email: user.email }, // payload (usa email como identificador, o mejor el id si tienes)
      process.env.JWT_SECRET, // clave secreta segura en .env
      { expiresIn: '1h' } // expira en 1 hora
    );

    return res.status(200).json({
      message: 'Login exitoso',
      ok: true,
      token,
    });
  } catch (error) {
    // console.error('Error en login:', error);
    return res
      .status(500)
      .json({ error: 'Error al procesar la solicitud', ok: false });
  }
};
