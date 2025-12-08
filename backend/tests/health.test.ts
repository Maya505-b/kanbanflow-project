import request from 'supertest';
import { app } from '../src/server';

describe('Health Check API', () => {
  test('GET /api/health should return 200 with correct data', async () => {
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('message', 'Backend is running');
    expect(response.body).toHaveProperty('timestamp');
  });

  test('GET /nonexistent should return 404', async () => {
    const response = await request(app).get('/nonexistent');
    expect(response.status).toBe(404);
  });
});
