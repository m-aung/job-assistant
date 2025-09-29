import app from './app';

const port = process.env.PORT ? Number(process.env.PORT) : 7070;

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
