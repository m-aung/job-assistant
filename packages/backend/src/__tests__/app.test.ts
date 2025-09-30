import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const filePath = path.join(dataDir, 'history.json');

// Ensure a clean local DB file before each test when running with useLocalDb
beforeEach(() => {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
});

describe('history endpoints (local db)', () => {
  it('creates and lists history entries', async () => {
    const payload = {
      type: 'cover',
      jobDescription: 'This is a test job description with enough length to pass validation',
      resume: 'Test resume',
      output: 'Generated content',
    };

    // create
    const createRes = await request(app).post('/api/history').send(payload).expect(200);
    expect(createRes.body).toHaveProperty('id');
    expect(createRes.body).toHaveProperty('jobDescription', payload.jobDescription);

    // list
    const listRes = await request(app).get('/api/history').expect(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBeGreaterThanOrEqual(1);
    expect(listRes.body[0]).toHaveProperty('jobDescription', payload.jobDescription);
  });

  it('gets a single history entry by id', async () => {
    const payload = {
      type: 'resume',
      jobDescription: 'Another test description with enough length to pass validation',
      resume: 'Resume text',
      output: 'Output here',
    };

    const createRes = await request(app).post('/api/history').send(payload).expect(200);
    const id = createRes.body.id;

    const getRes = await request(app).get(`/api/history/${id}`).expect(200);
    expect(getRes.body).toHaveProperty('id', id);
    expect(getRes.body).toHaveProperty('jobDescription', payload.jobDescription);
  });
});
