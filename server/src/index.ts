import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes          from './routes/auth';
import schoolsRoutes       from './routes/schools';
import competitionsRoutes  from './routes/competitions';
import usersRoutes         from './routes/users';
import notificationsRoutes from './routes/notifications';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth',          authRoutes);
app.use('/api/schools',       schoolsRoutes);
app.use('/api/competitions',  competitionsRoutes);
app.use('/api/users',         usersRoutes);
app.use('/api/notifications', notificationsRoutes);

app.listen(PORT, () => {
  console.log(`✦ Admin API running on http://localhost:${PORT}`);
});

export default app;
