import request from 'supertest';
import app from '../server';
import { pool } from '../server';

afterAll(async () => {
  await pool.end();
});

describe('GET /films', () => {
  it('should return all films', async () => {
    const res = await request(app).get('/films');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /categories', () => {
  it('should return all categories', async () => {
    const res = await request(app).get('/categories');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('POST /categories/update', () => {
  it('should accept newCategories and return success', async () => {
    const res = await request(app).post('/categories/update').send({
      newCategories: [],
      updatedCategories: [],
      deletedCategories: []
  });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should handle missing body gracefully', async () => {
    const res = await request(app).post('/categories/update').send({});
    expect(res.statusCode).toBe(500);
  });
});
