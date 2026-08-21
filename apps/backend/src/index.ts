import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import { resumeRouter } from './routes/resume';
import { jobsRouter } from './routes/jobs';
import { kbRouter } from './routes/kb';
import { historyRouter } from './routes/history';
import { authRouter } from './routes/auth';
import { initCollection } from './kb/knowledgeBase';

const app = express();
const PORT = process.env.PORT ?? 4001;

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(passport.initialize());

// Public auth routes
app.use('/api/auth', authRouter);

// Protected routes (will add authentication middleware to each)
app.use('/api/resume', resumeRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/kb', kbRouter);
app.use('/api/history', historyRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

async function start() {
  await initCollection();
  app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
}

start().catch(console.error);
