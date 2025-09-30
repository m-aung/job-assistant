import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import fs from 'fs';
import path from 'path';

// Ensure local DB is used (db.ts chooses local DB when SUPABASE_URL/ANON not set)
process.env.OPENAI_API_KEY = 'test-openai-key';

// Mock the OpenAI module before importing the app so the module-scoped client is created from the mock
vi.mock('openai', () => {
  return {
    default: class OpenAI {
      chat = {
        completions: {
          create: async ({
            messages,
          }: {
            messages?: Array<{ role: string; content?: string }>;
          }) => {
            // Return a deterministic response that includes user message content
            const user = messages?.find((m) => m.role === 'user')?.content ?? '';
            return {
              choices: [
                {
                  message: {
                    content: `MOCKED: processed: ${user}`,
                  },
                },
              ],
            };
          },
        },
      };
      constructor() {}
    },
  };
});

// Use shared Supabase mock (CommonJS) to avoid duplicating the implementation
vi.mock('../database/db', () => require('./__mocks__/db.cjs'));

import { app } from '../app';

const dataDir = path.join(process.cwd(), 'data');
const filePath = path.join(dataDir, 'history.json');

beforeEach(() => {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
});

describe('AI endpoints (mocked OpenAI, local DB)', () => {
  it('generates a cover letter and saves history', async () => {
    const payload = {
      jobDescription:
        'This is a test job description that is long enough to pass the validator (over 30 chars).',
      resume: 'Test resume text',
    };

    const res = await request(app).post('/api/cover-letter').send(payload).expect(200);
    expect(res.body).toHaveProperty('coverLetter');
    expect(typeof res.body.coverLetter).toBe('string');
    expect(res.body.coverLetter).toContain('MOCKED: processed:');
    expect(res.body).toHaveProperty('historyId');
  });

  it('rewrites a resume and saves history', async () => {
    const payload = {
      jobDescription:
        'Another test job description that is long enough to pass the validator (over 30 chars).',
      resume: 'Some resume text',
    };

    const res = await request(app).post('/api/resume').send(payload).expect(200);
    expect(res.body).toHaveProperty('rewrittenResume');
    expect(typeof res.body.rewrittenResume).toBe('string');
    expect(res.body.rewrittenResume).toContain('MOCKED: processed:');
    expect(res.body).toHaveProperty('historyId');
  });

  it('returns 400 when jobDescription is too short', async () => {
    const payload = { jobDescription: 'short', resume: 'x' };
    await request(app).post('/api/cover-letter').send(payload).expect(400);
    await request(app).post('/api/resume').send(payload).expect(400);
  });
});
