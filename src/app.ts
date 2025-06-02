// src/app.ts
import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

// Cargar variables de entorno
dotenv.config();

// Importar rutas
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/users.routes";
import companiesRoutes from "./routes/companies.routes";
import productsRoutes from "./routes/products.routes";
import categoriesRoutes from "./routes/categories.routes";

const app: Application = express();

const corsOptions = {
  origin: ["http://localhost", "http://localhost:3000", "http://localhost:3001", "https://djengua.com"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Permite cookies y autenticación
  maxAge: 86400, // Tiempo en segundos que los resultados de preflight pueden ser cacheados (1 día)
};

// Middlewares
app.use(express.json());
app.use(cors(corsOptions));
app.use(helmet());

// Logging en desarrollo
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/categories", categoriesRoutes);

// Ruta de inicio
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "API REST con TypeScript, MongoDB y JWT para gestión de usuarios",
  });
});

// Manejo de rutas no encontradas
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Recurso no encontrado",
  });
});

export default app;
