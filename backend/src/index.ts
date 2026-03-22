import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import adminRoutes from './routes/admin.routes';
import progressRoutes from './routes/progress.routes';
import aiRoutes from './routes/ai.routes';
import setupDb from './config/db';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: true, credentials: true })); // Allow all origins to support IP-based access
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('<h1>Welcome to LearnStack API</h1><p>The server is running correctly. Please visit <a href="http://localhost:3000">localhost:3000</a> for the frontend.</p>');
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Quest Academy API is running' });
});

// Initialize DB then start server
setupDb().then(() => {
  app.listen(port, () => {
    console.log(`✅ Server is running at http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
