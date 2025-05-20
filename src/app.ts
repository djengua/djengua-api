// src/app.ts
import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

// Importar rutas
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(helmet());

// Logging en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Ruta de inicio
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'API REST con TypeScript, MongoDB y JWT para gestión de usuarios'
  });
});

// Manejo de rutas no encontradas
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Recurso no encontrado'
  });
});

export default app;