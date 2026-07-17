import request from 'supertest';
import app from '../src/app.js';
import { sequelize, Auth } from '../src/models/index.js';
import crypto from 'crypto';

describe('Auth Module', () => {
  const testUserData = {
    email: 'testuser@example.com',
    password: 'TestPassword123',
  };

  beforeAll(async () => {
    // Preparar la base de datos
    await sequelize.sync({ force: true });

    // Crear usuario de prueba con hash correcto (igual que en el controlador)
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto
      .pbkdf2Sync(testUserData.password, salt, 100000, 64, 'sha512')
      .toString('hex');

    await Auth.create({
      email: testUserData.email,
      passwordHash,
      salt,
    });
  });

  afterAll(async () => {
    // Limpiar todos los usuarios creados durante las pruebas
    const testEmails = [
      'testuser@example.com',
      'newuser@example.com',
      'test@example.com',
    ];

    try {
      // Eliminar usuarios de prueba uno por uno
      for (const email of testEmails) {
        await Auth.destroy({
          where: { email },
          force: true, // Forzar eliminación si hay soft deletes
        });
      }
    } catch {
      // Error silencioso para evitar problemas en el linting
      // pero la limpieza continúa
    }

    await sequelize.close();
  });

  // describe('POST /api/auth/register', () => {
  // it('should register a new user', async () => {
  //   const res = await request(app).post('/api/auth/register').send({
  //     email: 'newuser@example.com',
  //     password: 'NewUserPassword123',
  //   });
  //   expect(res.statusCode).toBe(201);
  //   expect(res.body).toHaveProperty(
  //     'message',
  //     'Usuario registrado con éxito'
  //   );
  //   expect(res.body).toHaveProperty('ok', true);
  // });
  // it('should not register with existing email', async () => {
  //   const res = await request(app).post('/api/auth/register').send({
  //     email: testUserData.email,
  //     password: 'AnotherPassword123',
  //   });
  //   expect(res.statusCode).toBe(400);
  //   expect(res.body).toHaveProperty('message', 'El correo ya está en uso');
  //   expect(res.body).toHaveProperty('ok', false);
  // });
  // it('should not register without email', async () => {
  //   const res = await request(app).post('/api/auth/register').send({
  //     password: 'NoEmailPassword123',
  //   });
  //   expect(res.statusCode).toBe(400);
  //   expect(res.body).toHaveProperty(
  //     'message',
  //     'Email y contraseña son requeridos'
  //   );
  //   expect(res.body).toHaveProperty('ok', false);
  // });
  // it('should not register without password', async () => {
  //   const res = await request(app).post('/api/auth/register').send({
  //     email: 'newuser@example.com',
  //   });
  //   expect(res.statusCode).toBe(400);
  //   expect(res.body).toHaveProperty(
  //     'message',
  //     'Email y contraseña son requeridos'
  //   );
  //   expect(res.body).toHaveProperty('ok', false);
  // });
  // });

  // describe('POST /api/auth/login', () => {
  // it('should login with correct credentials', async () => {
  //   const res = await request(app).post('/api/auth/login').send(testUserData);
  //   expect(res.statusCode).toBe(200);
  //   expect(res.body).toHaveProperty('message', 'Login exitoso');
  //   expect(res.body).toHaveProperty('ok', true);
  //   expect(res.body).toHaveProperty('token');
  //   expect(typeof res.body.token).toBe('string');
  // });
  // it('should not login with incorrect password', async () => {
  //   const res = await request(app).post('/api/auth/login').send({
  //     email: testUserData.email,
  //     password: 'WrongPassword',
  //   });
  //   expect(res.statusCode).toBe(400);
  //   expect(res.body).toHaveProperty('message', 'Credenciales inválidas');
  //   expect(res.body).toHaveProperty('ok', false);
  // });
  // it('should not login with non-existent email', async () => {
  //   const res = await request(app).post('/api/auth/login').send({
  //     email: 'nonexistent@example.com',
  //     password: 'AnyPassword',
  //   });
  //   expect(res.statusCode).toBe(400);
  //   expect(res.body).toHaveProperty('message', 'Credenciales inválidas');
  //   expect(res.body).toHaveProperty('ok', false);
  // });
  // it('should not login without email', async () => {
  //   const res = await request(app).post('/api/auth/login').send({
  //     password: 'TestPassword123',
  //   });
  //   expect(res.statusCode).toBe(500);
  //   expect(res.body).toHaveProperty('error');
  //   expect(res.body).toHaveProperty('ok', false);
  // });
  // it('should not login without password', async () => {
  //   const res = await request(app).post('/api/auth/login').send({
  //     email: testUserData.email,
  //   });
  //   expect(res.statusCode).toBe(500);
  //   expect(res.body).toHaveProperty('error');
  //   expect(res.body).toHaveProperty('ok', false);
  // });
  // });

  // describe('POST /api/auth/forgot-password', () => {
  // it('should send reset email for existing user', async () => {
  //   const res = await request(app).post('/api/auth/forgot-password').send({
  //     email: testUserData.email,
  //   });
  //   expect(res.statusCode).toBe(200);
  //   expect(res.body).toHaveProperty(
  //     'message',
  //     'Correo de restablecimiento enviado'
  //   );
  //   expect(res.body).toHaveProperty('ok', true);
  //   // Verificar que se guardó el token en la base de datos
  //   const updatedUser = await Auth.findOne({
  //     where: { email: testUserData.email },
  //   });
  //   expect(updatedUser.resetPasswordToken).toBeTruthy();
  //   expect(updatedUser.resetPasswordExpires).toBeTruthy();
  // });
  // it('should return error for non-existent email', async () => {
  //   const res = await request(app).post('/api/auth/forgot-password').send({
  //     email: 'nonexistent@example.com',
  //   });
  //   expect(res.statusCode).toBe(404);
  //   expect(res.body).toHaveProperty('message', 'Usuario no encontrado');
  // });
  // it('should return error without email', async () => {
  //   const res = await request(app).post('/api/auth/forgot-password').send({});
  //   expect(res.statusCode).toBe(500);
  //   expect(res.body).toHaveProperty('error');
  //   expect(res.body).toHaveProperty('ok', false);
  // });
  // });

  describe('POST /api/auth/verify-pin', () => {
    let resetPin;
    beforeEach(async () => {
      // Configurar PIN de reset para las pruebas
      resetPin = '123456';
      const expires = new Date(Date.now() + 3600000); // 1 hora
      await Auth.update(
        {
          resetPasswordToken: resetPin,
          resetPasswordExpires: expires,
        },
        { where: { email: testUserData.email } }
      );
    });
    it('should verify correct PIN', async () => {
      const res = await request(app).post('/api/auth/verify-pin').send({
        email: testUserData.email,
        pin: resetPin,
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'PIN verificado con éxito');
      expect(res.body).toHaveProperty('ok', true);
    });
    it('should reject incorrect PIN', async () => {
      const res = await request(app).post('/api/auth/verify-pin').send({
        email: testUserData.email,
        pin: '999999',
      });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'PIN inválido o expirado');
      expect(res.body).toHaveProperty('ok', false);
    });
    it('should reject PIN for non-existent user', async () => {
      const res = await request(app).post('/api/auth/verify-pin').send({
        email: 'nonexistent@example.com',
        pin: resetPin,
      });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message', 'PIN inválido o expirado');
      expect(res.body).toHaveProperty('ok', false);
    });
  });

  // describe('POST /api/auth/reset-password', () => {
  // const newPassword = 'NewSecurePassword123';
  // beforeEach(async () => {
  //   // Configurar token válido para reset
  //   const resetPin = '123456';
  //   const expires = new Date(Date.now() + 3600000);
  //   await Auth.update(
  //     {
  //       resetPasswordToken: resetPin,
  //       resetPasswordExpires: expires,
  //     },
  //     { where: { email: testUserData.email } }
  //   );
  // });
  // it('should reset password successfully', async () => {
  //   const res = await request(app).post('/api/auth/reset-password').send({
  //     email: testUserData.email,
  //     newPassword,
  //   });
  //   expect(res.statusCode).toBe(200);
  //   expect(res.body).toHaveProperty(
  //     'message',
  //     'Password has been reset successfully'
  //   );
  //   expect(res.body).toHaveProperty('ok', true);
  //   // Verificar que el token fue limpiado
  //   const updatedUser = await Auth.findOne({
  //     where: { email: testUserData.email },
  //   });
  //   expect(updatedUser.resetPasswordToken).toBeNull();
  //   expect(updatedUser.resetPasswordExpires).toBeNull();
  //   // Verificar que se puede hacer login con la nueva contraseña
  //   const loginRes = await request(app).post('/api/auth/login').send({
  //     email: testUserData.email,
  //     password: newPassword,
  //   });
  //   expect(loginRes.statusCode).toBe(200);
  //   expect(loginRes.body).toHaveProperty('ok', true);
  // });
  // it('should return error for non-existent user', async () => {
  //   const res = await request(app).post('/api/auth/reset-password').send({
  //     email: 'nonexistent@example.com',
  //     newPassword,
  //   });
  //   expect(res.statusCode).toBe(404);
  //   expect(res.body).toHaveProperty('message', 'Usuario no encontrado');
  //   expect(res.body).toHaveProperty('ok', false);
  // });
  // it('should return error without email', async () => {
  //   const res = await request(app).post('/api/auth/reset-password').send({
  //     newPassword,
  //   });
  //   expect(res.statusCode).toBe(400);
  //   expect(res.body).toHaveProperty(
  //     'message',
  //     'Email y nueva contraseña son requeridos'
  //   );
  //   expect(res.body).toHaveProperty('ok', false);
  // });
  // it('should return error without new password', async () => {
  //   const res = await request(app).post('/api/auth/reset-password').send({
  //     email: testUserData.email,
  //   });
  //   expect(res.statusCode).toBe(400);
  //   expect(res.body).toHaveProperty(
  //     'message',
  //     'Email y nueva contraseña son requeridos'
  //   );
  //   expect(res.body).toHaveProperty('ok', false);
  // });
  // });
});
