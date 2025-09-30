import express, { json, Request, Response } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import OpenAI from 'openai';
import { supabase } from './database/db';
import { validateJobDescription } from './middlewares/validators';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { HistoryRow, DbHistoryRow, DbHistoryUpdate } from './types';

config();
const app = express();
app.use(cors());
app.use(json());

// Helper: convert DB snake_case row to camelCase HistoryRow
function dbRowToHistory(r: DbHistoryRow): HistoryRow {
  return {
    id: r.id,
    type: r.type,
    jobDescription: r.job_description,
    resume: r.resume,
    output: r.output,
    createdAt: r.created_at,
  };
}

const openAiApiKey = process.env.OPENAI_API_KEY;
let client: OpenAI | null = null;
if (openAiApiKey) {
  client = new OpenAI({ apiKey: openAiApiKey });
} else {
  console.warn('OPENAI_API_KEY is not set — AI routes will return 500 until it is configured.');
}

// Generate Cover Letter
app.post('/api/cover-letter', validateJobDescription, async (req: Request, res: Response) => {
  try {
    const { jobDescription, resume } = req.body;
    const jobDescriptionStr = (jobDescription ?? '') as string;
    const resumeStr = (resume ?? '') as string;

    if (!client) return res.status(500).json({ error: 'OpenAI API key not configured' });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert career coach.' },
        {
          role: 'user',
          content: `Write a professional, personalized cover letter for this job description: \n\n${jobDescriptionStr}\n\nHere is the applicant's resume:\n${resumeStr}`,
        },
      ],
    });
    const output = (completion.choices[0].message.content ?? '') as string;
    const { data, error } = await supabase
      .from('history')
      .insert([
        {
          // insert expects an array — use snake_case column names for DB
          type: 'cover',
          job_description: jobDescriptionStr,
          resume: resumeStr,
          output,
        },
      ])
      .select('id, type, job_description, resume, output, created_at')
      .single();
    if (error) {
      console.error('Supabase insert error', error);
      return res.status(500).json({ error: 'Failed to save history' });
    }
    // convert returned row to camelCase for the API
    return res.json({
      coverLetter: output,
      historyId: data?.id,
      history: data ? dbRowToHistory(data as DbHistoryRow) : undefined,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error generating cover letter' });
  }
});

// Rewrite Resume
app.post('/api/resume', validateJobDescription, async (req: Request, res: Response) => {
  try {
    const { jobDescription, resume } = req.body;
    const jobDescriptionStr = (jobDescription ?? '') as string;
    const resumeStr = (resume ?? '') as string;

    if (!client) return res.status(500).json({ error: 'OpenAI API key not configured' });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert resume writer.' },
        {
          role: 'user',
          content: `Rewrite and optimize this resume for the following job description. Make it keyword-rich and ATS friendly.\n\nJob Description:\n${jobDescriptionStr}\n\nResume:\n${resumeStr}`,
        },
      ],
    });
    const output = (completion.choices[0].message.content ?? '') as string;
    const { data, error } = await supabase
      .from('history')
      .insert([
        {
          // insert expects an array — use snake_case column names for DB
          type: 'resume',
          job_description: jobDescriptionStr,
          resume: resumeStr,
          output,
        },
      ])
      .select('id, type, job_description, resume, output, created_at')
      .single();
    if (error) {
      console.error('Supabase insert error', error);
      return res.status(500).json({ error: 'Failed to save history' });
    }
    return res.json({
      rewrittenResume: output,
      historyId: data?.id,
      history: data ? dbRowToHistory(data as DbHistoryRow) : undefined,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error rewriting resume' });
  }
});

// History endpoints
app.get('/api/history', async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('history')
    .select('id, type, job_description, resume, output, created_at')
    .limit(50)
    .order('id', { ascending: false });
  if (error) {
    console.error('Supabase select error', error);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
  // convert rows to camelCase
  const rows = (data ?? []).map((r: DbHistoryRow) => dbRowToHistory(r));
  return res.json(rows);
});

app.get('/api/history/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { data, error } = await supabase
    .from('history')
    .select('id, type, job_description, resume, output, created_at')
    .eq('id', id)
    .single();
  if (error || !data) return res.status(404).json({ error: 'Not found' });
  return res.json({
    ...dbRowToHistory(data as DbHistoryRow),
  });
});

app.post('/api/history', async (req: Request, res: Response) => {
  const { type, jobDescription, resume, output } = req.body;
  if (!type || !output) return res.status(400).json({ error: 'Missing fields' });
  const { data, error } = await supabase
    .from('history')
    .insert([
      {
        type,
        job_description: jobDescription || '',
        resume: resume || '',
        output,
      },
    ])
    .select('id, type, job_description, resume, output, created_at')
    .single();
  if (error) {
    console.error('Supabase insert error', error);
    return res.status(500).json({ error: 'Failed to save history' });
  }
  return res.json({
    ...dbRowToHistory(data as DbHistoryRow),
  });
});

app.put('/api/history/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  // For updates, map camelCase keys in req.body to snake_case for DB
  const body = req.body as Partial<Omit<HistoryRow, 'id' | 'createdAt'>>;
  const dbUpdate: DbHistoryUpdate = {};
  if (body.type !== undefined) dbUpdate.type = body.type;
  if (body.jobDescription !== undefined) dbUpdate.job_description = body.jobDescription;
  if (body.resume !== undefined) dbUpdate.resume = body.resume;
  if (body.output !== undefined) dbUpdate.output = body.output;

  const { data, error } = await supabase
    .from('history')
    .update(dbUpdate)
    .eq('id', id)
    .select('id, type, job_description, resume, output, created_at')
    .single();
  if (error || !data) return res.status(404).json({ error: 'Not found or no changes' });
  return res.json({
    ...dbRowToHistory(data as DbHistoryRow),
  });
});

app.delete('/api/history/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { error } = await supabase.from('history').delete().eq('id', id).select().single();
  if (error) return res.status(404).json({ error: 'Not found' });
  return res.json({ ok: true });
});

// 👇 Export as a handler for Vercel
export default (req: VercelRequest, res: VercelResponse): ReturnType<typeof app> => {
  return app(req, res);
};

export { app };
