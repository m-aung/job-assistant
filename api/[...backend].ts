import app from '../packages/backend/src/app';

// Vercel will treat this file as a Serverless Function and map all
// requests under /api/* to this handler because the filename is a
// catch-all route (`[...backend].ts`). The exported Express `app` is
// itself a function of (req, res), so exporting it directly works.

export default app;
