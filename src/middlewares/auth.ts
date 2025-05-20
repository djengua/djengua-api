// src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';
import User, { IUser } from '../models/user';

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

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Obtener token del header
    token = req.headers.authorization.split(' ')[1];
  }

  // Verificar que el token existe
  if (!token) {
    res.status(401).json({
      success: false,
      message: 'No autorizado para acceder a esta ruta'
    });
    return;
  }

  try {
    // Verificar token usando la función auxiliar
    const decoded = verifyToken(token) as DecodedToken;
    
    if (!decoded || !decoded.id) {
      res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
      return;
    }

    // Obtener usuario del token
    const user = await User.findById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Usuario no encontrado'
      });
      return;
    }

    // Si el usuario está inactivo
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Usuario inactivo. Contacte al administrador'
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'No autorizado para acceder a esta ruta'
    });
  }
};

// Middleware para restringir acceso solo a admin
export const authorize = (req: Request, res: Response, next: NextFunction): void => {
  console.log(req.user);
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'No autorizado para acceder a esta ruta, se requiere rol de admin'
    });
    return;
  }
  next();
};