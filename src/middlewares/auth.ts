// src/middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.utils";
import User, { IUser } from "../models/user";

// Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

interface DecodedToken {
  id: string;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token;

  // Verificar token en Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  // También verificar en cookies como alternativa
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  // Verificar que el token existe
  if (!token) {
    res.status(401).json({
      success: false,
      message: "No autorizado para acceder a esta ruta",
    });
    return;
  }

  try {
    // Verificar token usando la función auxiliar
    const decoded = verifyToken(token) as DecodedToken;

    if (!decoded || !decoded.id) {
      res.status(401).json({
        success: false,
        message: "Token inválido",
      });
      return;
    }

    // Obtener usuario del token
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Usuario no encontrado",
      });
      return;
    }

    // Si el usuario está inactivo
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: "Usuario inactivo. Contacte al administrador",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    let message = "No autorizado para acceder a esta ruta";

    // Mensajes más específicos según el tipo de error JWT
    if (error instanceof Error) {
      if (error.name === "TokenExpiredError") {
        message = "Token expirado";
      } else if (error.name === "JsonWebTokenError") {
        message = "Token inválido";
      }
    }

    res.status(401).json({
      success: false,
      message,
    });
  }
};

// Middleware para restringir acceso por roles
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Usuario no autenticado",
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Solo (${roles.join(" o ")}) puede realizar la operación.`,
      });
      return;
    }

    next();
  };
};

