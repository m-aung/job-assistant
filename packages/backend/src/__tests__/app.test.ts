import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Use shared Supabase mock (CommonJS) to avoid duplicating the implementation
vi.mock('../database/db', () => require('./__mocks__/db.cjs'));

import { app } from '../app';

describe('history endpoints (supabase mocked)', () => {
  it('creates and lists history entries', async () => {
    const payload = {
      type: 'cover',
      jobDescription: 'This is a test job description with enough length to pass validation',
      resume: 'Test resume',
      output: 'Generated content',
    };

    const createRes = await request(app).post('/api/history').send(payload).expect(200);
    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body).toHaveProperty('jobDescription');

    const listRes = await request(app).get('/api/history').expect(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBeGreaterThanOrEqual(1);
  });

  it('gets a single history entry by id', async () => {
    const createRes = await request(app)
      .post('/api/history')
      .send({ type: 'resume', jobDescription: 'JD', resume: 'R', output: 'O' })
      .expect(200);
    const id = createRes.body.id;
    const getRes = await request(app).get(`/api/history/${id}`).expect(200);
    expect(getRes.body).toHaveProperty('id', 1);
  });
});
