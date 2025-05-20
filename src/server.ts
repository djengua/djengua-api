// src/server.ts
import app from './app';
import connectDB from './config/db';

// Conectar a MongoDB
connectDB();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en modo ${process.env.NODE_ENV} en el puerto ${PORT}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err: Error) => {
  console.log(`Error: ${err.message}`);
  // Cerrar servidor y salir
  server.close(() => process.exit(1));
});