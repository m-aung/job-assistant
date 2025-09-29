import express, { json, Request, Response } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import OpenAI from 'openai';
import { insertHistory, listHistory, getHistory, deleteHistory, updateHistory } from './db';
import { validateJobDescription } from './middlewares/validators';
import { VercelRequest, VercelResponse } from '@vercel/node';

config();
const app = express();
app.use(cors());
app.use(json());

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
    const saved = insertHistory({
      type: 'cover',
      jobDescription: jobDescriptionStr,
      resume: resumeStr,
      output,
    });
    res.json({ coverLetter: output, historyId: saved.id });
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
    const saved = insertHistory({
      type: 'resume',
      jobDescription: jobDescriptionStr,
      resume: resumeStr,
      output,
    });
    res.json({ rewrittenResume: output, historyId: saved.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error rewriting resume' });
  }
});

// History endpoints
app.get('/api/history', (req: Request, res: Response) => {
  res.json(listHistory(50));
});

app.get('/api/history/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const e = getHistory(id);
  if (!e) return res.status(404).json({ error: 'Not found' });
  res.json(e);
});

app.post('/api/history', (req: Request, res: Response) => {
  const { type, jobDescription, resume, output } = req.body;
  if (!type || !output) return res.status(400).json({ error: 'Missing fields' });
  const e = insertHistory({
    type,
    jobDescription: jobDescription || '',
    resume: resume || '',
    output,
  });
  res.json(e);
});

app.put('/api/history/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const updated = updateHistory(id, req.body);
  if (!updated) return res.status(404).json({ error: 'Not found or no changes' });
  res.json(updated);
});

app.delete('/api/history/:id', (req, res) => {
  const id = Number(req.params.id);
  const ok = deleteHistory(id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// 👇 Export as a handler for Vercel
export default (req: VercelRequest, res: VercelResponse): ReturnType<typeof app> => {
  return app(req, res);
};

export { app };
