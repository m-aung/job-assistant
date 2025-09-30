import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Mock Supabase client used by the app
vi.mock('../database/db', () => {
  const now = new Date().toISOString();
  return {
    supabase: {
      from: () => ({
        insert: (rows: Array<Record<string, unknown>>) => ({
          select: () => ({
            single: async () => ({
              data: {
                id: 1,
                type: rows[0].type,
                job_description: rows[0].job_description,
                resume: rows[0].resume,
                output: rows[0].output,
                created_at: now,
              },
              error: null,
            }),
          }),
        }),
        select: () => ({
          limit: () => ({
            order: async () => ({
              data: [
                {
                  id: 1,
                  type: 'cover',
                  job_description: 'JD',
                  resume: 'R',
                  output: 'O',
                  created_at: now,
                },
              ],
              error: null,
            }),
          }),
          single: async () => ({
            data: {
              id: 1,
              type: 'cover',
              job_description: 'JD',
              resume: 'R',
              output: 'O',
              created_at: now,
            },
            error: null,
          }),
          eq: () => ({
            single: async () => ({
              data: {
                id: 1,
                type: 'cover',
                job_description: 'JD',
                resume: 'R',
                output: 'O',
                created_at: now,
              },
              error: null,
            }),
          }),
        }),
        delete: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }),
        update: () => ({
          select: () => ({
            single: async () => ({
              data: {
                id: 1,
                type: 'cover',
                job_description: 'JD',
                resume: 'R',
                output: 'O',
                created_at: now,
              },
              error: null,
            }),
          }),
        }),
        eq: () => ({
          single: async () => ({
            data: {
              id: 1,
              type: 'cover',
              job_description: 'JD',
              resume: 'R',
              output: 'O',
              created_at: now,
            },
            error: null,
          }),
        }),
      }),
    },
  };
});

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
