import request from 'supertest';
import app from '../src/app.js';

describe('App Initialization', () => {
  it('should respond to GET /api/health with 200', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
