import cors from 'cors';
import express from 'express';
import authRouter from './routes/auth';
import draftPlansRouter from './routes/draftPlans';
import heroesRouter from './routes/heroes';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/draft-plans', draftPlansRouter);
app.use('/api/heroes', heroesRouter);
